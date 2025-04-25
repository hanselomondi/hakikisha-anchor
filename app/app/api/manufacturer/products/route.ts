import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "manufacturer") {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const products = await db.product.findMany({
            where: { manufacturerId: session.user.id },
        });
        console.log("Products", products);
        // Convert BigInt fields to strings for JSON serialization
        const serializedProducts = products.map(product => ({
            ...product,
            productionDate: product.productionDate.toString(), // Convert BigInt to string
            batchNumber: product.batchNumber.toString(), // Convert BigInt to string (if batchNumber is also a BigInt)
        }));
        console.log("Serialized Products", serializedProducts);
        return NextResponse.json(serializedProducts, { status: 200 });
    } catch (error) {
        console.error("Error fetching products:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "manufacturer") {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { productId, batchNumber, name, description, productionDate, blockchainAccount } = body;

        // Validate required fields
        if (!productId || !batchNumber || !name || !productionDate || !blockchainAccount) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        const productionDateTimestamp = parseInt(productionDate, 10);
        if (isNaN(productionDateTimestamp)) {
            return NextResponse.json({ message: "Invalid production date" }, { status: 400 });
        }

        const product = await db.product.create({
            data: {
                productId,
                batchNumber: parseInt(batchNumber, 10),
                name,
                description,
                productionDate: productionDateTimestamp, // Store as Unix timestamp
                status: "active",
                owner: session.user?.walletAddress ?? "",
                blockchainAccount,
                manufacturerId: session.user.id,
            },
        });

        // Convert BigInt fields to strings for the response
        const serializedProduct = {
            ...product,
            productionDate: product.productionDate.toString(),
            batchNumber: product.batchNumber.toString(),
        };

        return NextResponse.json(serializedProduct, { status: 201 });
    } catch (error) {
        console.error("Error creating product:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}