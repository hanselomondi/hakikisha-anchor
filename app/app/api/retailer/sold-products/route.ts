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
        console.log("Fetching sold products for wallet:", session.user.walletAddress);
        const soldProducts = await db.product.findMany({
            where: {
                owner: session.user.walletAddress,
                status: "sold",
            },
            select: {
                productId: true,
                name: true,
                updatedAt: true,
                description: true,
                manufacturer: {
                    select: {
                        businessName: true
                    }
                }
            },
        });
        console.log("Found sold products:", soldProducts);

        const formattedProducts = soldProducts.map((product) => ({
            id: product.productId,
            name: product.name,
            description: product.description || "No description available",
            manufacturer: product.manufacturer?.businessName || "Unknown Manufacturer",
            saleDate: product.updatedAt.toISOString(),
        }));

        return NextResponse.json(formattedProducts, { status: 200 });
    } catch (error) {
        console.error("Error fetching sold products:", error);
        // Include the error message in the response for debugging
        return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
    }
}