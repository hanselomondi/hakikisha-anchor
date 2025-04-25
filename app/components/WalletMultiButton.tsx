"use client";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Wallet } from "lucide-react";

export default function WalletButtonClient() {
    const { publicKey, wallet, disconnect } = useWallet();

    // Showing the first 4 and last 4 characters of the wallet address
    const formatWalletAddress = (address: string) => {
        return `${address.slice(0, 4)}...${address.slice(-4)}`;
    };

    return (
        <div className="hidden md:flex">
            <WalletMultiButton className="bg-indigo-600 hover:bg-indigo-700 transition-all flex items-center gap-4 px-4">
                <Wallet className="h-4 w-4 px-0.5" />
                {publicKey ? formatWalletAddress(publicKey.toString()) : "Connect Wallet"}
            </WalletMultiButton>
        </div>
    );
}