import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const pendingRegistration = await db.pendingRegistration.findFirst({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(pendingRegistration || {}, { status: 200 });
    } catch (error) {
        console.error('Error fetching pending registration:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}