import { Shield } from "lucide-react";
import Link from "next/link";
import WalletButtonClient from "./WalletMultiButton";
import { Button } from "./ui/button";
import { signOut } from "next-auth/react";

const UserNavBar = () => {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm">
            <div className="container flex h-16 items-center justify-between px-5">
                <Link href="/" className="flex items-center gap-2">
                    <Shield className="h-6 w-6 text-indigo-600" />
                    <span className="text-xl font-bold text-indigo-700">Hakikisha</span>
                </Link>
                <div className="flex items-center gap-4">
                    <WalletButtonClient />
                    <Button onClick={() => signOut({
                        redirect: true,
                        callbackUrl: `${window.location.origin}/sign-in`
                    })} variant='destructive'>
                        Sign Out
                    </Button>
                </div>
            </div>
        </header>
    );
};

export default UserNavBar;