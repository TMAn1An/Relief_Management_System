"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { createSession, destroySession } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { blockedMessage, clearRateLimit, clientIp, rateLimit } from "@/lib/rate-limit";
import { getT } from "@/lib/i18n/server";
import { flattenErrors, loginSchema, keepInput, type ActionState } from "@/lib/validation";

// Compared against when the email is unknown, so response time doesn't reveal which emails exist.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 10);

export async function login(prev: ActionState, formData: FormData): Promise<ActionState> {
  return keepInput(await loginImpl(prev, formData), formData);
}

async function loginImpl(_: ActionState, formData: FormData): Promise<ActionState> {
  const t = await getT();
  const ip = await clientIp();
  const ipWait = await rateLimit("login-ip", ip, 10, 15 * 60);
  if (ipWait) return { message: blockedMessage(t, ipWait) };

  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { errors: flattenErrors(parsed.error, t) };
  const emailWait = await rateLimit("login-email", parsed.data.email, 8, 15 * 60);
  if (emailWait) return { message: blockedMessage(t, emailWait) };

  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  const valid = await bcrypt.compare(parsed.data.password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !user.active || !valid) return { message: t("m.login_bad") };

  // A successful sign-in clears both counters so colleagues behind one office IP never lock each other out;
  // every account stays protected by its own per-email limit.
  await clearRateLimit("login-email", parsed.data.email);
  await clearRateLimit("login-ip", ip);
  await createSession(user.id);
  await audit(user.id, "LOGIN", "User", user.id);
  const next = formData.get("next");
  redirect(typeof next === "string" && next.startsWith("/admin") ? next : "/admin");
}

export async function logout() {
  await destroySession();
  redirect("/login");
}
