"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Wallet } from "lucide-react";

const WalletConnect = () => {
  const { publicKey } = useWallet();
  return (
    <div className="flex items-center gap-2">
      {publicKey && (
        <span className="text-sm text-gray-600">
          {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
        </span>
      )}
      <WalletMultiButton className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-all">
        <Wallet className="h-4 w-4" />
        {publicKey ? "Connected" : "Connect Wallet"}
      </WalletMultiButton>
    </div>
  );
};

export default WalletConnect;