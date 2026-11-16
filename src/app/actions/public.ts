"use server";

import { db } from "@/lib/db";
import { isUniqueViolation } from "@/lib/db-errors";
import { audit } from "@/lib/audit";
import { blockedMessage, clientIp, rateLimit } from "@/lib/rate-limit";
import { getT } from "@/lib/i18n/server";
import type { TFn } from "@/lib/i18n";
import { readPhoto } from "@/lib/photo";
import { nextPeriodStart, periodOf } from "@/lib/period";
import { flattenErrors, recipientSchema, verifySchema, keepInput, type ActionState } from "@/lib/validation";
import type { Category, Status } from "@prisma/client";

export async function registerRecipient(prev: ActionState<{ nid: string }>, formData: FormData): Promise<ActionState<{ nid: string }>> {
  return keepInput(await registerRecipientImpl(prev, formData), formData);
}

async function registerRecipientImpl(_: ActionState<{ nid: string }>, formData: FormData): Promise<ActionState<{ nid: string }>> {
  const t = await getT();
  const wait = await rateLimit("register-ip", await clientIp(), 5, 60 * 60);
  if (wait) return { message: blockedMessage(t, wait) };
  const parsed = recipientSchema.safeParse(Object.fromEntries(formData));
  const photo = await readPhoto(formData.get("photo"), true);
  const errors = parsed.success ? {} : flattenErrors(parsed.error, t);
  if (photo && "error" in photo) errors.photo = [t(photo.error)];
  if (!parsed.success || (photo && "error" in photo) || !photo) return { errors };

  try {
    const recipient = await db.recipient.create({
      data: { ...parsed.data, photo: { create: { data: new Uint8Array(photo.data), mime: photo.mime } } },
    });
    await audit(null, "REGISTERED", "Recipient", recipient.id, `Public application for NID ${recipient.nid}`);
    return { ok: true, data: { nid: recipient.nid }, message: t("m.registered") };
  } catch (e) {
    if (isUniqueViolation(e)) return { errors: { nid: [t("m.nid_exists")] } };
    console.error("registerRecipient failed", e);
    return { message: t("m.apply_error") };
  }
}

export type StatusLookup = {
  name: string;
  category: Category;
  status: Status;
  cardNo: number | null;
  requestedThisMonth: boolean;
  nextRequestAt: string;
};

async function findVerified(nid: string, phone: string) {
  const recipient = await db.recipient.findUnique({ where: { nid }, include: { card: true } });
  // Same message for "no such NID" and "wrong phone" so the form can't be used to probe for NIDs.
  return recipient && recipient.phone === phone ? recipient : null;
}

/** NID + phone lookups are the brute-force target: limit per IP and per NID. */
async function guardVerification(t: TFn, nid: string | null): Promise<string | null> {
  const wait =
    (await rateLimit("verify-ip", await clientIp(), 10, 15 * 60)) ??
    (nid ? await rateLimit("verify-nid", nid, 10, 15 * 60) : null);
  return wait ? blockedMessage(t, wait) : null;
}

export async function lookupStatus(prev: ActionState<StatusLookup>, formData: FormData): Promise<ActionState<StatusLookup>> {
  return keepInput(await lookupStatusImpl(prev, formData), formData);
}

async function lookupStatusImpl(_: ActionState<StatusLookup>, formData: FormData): Promise<ActionState<StatusLookup>> {
  const t = await getT();
  const parsed = verifySchema.safeParse(Object.fromEntries(formData));
  const blocked = await guardVerification(t, parsed.success ? parsed.data.nid : null);
  if (blocked) return { message: blocked };
  if (!parsed.success) return { errors: flattenErrors(parsed.error, t) };
  const recipient = await findVerified(parsed.data.nid, parsed.data.phone);
  if (!recipient) return { message: t("m.not_found") };

  const period = periodOf();
  const request = await db.reliefRequest.findUnique({
    where: { recipientId_period: { recipientId: recipient.id, period } },
  });
  return {
    ok: true,
    data: {
      name: recipient.name,
      category: recipient.category,
      status: recipient.status,
      cardNo: recipient.card?.cardNo ?? null,
      requestedThisMonth: !!request,
      nextRequestAt: nextPeriodStart(period).toISOString(),
    },
  };
}

export async function submitMonthlyRequest(prev: ActionState<{ nextRequestAt: string }>, formData: FormData): Promise<ActionState<{ nextRequestAt: string }>> {
  return keepInput(await submitMonthlyRequestImpl(prev, formData), formData);
}

async function submitMonthlyRequestImpl(
  _: ActionState<{ nextRequestAt: string }>,
  formData: FormData,
): Promise<ActionState<{ nextRequestAt: string }>> {
  const t = await getT();
  const parsed = verifySchema.safeParse(Object.fromEntries(formData));
  const blocked = await guardVerification(t, parsed.success ? parsed.data.nid : null);
  if (blocked) return { message: blocked };
  if (!parsed.success) return { errors: flattenErrors(parsed.error, t) };
  const recipient = await findVerified(parsed.data.nid, parsed.data.phone);
  if (!recipient) return { message: t("m.not_found") };
  if (recipient.status !== "APPROVED") {
    return { message: t("m.must_be_approved") };
  }

  const period = periodOf();
  const nextRequestAt = nextPeriodStart(period).toISOString();
  try {
    await db.reliefRequest.create({ data: { recipientId: recipient.id, period } });
    await audit(null, "REQUEST_SUBMITTED", "Recipient", recipient.id, `Monthly request for ${period}`);
    return { ok: true, data: { nextRequestAt }, message: t("m.request_done") };
  } catch (e) {
    if (isUniqueViolation(e)) {
      return { message: t("m.already_requested"), data: { nextRequestAt } };
    }
    console.error("submitMonthlyRequest failed", e);
    return { message: t("m.generic") };
  }
}
