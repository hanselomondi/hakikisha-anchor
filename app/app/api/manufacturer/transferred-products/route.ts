import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "manufacturer") {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const transferredProducts = await db.productTransfer.findMany({
            where: { product: { manufacturerId: session.user.id } },
            include: { product: { select: { productId: true, name: true } } },
        });
        return NextResponse.json(
            transferredProducts.map((t) => ({
                id: t.id,
                productId: t.product.productId,
                name: t.product.name,
                retailerWallet: t.retailerWallet,
                transferDate: t.transferDate.toISOString(),
            })),
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching transferred products:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}