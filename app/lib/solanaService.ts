import { AnchorProvider, BN, Idl, Program } from "@coral-xyz/anchor";
import { Connection, PublicKey, SystemProgram } from "@solana/web3.js";
import idl from "@/app/idl/hakikisha.json";

const PROGRAM_ID = new PublicKey('3bpsmdk6AE4foSTDLGpxNjb5eaYaVUaWLizyC9zouRAv');

export class SolanaService {
    private provider: AnchorProvider;
    private program: Program;

    constructor(wallet: any) {
        const connection = new Connection("http://127.0.0.1:8899", "confirmed");
        this.provider = new AnchorProvider(connection, wallet, { commitment: "confirmed" });
        this.program = new Program(idl as Idl, programId, this.provider);
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

        const tx = await this.program.methods
            .transferProduct(productId, new PublicKey(retailerWallet))
            .accounts({
                currentOwner: this.provider.wallet.publicKey,
                productAccount: productAccountPda,
                newOwnerAccount: retailerAccountPda
            })
            .rpc();

        return tx;
    }
}