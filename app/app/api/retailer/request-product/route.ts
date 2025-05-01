import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "retailer") {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { manufacturerId, productName, quantity } = body;

        if (!manufacturerId || !productName || !quantity || quantity <= 0) {
            return NextResponse.json({ message: "Missing or invalid required fields" }, { status: 400 });
        }

        const manufacturer = await db.user.findUnique({
            where: {
                id: manufacturerId,
                role: "manufacturer",
                verificationStatus: "approved",
            }
        });

        if (!manufacturer) {
            return NextResponse.json({ message: "Manufacturer not found or not approved" }, { status: 404 });
        }

        const productRequest = await db.productRequest.create({
            data: {
                retailerId: session.user.id,
                manufacturerId,
                productName,
                quantity,
                status: "pending",
            },
        });
        return NextResponse.json(productRequest, { status: 201 });
    } catch (error) {
        console.error("Error submitting product request: ", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}