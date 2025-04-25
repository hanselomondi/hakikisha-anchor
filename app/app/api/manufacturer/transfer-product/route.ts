import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "manufacturer") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { productId, retailerWallet } = body;

        const product = await db.product.findFirst({
            where: { productId, manufacturerId: session.user.id, status: "active" },
        });
        if (!product) {
            return NextResponse.json({ error: "Product not found or already transferred" }, { status: 404 });
        }

        const transfer = await db.productTransfer.create({
            data: {
                productId: product.id,
                retailerWallet,
                transferDate: new Date(),
            },
        });

        await db.product.update({
            where: { id: product.id },
            data: { status: "transferred", owner: retailerWallet },
        });

        return NextResponse.json(transfer, { status: 201 });
    } catch (error) {
        console.error("Error transferring product:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}