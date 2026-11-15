import { Prisma } from "@prisma/client";

/**
 * True when a write failed because of a UNIQUE constraint.
 * Plain SQLite reports Prisma code P2002; through the libSQL (Turso) driver adapter the same
 * failure surfaces as an unknown request error whose message contains "UNIQUE constraint failed".
 */
export function isUniqueViolation(e: unknown): boolean {
  if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") return true;
  return e instanceof Error && /UNIQUE constraint failed/i.test(e.message);
}
