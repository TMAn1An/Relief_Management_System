"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { createSession, destroySession } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { clearRateLimit, clientIp, rateLimit } from "@/lib/rate-limit";
import { flattenErrors, loginSchema, keepInput, type ActionState } from "@/lib/validation";

// Compared against when the email is unknown, so response time doesn't reveal which emails exist.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 10);

export async function login(prev: ActionState, formData: FormData): Promise<ActionState> {
  return keepInput(await loginImpl(prev, formData), formData);
}

async function loginImpl(_: ActionState, formData: FormData): Promise<ActionState> {
  const ip = await clientIp();
  const ipBlocked = await rateLimit("login-ip", ip, 10, 15 * 60);
  if (ipBlocked) return { message: ipBlocked };

  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { errors: flattenErrors(parsed.error) };
  const emailBlocked = await rateLimit("login-email", parsed.data.email, 8, 15 * 60);
  if (emailBlocked) return { message: emailBlocked };

  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  const valid = await bcrypt.compare(parsed.data.password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !valid) return { message: "Incorrect email or password." };

  await clearRateLimit("login-email", parsed.data.email);
  await createSession(user.id);
  await audit(user.id, "LOGIN", "User", user.id);
  const next = formData.get("next");
  redirect(typeof next === "string" && next.startsWith("/admin") ? next : "/admin");
}

export async function logout() {
  await destroySession();
  redirect("/login");
}
