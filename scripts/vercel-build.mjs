// Vercel build: generate client, apply migrations + seed the admin when a database is attached, then build.
import { spawnSync } from "node:child_process";

const run = (cmd, args) => {
  const r = spawnSync(cmd, args, { stdio: "inherit", shell: process.platform === "win32" });
  if (r.status !== 0) process.exit(r.status ?? 1);
};

// Neon's Vercel integration provides DATABASE_URL (pooled) and DATABASE_URL_UNPOOLED; Prisma reads DATABASE_URL.
run("npx", ["prisma", "generate"]);

if (process.env.DATABASE_URL) {
  run("npx", ["prisma", "migrate", "deploy"]);
  if (process.env.SEED_ADMIN_EMAIL && process.env.SEED_ADMIN_PASSWORD) run("npx", ["tsx", "prisma/seed.ts"]);
} else {
  console.warn("⚠ DATABASE_URL is not set — skipping migrations. Attach a Postgres database and redeploy.");
}

run("npx", ["next", "build"]);
