import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

async function uploadFile(file: File) {
    const { data, error } = await supabase.storage
        .from('documents')
        .upload(`licences/${file.name}`, file);
    if (error) throw error;
    const { publicURL } = supabase.storage
        .from('documents')
        .getPublicUrl(data.path);
    return publicURL;
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const formData = await request.formData();
    const businessName = formData.get('businessName') as string;
    const licenseNumber = formData.get('licenseNumber') as string;
    const role = formData.get('role') as Role;
    const walletAddress = formData.get('walletAddress') as string;
    const file = formData.get('file') as File;

    try {
        const documentUrl = await uploadFile(file);
        await db.pendingRegistration.create({
            data: {
                userId,
                businessName,
                licenseNumber,
                role,
                walletAddress,
                documentUrl,
                status: 'pending',
            }
        });

        await db.user.update({
            where: { id: userId },
            data: {
                verificationStatus: 'pending',
                walletAddress,
                businessName,
                licenseNumber,
                documentUrl
            }
        });

        return NextResponse.json({ success: true, message: "Registration submitted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error submitting registration:", error);
        return NextResponse.json({ error: "Error submitting registration" }, { status: 500 });
    }
}