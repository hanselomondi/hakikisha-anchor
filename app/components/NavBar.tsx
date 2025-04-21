"use client";

import Link from "next/link";
import { useState } from "react";
import { Shield, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import WalletConnect from "@/lib/WalletConnect";
import { supabase } from "@/lib/supabase";

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/sign-in";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between px-5">
        <div className="flex items-center gap-2">
          <Link href="/">
            <div className="flex items-center space-x-3">
              <Shield className="h-6 w-6 text-indigo-600" />
              <span className="text-xl font-bold text-indigo-700">Hakikisha</span>
            </div>
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium text-indigo-900 hover:text-indigo-700">
            Home
          </Link>
          <Link href="/about" className="text-sm font-medium text-indigo-900 hover:text-indigo-700">
            About
          </Link>
          <Link href="/sign-up" className="text-sm font-medium text-gray-600 hover:text-indigo-700">
            Sign Up
          </Link>
          <Link href="/sign-in" className="text-sm font-medium text-gray-600 hover:text-indigo-700">
            Login
          </Link>
          <Link href="/admin/login" className="text-sm font-medium text-gray-600 hover:text-indigo-700">
            Admin
          </Link>
          <WalletConnect />
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            Sign Out
          </Button>
        </nav>
        <div className="md:hidden flex items-center gap-4">
          <WalletConnect />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b">
          <nav className="container flex flex-col gap-4 py-4">
            <Link href="/" className="text-sm font-medium text-indigo-900 hover:text-indigo-700">
              Home
            </Link>
            <Link href="/about" className="text-sm font-medium text-indigo-900 hover:text-indigo-700">
              About
            </Link>
            <Link href="/sign-up" className="text-sm font-medium text-gray-600 hover:text-indigo-700">
              Sign Up
            </Link>
            <Link href="/sign-in" className="text-sm font-medium text-gray-600 hover:text-indigo-700">
              Login
            </Link>
            <Link href="/admin/login" className="text-sm font-medium text-gray-600 hover:text-indigo-700">
              Admin
            </Link>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              Sign Out
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}