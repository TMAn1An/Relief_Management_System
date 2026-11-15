// Vercel build: generate the Prisma client, migrate + seed Turso when configured, then build.
import { spawnSync } from "node:child_process";

const run = (cmd, args, env = {}) => {
  const r = spawnSync(cmd, args, { stdio: "inherit", env: { ...process.env, ...env }, shell: process.platform === "win32" });
  if (r.status !== 0) process.exit(r.status ?? 1);
};

// The Prisma schema reads DATABASE_URL; generating the client doesn't need a real database.
run("npx", ["prisma", "generate"], { DATABASE_URL: process.env.DATABASE_URL || "file:./dev.db" });

if (process.env.TURSO_DATABASE_URL) {
  run("node", ["scripts/migrate-turso.mjs"]);
  if (process.env.SEED_ADMIN_EMAIL && process.env.SEED_ADMIN_PASSWORD) run("npx", ["tsx", "prisma/seed.ts"]);
} else {
  console.warn("⚠ TURSO_DATABASE_URL is not set — skipping migrations. The app needs a database to work.");
}

run("npx", ["next", "build"]);
