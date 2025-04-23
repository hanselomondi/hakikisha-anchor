import { db } from "@/lib/db";
import { getAdminKeypair } from "@/lib/getAdminKeypair";
import { Connection, PublicKey, SystemProgram } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { NextResponse } from "next/server";
import { Idl, Wallet } from "@coral-xyz/anchor";
import idl from '@/app/idl/hakikisha.json';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const programId = new PublicKey('3bpsmdk6AE4foSTDLGpxNjb5eaYaVUaWLizyC9zouRAv');

export async function POST(request: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions)
    if (!session || !session.user.isAdmin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params;
    
    try {
        const pendingRegistration = await db.pendingRegistration.findUnique({
            where: { id: parseInt(id) },
            include: { user: true }
        });

        if (!pendingRegistration || pendingRegistration.status !== 'pending') {
            return NextResponse.json(
                { error: "Pending registration not found or already processed" },
                { status: 404 }
            );
        }

        // Solana interaction
        const connection = new Connection("https://localhost:8899", "confirmed");
        const adminKeyPair = getAdminKeypair();
        const provider = new anchor.AnchorProvider(connection, new Wallet(adminKeyPair), {});
        const program = new anchor.Program(
            idl as Idl,
            programId,
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
                .createManufacturer(businessName, licenseNumber)
                .accounts({
                    admin: adminKeyPair.publicKey,
                    manufacturer: manufacturerAccountPda,
                    manufacturerWallet: userPubkey,
                    systemProgram: SystemProgram.programId,
                })
                .signers([adminKeyPair])
                .rpc();
            console.log("Transaction signature", tx);
        } else if (role === 'retailer') {
            const [retailerAccountPda] = await PublicKey.findProgramAddressSync(
                [Buffer.from("retailer"), userPubkey.toBuffer()],
                program.programId
            );

            const tx = await program.methods
                .createRetailer(businessName, licenseNumber)
                .accounts({
                    admin: adminKeyPair.publicKey,
                    retailer: retailerAccountPda,
                    retailerWallet: userPubkey,
                    systemProgram: SystemProgram.programId,
                })
                .signers([adminKeyPair])
                .rpc();
            console.log("Transaction signature", tx);
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
            { error: "Error approving registration" },
            { status: 500 }
        );
    }
}