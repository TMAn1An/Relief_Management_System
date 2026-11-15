import { describe, expect, it } from "vitest";
import { Prisma } from "@prisma/client";
import { isUniqueViolation } from "./db-errors";

describe("isUniqueViolation", () => {
  it("recognises Prisma P2002", () => {
    const e = new Prisma.PrismaClientKnownRequestError("x", { code: "P2002", clientVersion: "6" });
    expect(isUniqueViolation(e)).toBe(true);
  });
  it("recognises the libSQL adapter's unknown-request error", () => {
    const e = new Prisma.PrismaClientUnknownRequestError("SQLITE_CONSTRAINT: UNIQUE constraint failed: Recipient.nid", { clientVersion: "6" });
    expect(isUniqueViolation(e)).toBe(true);
  });
  it("ignores other errors", () => {
    expect(isUniqueViolation(new Error("connection reset"))).toBe(false);
    expect(isUniqueViolation("nope")).toBe(false);
  });
});
