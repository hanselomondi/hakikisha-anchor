"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield, User } from "lucide-react"
import Loading from "@/components/Loading"

export default function UserDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    // If not authenticated, redirect to sign-in
    if (status === "unauthenticated") {
      router.push("/sign-in")
    }

    // If authenticated but has a specific role, redirect to the appropriate dashboard
    if (status === "authenticated" && session) {
      const userRole = session.user?.role

      if (userRole === "manufacturer") {
        router.push("/manufacturer")
      } else if (userRole === "retailer") {
        router.push("/retailer")
      }
    }
  }, [session, status, router])

  // If still loading, show a loading spinner
  if (status === "loading") {
    return (
      <Loading />
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-indigo-600" />
            <span className="text-xl font-bold text-indigo-700">Hakikisha</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              <span>{session?.user?.email || "User"}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push("/api/auth/signout")}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 bg-gray-50 p-4">
        <div className="container max-w-4xl py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Welcome to Hakikisha</h1>
            <p className="mt-2 text-gray-600">Complete your profile to get started with blockchain verification.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-xl font-semibold mb-4">Register Your Account</h2>
              <p className="text-gray-600 mb-4">
                To use Hakikisha, you need to register your on-chain account. This will allow you to verify and track
                products on the blockchain.
              </p>
              <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
                <Link href="/register">Register Now</Link>
              </Button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-xl font-semibold mb-4">Learn More</h2>
              <p className="text-gray-600 mb-4">
                Discover how Hakikisha uses blockchain technology to ensure authenticity in the alcohol supply chain.
              </p>
              <Button variant="outline" className="border-indigo-200 text-indigo-600 hover:bg-indigo-50">
                View Documentation
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
