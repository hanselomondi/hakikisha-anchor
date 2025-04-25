import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const user = await db.user.findUnique({
        where: { id: userId },
        select: {
            verificationStatus: true,
            walletAddress: true,
            businessName: true,
            licenseNumber: true,
        }
    });

    const pendingRegistration = await db.pendingRegistration.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
    });

    if (pendingRegistration && pendingRegistration.status === 'pending') {
        return NextResponse.json({ status: 'pending' }, { status: 200 });
    } else if (user?.verificationStatus === 'approved') {
        return NextResponse.json({ status: 'approved' }, { status: 200 });
    } else if (user?.verificationStatus === 'rejected') {
        return NextResponse.json({ status: 'rejected' }, { status: 200 });
    } else {
        return NextResponse.json({ status: 'not_submitted' }, { status: 200 });
    }
}