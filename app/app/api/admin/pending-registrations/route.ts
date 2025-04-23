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
        const pendingRegistrations = await db.pendingRegistration.findMany({
            where: { status: 'pending' },
            include: {
                user: {
                    select: {
                        email: true,
                    }
                }
            }
        });
        return NextResponse.json({ pendingRegistrations }, { status: 200 });
    } catch (error) {
        console.error("Error fetching pending registrations:", error);
        return NextResponse.json({ message: "Error fetching pending registrations" }, { status: 500 });
    }
}