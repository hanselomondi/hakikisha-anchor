import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// Initialize Supabase client with service role key for server-side operations
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function uploadFile(file: File) {
    const uniqueFileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
        .from("documents")
        .upload(`licences/${uniqueFileName}`, file);

    if (error) throw error;

    const { data: urlData } = supabase.storage
        .from("documents")
        .getPublicUrl(data.path);

    if (!urlData?.publicUrl) {
        throw new Error("Failed to retrieve public URL");
    }

    return urlData.publicUrl;
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const formData = await request.formData();
    const businessName = formData.get("businessName") as string;
    const licenseNumber = formData.get("licenseNumber") as string;
    const role = formData.get("role") as Role;
    const walletAddress = formData.get("walletAddress") as string;
    const file = formData.get("file") as File;

    // Validate input
    if (!businessName || !licenseNumber || !role || !walletAddress || !file) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    try {
        // Upload file to Supabase Storage
        const documentUrl = await uploadFile(file);

        // Perform database operations in a transaction
        await db.$transaction([
            db.pendingRegistration.create({
                data: {
                    userId,
                    businessName,
                    licenseNumber,
                    role,
                    walletAddress,
                    documentUrl,
                    status: "pending",
                },
            }),
            db.user.update({
                where: { id: userId },
                data: {
                    verificationStatus: "pending",
                    walletAddress,
                    businessName,
                    licenseNumber,
                    documentUrl,
                },
            }),
        ]);

        return NextResponse.json(
            { success: true, message: "Registration submitted successfully" },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Error submitting registration:", error);
        return NextResponse.json(
            { error: `Error submitting registration: ${error.message || "Unknown error"}` },
            { status: 500 }
        );
    }
}