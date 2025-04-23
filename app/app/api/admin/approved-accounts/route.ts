import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const session = await getServerSession(authOptions)
    if (!session || !session.user.isAdmin) {
        return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
    }
    
    try {
        const approvedAccounts = await db.user.findMany({
            where: { verificationStatus: 'approved' },
            select: {
                id: true,
                email: true,
                role: true,
                businessName: true,
                licenseNumber: true,
                walletAddress: true,
                verificationStatus: true,
                createdAt: true,
                updatedAt: true,
            }
        });
        return NextResponse.json({ approvedAccounts }, { status: 200 });
    } catch (error) {
        console.error("Error fetching approved accounts:", error);
        return NextResponse.json({ message: "Error fetching approved accounts" }, { status: 500 });
    }
}