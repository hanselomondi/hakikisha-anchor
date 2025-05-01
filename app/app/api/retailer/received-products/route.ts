import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "retailer") {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!session.user.walletAddress) {
        return NextResponse.json({ message: "Wallet address not found" }, { status: 400 });
    }

    try {
        const receivedProducts = await db.productTransfer.findMany({
            where: {
                retailerWallet: session.user.walletAddress,
            },
            include: {
                product: {
                    select: {
                        productId: true,
                        name: true,
                        description: true,
                        manufacturer: {
                            select: {
                                businessName: true,
                            },
                        },
                        status: true,
                    },
                },
            },
        });

        const formattedProducts = receivedProducts.map((transfer) => ({
            id: transfer.product.productId,
            name: transfer.product.name,
            description: transfer.product.description,
            manufacturer: transfer.product.manufacturer.businessName,
            dateReceived: transfer.transferDate.toISOString(),
            status: transfer.confirmed ? "Received" : "Pending",
        }));

        return NextResponse.json(formattedProducts, { status: 200 });
    } catch (error) {
        console.error("Error fetching received products:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}