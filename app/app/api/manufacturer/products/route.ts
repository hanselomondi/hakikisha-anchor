import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "manufacturer") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const products = await db.product.findMany({
            where: { manufacturerId: session.user.id },
        });
        return NextResponse.json(products, { status: 200 });
    } catch (error) {
        console.error("Error fetching products:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "manufacturer") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { productId, batchNumber, name, description, productionDate, blockchainAccount } = body;

        const product = await db.product.create({
            data: {
                productId,
                batchNumber: parseInt(body.batchNumber, 10),
                name,
                description,
                productionDate: parseInt(body.productionDate, 10), // Store as timestamp
                status: "active",
                owner: session.user.walletAddress,
                blockchainAccount,
                manufacturerId: session.user.id,
            },
        });
        return NextResponse.json(product, { status: 201 });
    } catch (error) {
        console.error("Error creating product:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}