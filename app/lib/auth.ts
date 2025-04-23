import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { db } from "./db";
import { compare } from "bcrypt";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(db),
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: 'jwt'
    },
    pages: {
        signIn: "/sign-in",
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text", placeholder: "johndoe@gmail.com" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const existingUser = await db.user.findUnique({
                    where: { email: credentials?.email }
                });

                if (!existingUser) {
                    return null;
                }

                const passwordMatch = await compare(
                    credentials.password,
                    existingUser.password
                );
                if (!passwordMatch) {
                    return null;
                }

                return {
                    id: `${existingUser.id}`,
                    username: existingUser.username,
                    email: existingUser.email,
                    role: existingUser.role,
                    verificationStatus: existingUser.verificationStatus,
                    walletAddress: existingUser.walletAddress ?? undefined,
                    createdAt: existingUser.createdAt
                }
            }
        }),

        // Admin Credentials Provider
        CredentialsProvider({
            id: "admin-credentials",
            name: "Admin Credentials",
            credentials: {
                email: { label: "Email", type: "text", placeholder: "admin@email.com" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const existingAdmin = await db.admin.findUnique({
                    where: { email: credentials?.email }
                });

                if (!existingAdmin) {
                    return null;
                }

                const isValid = await compare(credentials.password, existingAdmin.password);
                if (!isValid) {
                    return null;
                }

                return {
                    id: `${existingAdmin.id}`,
                    email: existingAdmin.email,
                    createdAt: existingAdmin.createdAt,
                    isAdmin: true,
                }
            }
        })
    ],
    callbacks: {
        async session({ session, token }) {
            if (token.isAdmin) {
                session.user = {
                    id: token.id,
                    email: token.email,
                    isAdmin: true,
                }
            } else {
                session.user = {
                    id: token.id,
                    email: token.email,
                    role: token.role,
                    walletAddress: token.walletAddress,
                }
            }
            return session
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.email = user.email
                if (user.isAdmin) {
                    token.isAdmin = true
                } else {
                    token.role = user.role
                    token.walletAddress = user.walletAddress
                }
            }
            return token
        },
    },
};