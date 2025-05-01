import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "retailer") {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const manufacturers = await db.user.findMany({
            where: {
                role: "manufacturer",
                verificationStatus: "approved",
            },
            select: {
                id: true,
                businessName: true,
            },
        });

        return NextResponse.json(manufacturers, { status: 200 });
    } catch (error) {
        console.error("Error fetching manufacturers:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}