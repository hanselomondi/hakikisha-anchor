import { db } from "@/lib/db";
import { hash } from "bcrypt";
import { NextResponse } from "next/server";
import * as z from "zod";

// User input validation
const userSchema = z
    .object({
        username: z.string().min(1, 'Username is required').max(100),
        email: z.string().min(1, 'Email is required').email('Invalid email'),
        password: z
            .string()
            .min(1, 'Password is required')
            .min(8, 'Password must have than 8 characters')
    })


export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { username, email, password } = userSchema.parse(body);

        // Check if the user already exists
        const existingUserByEmail = await db.user.findUnique({
            where: { email: email },
        });
        if (existingUserByEmail) {
            return NextResponse.json(
                { user: null, message: "Email already exists" },
                { status: 409 }
            );
        }

        // Check if the username already exists
        const existingUserByUsername = await db.user.findUnique({
            where: { username: username },
        });
        if (existingUserByUsername) {
            return NextResponse.json(
                { user: null, message: "Username already exists" },
                { status: 409 }
            );
        }
        // Create the user
        const hashedPassword = await hash(password, 10);
        const newUser = await db.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
            },
        });
        // Remove the password from the response
        const { password: _, ...userWithoutPassword } = newUser;
        // Return the user
        return NextResponse.json({ user: userWithoutPassword, message: "User registered successfully" }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Something went wrong! " }, { status: 500 });
    }
}