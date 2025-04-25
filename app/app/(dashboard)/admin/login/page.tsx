"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Shield, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { signIn } from "next-auth/react"

export default function AdminLogin() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [credentials, setCredentials] = useState({
        email: "",
        password: "",
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setCredentials((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const result = await signIn("admin-credentials", {
                redirect: false,
                email: credentials.email,
                password: credentials.password,
            })

            if (result?.error) {
                toast.error("Invalid credentials. Please try again.")
            } else {
                toast.success("Admin login successful!")
                router.push("/admin/home")
            }
        } catch (error) {
            console.error("Login error:", error)
            toast.error("An error occurred during login")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
            <div className="absolute top-4 left-4">
                <Link href="/" className="flex items-center gap-2">
                    <Shield className="h-6 w-6 text-indigo-600" />
                    <span className="text-xl font-bold text-indigo-700">Hakikisha</span>
                </Link>
            </div>

            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <div className="flex justify-center mb-4">
                        <div className="rounded-full bg-indigo-100 p-3">
                            <Lock className="h-6 w-6 text-indigo-600" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-center">Admin Portal</CardTitle>
                    <CardDescription className="text-center">
                        Secure access for Hakikisha administrative staff only
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="Enter admin email"
                                value={credentials.email}
                                onChange={handleChange}
                                required
                                className="border-gray-300 focus-visible:ring-indigo-600"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Enter admin password"
                                value={credentials.password}
                                onChange={handleChange}
                                required
                                className="border-gray-300 focus-visible:ring-indigo-600"
                            />
                        </div>
                        <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={isLoading}>
                            {isLoading ? (
                                <div className="flex items-center">
                                    <svg
                                        className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    Logging in...
                                </div>
                            ) : (
                                "Login to Admin Portal"
                            )}
                        </Button>
                    </form>
                    <div className="mt-4 text-center">
                        <p className="text-sm text-gray-600">This portal is restricted to authorized personnel only.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
