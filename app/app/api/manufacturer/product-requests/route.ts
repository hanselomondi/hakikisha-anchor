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
        const requests = await db.productRequest.findMany({
            where: {
                manufacturerId: session.user.id,
                status: "pending",
            },
            include: {
                retailer: {
                    select: {
                        businessName: true,
                        email: true,
                        walletAddress: true,
                    }
                }
            }
        });

        const formattedRequests = requests.map((req) => ({
            id: req.id,
            productName: req.productName,
            quantity: req.quantity,
            retailer: req.retailer.businessName,
            retailerEmail: req.retailer.email,
            retailerWallet: req.retailer.walletAddress,
            requestDate: req.requestDate.toISOString(),
        }));
        return NextResponse.json(formattedRequests, { status: 200 });
    } catch (error) {
        console.error("Error fetching product requests:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}