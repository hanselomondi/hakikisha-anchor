import NextAuth from "next-auth";

declare module "next-auth" {
    interface User {
        id: string;
        email: string;
        // Admin-specific field
        isAdmin?: boolean;
        // User-specific fields
        role?: string;
        walletAddress?: string;
    }

    interface Session {
        user: {
            id: string;
            email: string;
            // Admin-specific field
            isAdmin?: boolean;
            // User-specific fields
            role?: string;
            walletAddress?: string;
        };
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        email: string;
        // Admin-specific field
        isAdmin?: boolean;
        // User-specific fields
        role?: string;
        walletAddress?: string;
    }
}
