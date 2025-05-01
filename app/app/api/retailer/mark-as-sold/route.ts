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
            where: {
                productId,
                owner: session.user.walletAddress,
                status: "transferred"
            }
        });

        if (!product) {
            return NextResponse.json({ message: "Product not found or not owned by retailer" }, { status: 404 });
        }

        // Update the product status in the database
        await db.product.update({
            where: { id: product.id },
            data: { status: "sold" },
        });

        return NextResponse.json({ success: true, message: "Product marked as sold successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error marking product as sold:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}