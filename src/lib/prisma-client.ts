import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql/web";

/**
 * Production uses Turso (libSQL, over HTTP so no native module is bundled) via TURSO_DATABASE_URL + TURSO_AUTH_TOKEN.
 * Local development and tests use a plain SQLite file via DATABASE_URL.
 */
export function createPrismaClient(): PrismaClient {
  const url = process.env.TURSO_DATABASE_URL;
  if (url) {
    return new PrismaClient({ adapter: new PrismaLibSQL({ url, authToken: process.env.TURSO_AUTH_TOKEN }) });
  }
  return new PrismaClient();
}
