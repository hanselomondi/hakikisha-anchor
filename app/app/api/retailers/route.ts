import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "manufacturer") {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const retailers = await db.user.findMany({
            where: {
                role: "retailer",
                verificationStatus: "approved",
            },
            select: {
                id: true,
                businessName: true,
                walletAddress: true,
            },
        });

        return NextResponse.json(retailers, { status: 200 });
    } catch (error) {
        console.error("Error fetching retailers:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}