import { z } from "zod";

export const nidSchema = z
  .string()
  .trim()
  .regex(/^\d{10}$/, "NID must be exactly 10 digits");

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^01\d{9}$/, "Enter a valid mobile number, e.g. 01712345678");

export const recipientSchema = z
  .object({
    nid: nidSchema,
    name: z.string().trim().min(2, "Please enter the full name").max(100),
    phone: phoneSchema,
    age: z.coerce.number().int("Age must be a whole number").min(1, "Enter a valid age").max(120, "Enter a valid age"),
    category: z.enum(["WIDOW", "ELDERLY", "DISABLED"], { message: "Select a category" }),
  })
  .refine((v) => v.category !== "ELDERLY" || v.age >= 60, {
    path: ["age"],
    message: "Elderly recipients must be 60 or older",
  });

export const verifySchema = z.object({ nid: nidSchema, phone: phoneSchema });

export const distributionSchema = z.object({
  nid: nidSchema,
  itemName: z.string().trim().min(2, "Enter the item name").max(50),
  quantity: z.coerce.number().positive("Quantity must be greater than 0").max(100000),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

export const PHOTO_MAX_BYTES = 500 * 1024;
export const PHOTO_TYPES = ["image/jpeg", "image/png"] as const;

export function normalizeItem(name: string) {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

export type ActionState<T = undefined> = {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string[] | undefined>;
  data?: T;
  /** Submitted text values, echoed back so forms keep user input after an error. */
  values?: Record<string, string>;
};

export function valuesOf(formData: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of formData.entries()) if (typeof v === "string" && !k.startsWith("$ACTION") && k !== "password") out[k] = v;
  return out;
}

/** Adds the submitted values to a failed result (successful results are returned untouched). */
export function keepInput<T extends { ok?: boolean; values?: Record<string, string> }>(result: T, formData: FormData): T {
  return result.ok ? result : { ...result, values: valuesOf(formData) };
}

export function flattenErrors(err: z.ZodError): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const issue of err.issues) {
    const key = String(issue.path[0] ?? "form");
    (out[key] ??= []).push(issue.message);
  }
  return out;
}
