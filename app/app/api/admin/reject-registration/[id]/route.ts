import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

export async function POST(request: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.isAdmin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const { rejectionReason } = await request.json();

    if (!rejectionReason) {
        return NextResponse.json(
            { error: "Rejection reason is required" },
            { status: 400 }
        );
    }

    try {
        const pendingRegistration = await db.pendingRegistration.findUnique({
            where: { id: parseInt(id) },
            include: { user: true }
        });

        if (!pendingRegistration || pendingRegistration.status !== 'pending') {
            return NextResponse.json(
                { error: "Pending registration not found or already processed" },
                { status: 404 }
            );
        }

        await db.$transaction([
            db.pendingRegistration.update({
                where: { id: parseInt(id) },
                data: { status: 'rejected' }
            }),
            db.user.update({
                where: { id: pendingRegistration.userId },
                data: {
                    verificationStatus: 'rejected',
                    walletAddress: null,
                    businessName: null,
                    licenseNumber: null
                }
            })
        ]);

        console.log(`Registration rejected for user: ${pendingRegistration.userId}, reason: ${rejectionReason}`);
        
        return NextResponse.json({ success: true, message: "Registration rejected successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error rejecting registration:", error);
        return NextResponse.json({ error: "Error rejecting registration" }, { status: 500 });
    }
}