// prisma/seed.ts
import { db } from "../lib/db";
import { hash } from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const adminPassword = await hash(process.env.ADMIN_PASSWORD!, 10); // Replace with secure password
  await db.admin.upsert({
    where: { email: "admin@hakikisha.com" },
    update: {},
    create: {
      email: "admin@hakikisha.com",
      password: adminPassword,
    },
  });
}

main().catch((e) => console.error(e)).finally(async () => await db.$disconnect());

// run as npx tsx prisma/seed.ts