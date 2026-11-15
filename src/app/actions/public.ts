"use server";

import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { audit } from "@/lib/audit";
import { readPhoto } from "@/lib/photo";
import { nextPeriodStart, periodOf } from "@/lib/period";
import { flattenErrors, recipientSchema, verifySchema, keepInput, type ActionState } from "@/lib/validation";
import type { Category, Status } from "@prisma/client";

const isUniqueViolation = (e: unknown) => e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002";

export async function registerRecipient(prev: ActionState<{ nid: string }>, formData: FormData): Promise<ActionState<{ nid: string }>> {
  return keepInput(await registerRecipientImpl(prev, formData), formData);
}

async function registerRecipientImpl(_: ActionState<{ nid: string }>, formData: FormData): Promise<ActionState<{ nid: string }>> {
  const parsed = recipientSchema.safeParse(Object.fromEntries(formData));
  const photo = await readPhoto(formData.get("photo"), true);
  const errors = parsed.success ? {} : flattenErrors(parsed.error);
  if (photo && "error" in photo) errors.photo = [photo.error];
  if (!parsed.success || (photo && "error" in photo) || !photo) return { errors };

  try {
    const recipient = await db.recipient.create({
      data: { ...parsed.data, photo: { create: { data: new Uint8Array(photo.data), mime: photo.mime } } },
    });
    await audit(null, "REGISTERED", "Recipient", recipient.id, `Public application for NID ${recipient.nid}`);
    return { ok: true, data: { nid: recipient.nid }, message: "Application received." };
  } catch (e) {
    if (isUniqueViolation(e)) return { errors: { nid: ["An application with this NID already exists"] } };
    console.error("registerRecipient failed", e);
    return { message: "Something went wrong while saving your application. Please try again." };
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

const NOT_FOUND = "We couldn't find a recipient matching that NID and phone number.";

export async function lookupStatus(prev: ActionState<StatusLookup>, formData: FormData): Promise<ActionState<StatusLookup>> {
  return keepInput(await lookupStatusImpl(prev, formData), formData);
}

async function lookupStatusImpl(_: ActionState<StatusLookup>, formData: FormData): Promise<ActionState<StatusLookup>> {
  const parsed = verifySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: flattenErrors(parsed.error) };
  const recipient = await findVerified(parsed.data.nid, parsed.data.phone);
  if (!recipient) return { message: NOT_FOUND };

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
  const parsed = verifySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: flattenErrors(parsed.error) };
  const recipient = await findVerified(parsed.data.nid, parsed.data.phone);
  if (!recipient) return { message: NOT_FOUND };
  if (recipient.status !== "APPROVED") {
    return { message: "Your application must be approved before you can submit a monthly request." };
  }

  const period = periodOf();
  const nextRequestAt = nextPeriodStart(period).toISOString();
  try {
    await db.reliefRequest.create({ data: { recipientId: recipient.id, period } });
    await audit(null, "REQUEST_SUBMITTED", "Recipient", recipient.id, `Monthly request for ${period}`);
    return { ok: true, data: { nextRequestAt }, message: "Your request has been submitted." };
  } catch (e) {
    if (isUniqueViolation(e)) {
      return { message: "You have already submitted a request this month.", data: { nextRequestAt } };
    }
    console.error("submitMonthlyRequest failed", e);
    return { message: "Something went wrong. Please try again." };
  }
}
