import { db } from "@/lib/db";
import { getAdminKeypair } from "@/lib/getAdminKeypair";
import { Connection, PublicKey, SystemProgram } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { NextResponse } from "next/server";
import { Idl } from "@coral-xyz/anchor";
import idl from '@/app/idl/hakikisha.json';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";

const programId = new PublicKey('3bpsmdk6AE4foSTDLGpxNjb5eaYaVUaWLizyC9zouRAv');

export async function POST(request: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions)
    if (!session || !session.user.isAdmin) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params;

    try {
        const pendingRegistration = await db.pendingRegistration.findUnique({
            where: { id: parseInt(id) },
            include: { user: true }
        });

        if (!pendingRegistration || pendingRegistration.status !== 'pending') {
            return NextResponse.json(
                { message: "Pending registration not found or already processed" },
                { status: 404 }
            );
        }

        // Solana interaction
        const connection = new Connection("https://api.devnet.solana.com", "confirmed");
        const adminKeyPair = getAdminKeypair();
        const adminWallet = new NodeWallet(adminKeyPair);
        const provider = new anchor.AnchorProvider(connection, adminWallet, { commitment: "confirmed" });
        const program = new anchor.Program(
            idl as Idl,
            provider
        );
        const { role, businessName, licenseNumber, walletAddress } = pendingRegistration;
        const userPubkey = new PublicKey(walletAddress);

        if (role === 'manufacturer') {
            const [manufacturerAccountPda] = await PublicKey.findProgramAddressSync(
                [Buffer.from("manufacturer"), userPubkey.toBuffer()],
                program.programId
            );

            const tx = await program.methods
                .registerManufacturer(businessName, licenseNumber)
                .accounts({
                    admin: adminKeyPair.publicKey,
                    manufacturer: manufacturerAccountPda,
                    manufacturerWallet: userPubkey,
                    systemProgram: SystemProgram.programId,
                })
                .signers([adminKeyPair])
                .rpc();
            // Confirm the transaction
            const confirmation = await provider.connection.confirmTransaction(tx, "confirmed");
            if (confirmation.value.err) {
                throw new Error(`Transaction failed: ${confirmation.value.err}`);
            }
            console.log("Manufacturer registration transaction: ", tx);
        } else if (role === 'retailer') {
            const [retailerAccountPda] = await PublicKey.findProgramAddressSync(
                [Buffer.from("retailer"), userPubkey.toBuffer()],
                program.programId
            );

            const tx = await program.methods
                .registerRetailer(businessName, licenseNumber)
                .accounts({
                    admin: adminKeyPair.publicKey,
                    retailer: retailerAccountPda,
                    retailerWallet: userPubkey,
                    systemProgram: SystemProgram.programId,
                })
                .signers([adminKeyPair])
                .rpc();
            // Confirm the transaction
            const confirmation = await provider.connection.confirmTransaction(tx, "confirmed");
            if (confirmation.value.err) {
                throw new Error(`Transaction failed: ${confirmation.value.err}`);
            }
            console.log("Retailer registration transaction: ", tx);
        }

        // Update database
        await db.$transaction([
            db.pendingRegistration.update({
                where: { id: parseInt(id) },
                data: { status: 'approved' }
            }),
            db.user.update({
                where: { id: pendingRegistration.userId },
                data: {
                    verificationStatus: 'approved',
                    walletAddress: pendingRegistration.walletAddress,
                    businessName: pendingRegistration.businessName,
                    licenseNumber: pendingRegistration.licenseNumber,
                    documentUrl: pendingRegistration.documentUrl
                }
            })
        ])

        return NextResponse.json({ success: true, message: "Registration approved successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error approving registration:", error);
        return NextResponse.json(
            { message: "Error approving registration" },
            { status: 500 }
        );
    }
}