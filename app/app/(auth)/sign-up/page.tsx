"use client"

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import SignUpForm from "@/components/form/SignUpForm";
import AuthNavbar from "@/components/AuthNavBar";

export default function SignUpPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    // If the user is authenticated, redirect to the appropriate dashboard
    if (status === "authenticated" && session) {
      const userRole = session.user?.role || "user"

      if (userRole === "manufacturer") {
        router.push("/manufacturer")
      } else if (userRole === "retailer") {
        router.push("/retailer")
      } else {
        router.push("/user")
      }
    }
  }, [session, status, router])

  // If still loading, you could show a loading spinner
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen top-16">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  // If not authenticated, show the sign-up form
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <AuthNavbar />
      <div className="flex-1 flex mt-24 items-center justify-center">
        <SignUpForm />
      </div>
    </div>
  )
}
