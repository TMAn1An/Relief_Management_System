import { describe, expect, it } from "vitest";
import { distributionSchema, normalizeItem, recipientSchema, verifySchema } from "./validation";

const base = { nid: "1234567890", name: "Rahima Begum", phone: "01712345678", age: "65", category: "ELDERLY" };

describe("recipientSchema", () => {
  it("accepts a valid recipient", () => expect(recipientSchema.safeParse(base).success).toBe(true));
  it("requires elderly recipients to be 60+", () => {
    const r = recipientSchema.safeParse({ ...base, age: "59" });
    expect(r.success).toBe(false);
  });
  it("allows younger widows", () => expect(recipientSchema.safeParse({ ...base, age: "34", category: "WIDOW" }).success).toBe(true));
  it("rejects malformed NID and phone", () => {
    expect(recipientSchema.safeParse({ ...base, nid: "123" }).success).toBe(false);
    expect(recipientSchema.safeParse({ ...base, phone: "12345" }).success).toBe(false);
  });
});

describe("verifySchema / distributionSchema", () => {
  it("trims input", () => expect(verifySchema.parse({ nid: " 1234567890 ", phone: "01712345678" }).nid).toBe("1234567890"));
  it("rejects non-positive quantities", () => {
    expect(distributionSchema.safeParse({ nid: "1234567890", itemName: "Rice", quantity: "0" }).success).toBe(false);
  });
  it("normalises item names for duplicate detection", () => {
    expect(normalizeItem("  Rice   (KG) ")).toBe("rice (kg)");
  });
});
