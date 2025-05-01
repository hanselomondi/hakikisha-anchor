import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "retailer") {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!session.user.walletAddress) {
        return NextResponse.json({ message: "Wallet address not found" }, { status: 400 });
    }

    try {
        const body = await request.json();
        const { productId } = body;

        if (!productId) {
            return NextResponse.json({ message: "Missing required field: productId" }, { status: 400 });
        }

        const product = await db.product.findFirst({
            where: { productId },
        });

        if (!product) {
            return NextResponse.json({ message: "Product not found" }, { status: 404 });
        }

        const transfer = await db.productTransfer.findFirst({
            where: {
                productId: product.id,
                retailerWallet: session.user.walletAddress,
                confirmed: false,
            }
        });

        if (!transfer) {
            return NextResponse.json({ message: "Transfer not found or already confirmed" }, { status: 404 });
        }

        await db.productTransfer.update({
            where: { id: transfer.id },
            data: { confirmed: true },
        });

        return NextResponse.json({ message: "Receipt confirmed successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error confirming receipt:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}