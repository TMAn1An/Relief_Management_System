import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const email = (process.env.SEED_ADMIN_EMAIL ?? "").toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD ?? "";
  if (!email || password.length < 8) {
    throw new Error("Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD (min 8 characters) before seeding.");
  }
  const passwordHash = await bcrypt.hash(password, 12);
  await db.user.upsert({
    where: { email },
    create: { email, name: "Administrator", passwordHash, role: "ADMIN" },
    update: {},
  });
  console.log(`Admin ready: ${email}`);
}

main().finally(() => db.$disconnect());
