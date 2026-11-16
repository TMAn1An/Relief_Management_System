import { z } from "zod";
import { dictionaries, type TFn, type TKey } from "./i18n";

export const nidSchema = z
  .string()
  .trim()
  .regex(/^\d{10}$/, "v.nid");

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^01\d{9}$/, "v.phone");

export const recipientSchema = z
  .object({
    nid: nidSchema,
    name: z.string().trim().min(2, "v.name").max(100),
    phone: phoneSchema,
    age: z.coerce.number().int("v.age_int").min(1, "v.age_range").max(120, "v.age_range"),
    category: z.enum(["WIDOW", "ELDERLY", "DISABLED"], { message: "v.category" }),
  })
  .refine((v) => v.category !== "ELDERLY" || v.age >= 60, {
    path: ["age"],
    message: "v.elderly_age",
  });

export const verifySchema = z.object({ nid: nidSchema, phone: phoneSchema });

export const distributionSchema = z.object({
  nid: nidSchema,
  itemName: z.string().trim().min(2, "v.item_name").max(50),
  quantity: z.coerce.number().positive("v.qty").max(100000),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("v.email"),
  password: z.string().min(1, "v.password_required"),
});

/** bcrypt only uses the first 72 bytes, so longer passwords would be silently truncated. */
export const passwordSchema = z
  .string()
  .min(8, "v.pw_min")
  .refine((v) => new TextEncoder().encode(v).length <= 72, "v.pw_max");

export const createUserSchema = z.object({
  name: z.string().trim().min(2, "v.user_name").max(100),
  email: z.string().trim().toLowerCase().email("v.email"),
  role: z.enum(["ADMIN", "STAFF"], { message: "v.role" }),
  password: passwordSchema,
});

export const resetPasswordSchema = z.object({ password: passwordSchema });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "v.pw_current"),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, { path: ["confirmPassword"], message: "v.pw_mismatch" })
  .refine((v) => v.newPassword !== v.currentPassword, {
    path: ["newPassword"],
    message: "v.pw_same",
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
  for (const [k, v] of formData.entries()) if (typeof v === "string" && !k.startsWith("$ACTION") && !/password/i.test(k)) out[k] = v;
  return out;
}

/** Adds the submitted values to a failed result (successful results are returned untouched). */
export function keepInput<T extends { ok?: boolean; values?: Record<string, string> }>(result: T, formData: FormData): T {
  return result.ok ? result : { ...result, values: valuesOf(formData) };
}

/** Schema messages are dictionary keys; translate them for the user's language. */
export function flattenErrors(err: z.ZodError, t: TFn): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const issue of err.issues) {
    const key = String(issue.path[0] ?? "form");
    const msg = issue.message in dictionaries.en ? t(issue.message as TKey) : issue.message;
    (out[key] ??= []).push(msg);
  }
  return out;
}
