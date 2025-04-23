import { Keypair } from "@solana/web3.js";

export function getAdminKeypair(): Keypair {
    const secretKeyString = process.env.ADMIN_SECRET_KEY;
    if (!secretKeyString) {
        throw new Error("ADMIN_SECRET_KEY is not defined in the environment variables");
    }
    try {
        const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
        return Keypair.fromSecretKey(secretKey);
    } catch (error) {
        throw new Error("Failed to parse ADMIN_SECRET_KEY: " + error);
    }
}