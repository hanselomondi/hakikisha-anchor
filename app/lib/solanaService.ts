import { AnchorProvider, BN, Idl, Program } from "@coral-xyz/anchor";
import { Connection, PublicKey, SystemProgram } from "@solana/web3.js";
import idl from "@/app/idl/hakikisha.json";

const PROGRAM_ID = new PublicKey('3bpsmdk6AE4foSTDLGpxNjb5eaYaVUaWLizyC9zouRAv');

export class SolanaService {
    private provider: AnchorProvider;
    private program: Program;

    constructor(wallet: any) {
        if (!wallet || !wallet.publicKey) {
            throw new Error("Wallet is not connected or invalid");
        }
        const connection = new Connection("https://api.devnet.solana.com", "confirmed");
        this.provider = new AnchorProvider(connection, wallet, { commitment: "confirmed" });
        console.log("Provider initialized with wallet:", wallet.publicKey.toString());
        this.program = new Program(
            idl as Idl,
            this.provider
        );
    }

    async registerProduct(
        productId: string,
        batchNumber: number,
        productionDate: number,
        name: string,
        description: string
    ) {
        const [productAccountPda] = await PublicKey.findProgramAddressSync(
            [Buffer.from("product"), Buffer.from(productId)],
            PROGRAM_ID
        );

        const [manufacturerAccountPda] = await PublicKey.findProgramAddressSync(
            [Buffer.from("manufacturer"), this.provider.wallet.publicKey.toBuffer()],
            PROGRAM_ID
        );

        const tx = await this.program.methods
            .registerProduct(
                productId,
                new BN(batchNumber),
                new BN(productionDate),
                name,
                description
            )
            .accounts({
                manufacturer: this.provider.wallet.publicKey,
                product: productAccountPda,
                manufacturerAccount: manufacturerAccountPda,
                systemProgram: SystemProgram.programId,
            })
            .rpc();

        //  Confirm the transaction
        const confirmation = await this.provider.connection.confirmTransaction(tx, "confirmed");
        if (confirmation.value.err) {
            throw new Error(`Transaction failed: ${confirmation.value.err}`);
        }

        return { tx, productAccount: productAccountPda.toString() }
    }

    async transferProduct(
        productId: string,
        retailerWallet: string
    ) {
        const [productAccountPda] = await PublicKey.findProgramAddressSync(
            [Buffer.from("product"), Buffer.from(productId)],
            PROGRAM_ID
        );

        const [retailerAccountPda] = await PublicKey.findProgramAddressSync(
            [Buffer.from("retailer"), new PublicKey(retailerWallet).toBuffer()],
            PROGRAM_ID
        );

        // Check if the retailer account exists
        const retailerAccountInfo = await this.provider.connection.getAccountInfo(retailerAccountPda);
        if (!retailerAccountInfo) {
            throw new Error("Retailer account does not exist. The retailer must first initialise their account.");
        }

        const tx = await this.program.methods
            .transferProduct(productId, new PublicKey(retailerWallet))
            .accounts({
                currentOwner: this.provider.wallet.publicKey,
                productAccount: productAccountPda,
                newOwnerAccount: retailerAccountPda
            })
            .rpc();

        // Confirm the transaction
        const confirmation = await this.provider.connection.confirmTransaction(tx, "confirmed");
        if (confirmation.value.err) {
            throw new Error(`Transaction failed: ${confirmation.value.err.toString()}`);
        }

        return tx;
    }

    async markAsSold(productId: string) {
        const [productAccountPda] = await PublicKey.findProgramAddressSync(
            [Buffer.from("product"), Buffer.from(productId)],
            PROGRAM_ID
        );

        const [retailerAccountPda] = await PublicKey.findProgramAddressSync(
            [Buffer.from("retailer"), this.provider.wallet.publicKey.toBuffer()],
            PROGRAM_ID
        );

        const tx = await this.program.methods
            .markAsSold(productId)
            .accounts({
                retailer: this.provider.wallet.publicKey,
                productAccount: productAccountPda,
                retailerAccount: retailerAccountPda
            })
            .rpc();

        // Confirm the transaction
        const confirmation = await this.provider.connection.confirmTransaction(tx, "confirmed");
        if (confirmation.value.err) {
            throw new Error(`Transaction failed: ${confirmation.value.err}`);
        }
        return tx;
    }
}