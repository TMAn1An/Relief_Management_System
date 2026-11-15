import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createClient } from "@libsql/client";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql"; // node build: the web build used in production rejects file: URLs
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * Runs the limiter through the same libSQL driver adapter production uses (against a local file),
 * because it behaves differently from plain SQLite: it once bound numbers as floats and the limiter
 * silently failed open.
 */
const dir = mkdtempSync(join(tmpdir(), "rl-"));
const url = `file:${join(dir, "test.db")}`;

let rateLimit: typeof import("./rate-limit").rateLimit;
let clearRateLimit: typeof import("./rate-limit").clearRateLimit;

beforeAll(async () => {
  const c = createClient({ url });
  await c.execute('CREATE TABLE "RateLimit" ("key" TEXT NOT NULL PRIMARY KEY, "count" INTEGER NOT NULL, "resetAt" BIGINT NOT NULL)');
  c.close();
  // db.ts reuses a client from globalThis, so inject one that goes through the libSQL driver adapter.
  (globalThis as unknown as { prisma: PrismaClient }).prisma = new PrismaClient({ adapter: new PrismaLibSQL({ url }) });
  ({ rateLimit, clearRateLimit } = await import("./rate-limit"));
});

afterAll(() => rmSync(dir, { recursive: true, force: true }));

describe("rateLimit through the libSQL adapter", () => {
  it("allows up to the limit and then blocks (does not fail open)", async () => {
    for (let i = 0; i < 3; i++) expect(await rateLimit("t", "a", 3, 60)).toBeNull();
    expect(await rateLimit("t", "a", 3, 60)).toMatch(/Too many attempts/);
    expect(await rateLimit("t", "a", 3, 60)).toMatch(/Too many attempts/);
  });

  it("keeps identifiers independent", async () => {
    expect(await rateLimit("t", "other", 3, 60)).toBeNull();
  });

  it("can be cleared", async () => {
    await clearRateLimit("t", "a");
    expect(await rateLimit("t", "a", 3, 60)).toBeNull();
  });
});
