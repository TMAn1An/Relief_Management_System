// Applies prisma/migrations/*/migration.sql to a Turso (libSQL) database, once each, in order.
// `prisma migrate deploy` cannot talk to libsql:// URLs, so this is the production migration runner.
import { createClient } from "@libsql/client";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const url = process.env.TURSO_DATABASE_URL;
if (!url) throw new Error("TURSO_DATABASE_URL is not set");
const db = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });

await db.execute(
  "CREATE TABLE IF NOT EXISTS _applied_migrations (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)",
);
const done = new Set((await db.execute("SELECT name FROM _applied_migrations")).rows.map((r) => String(r.name)));

const dir = join(process.cwd(), "prisma", "migrations");
const names = readdirSync(dir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(join(dir, d.name, "migration.sql")))
  .map((d) => d.name)
  .sort();

for (const name of names) {
  if (done.has(name)) continue;
  const sql = readFileSync(join(dir, name, "migration.sql"), "utf8");
  // Strip comment lines, then split on statement terminators (Prisma's SQLite output has no ';' inside strings).
  const statements = sql
    .split("\n")
    .filter((l) => !l.trim().startsWith("--"))
    .join("\n")
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
  await db.batch(
    [...statements.map((sql) => ({ sql, args: [] })), { sql: "INSERT INTO _applied_migrations (name) VALUES (?)", args: [name] }],
    "write",
  );
  console.log(`Applied migration ${name} (${statements.length} statements)`);
}
console.log("Turso migrations up to date.");
db.close();
