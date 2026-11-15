"use server";

import type { Status } from "@prisma/client";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { isUniqueViolation } from "@/lib/db-errors";
import { requireAdmin, requireUser } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { readPhoto } from "@/lib/photo";
import { periodOf } from "@/lib/period";
import { STATUSES } from "@/lib/labels";
import {
  changePasswordSchema,
  distributionSchema,
  flattenErrors,
  normalizeItem,
  recipientSchema,
  keepInput,
  type ActionState,
} from "@/lib/validation";

export async function setRecipientStatus(recipientId: string, status: Status) {
  const user = await requireUser();
  if (!STATUSES.includes(status)) return;
  await db.$transaction(async (tx) => {
    const r = await tx.recipient.update({ where: { id: recipientId }, data: { status } });
    if (status === "APPROVED") {
      await tx.reliefCard.upsert({ where: { recipientId }, create: { recipientId }, update: {} });
    }
    await tx.auditLog.create({
      data: { actorId: user.id, action: `STATUS_${status}`, entity: "Recipient", entityId: r.id, details: `NID ${r.nid}` },
    });
  });
  revalidatePath("/admin", "layout");
}

export async function updateRecipient(id: string, prev: ActionState, formData: FormData): Promise<ActionState> {
  return keepInput(await updateRecipientImpl(id, prev, formData), formData);
}

async function updateRecipientImpl(
  id: string,
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = recipientSchema.safeParse(Object.fromEntries(formData));
  const photo = await readPhoto(formData.get("photo"), false);
  const errors = parsed.success ? {} : flattenErrors(parsed.error);
  if (photo && "error" in photo) errors.photo = [photo.error];
  if (!parsed.success || (photo && "error" in photo)) return { errors };

  try {
    await db.recipient.update({
      where: { id },
      data: {
        ...parsed.data,
        ...(photo
          ? {
              photo: {
                upsert: {
                  create: { data: new Uint8Array(photo.data), mime: photo.mime },
                  update: { data: new Uint8Array(photo.data), mime: photo.mime },
                },
              },
            }
          : {}),
      },
    });
  } catch (e) {
    if (isUniqueViolation(e)) return { errors: { nid: ["Another recipient already uses this NID"] } };
    console.error("updateRecipient failed", e);
    return { message: "Could not save changes. Please try again." };
  }
  await audit(user.id, "UPDATED", "Recipient", id, `NID ${parsed.data.nid}`);
  revalidatePath("/admin", "layout");
  redirect(`/admin/recipients/${id}?saved=1`);
}

export async function deleteRecipient(id: string) {
  const user = await requireAdmin();
  const r = await db.recipient.delete({ where: { id } });
  await audit(user.id, "DELETED", "Recipient", id, `NID ${r.nid} (${r.name})`);
  revalidatePath("/admin", "layout");
  redirect("/admin/recipients?deleted=1");
}

export async function addDistribution(prev: ActionState, formData: FormData): Promise<ActionState> {
  return keepInput(await addDistributionImpl(prev, formData), formData);
}

async function addDistributionImpl(_: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = distributionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: flattenErrors(parsed.error) };

  const recipient = await db.recipient.findUnique({ where: { nid: parsed.data.nid } });
  if (!recipient) return { errors: { nid: ["No recipient found with this NID"] } };
  if (recipient.status !== "APPROVED") {
    return { errors: { nid: [`${recipient.name} is not approved yet and cannot receive relief items`] } };
  }

  const itemName = parsed.data.itemName.replace(/\s+/g, " ");
  try {
    const d = await db.distribution.create({
      data: {
        recipientId: recipient.id,
        itemName,
        itemKey: normalizeItem(itemName),
        quantity: parsed.data.quantity,
        period: periodOf(),
      },
    });
    await audit(user.id, "DISTRIBUTED", "Distribution", d.id, `${itemName} × ${parsed.data.quantity} to NID ${recipient.nid}`);
  } catch (e) {
    if (isUniqueViolation(e)) {
      return { errors: { itemName: [`${recipient.name} has already received “${itemName}” this month`] } };
    }
    console.error("addDistribution failed", e);
    return { message: "Could not record the distribution. Please try again." };
  }
  revalidatePath("/admin", "layout");
  return { ok: true, message: `Recorded ${itemName} for ${recipient.name}.` };
}

export async function deleteDistribution(id: string) {
  const user = await requireAdmin();
  const d = await db.distribution.delete({ where: { id } });
  await audit(user.id, "DISTRIBUTION_DELETED", "Distribution", id, `${d.itemName}`);
  revalidatePath("/admin", "layout");
}

export async function changePassword(prev: ActionState, formData: FormData): Promise<ActionState> {
  return keepInput(await changePasswordImpl(prev, formData), formData);
}

async function changePasswordImpl(_: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = changePasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: flattenErrors(parsed.error) };

  const row = await db.user.findUnique({ where: { id: user.id }, select: { passwordHash: true } });
  if (!row || !(await bcrypt.compare(parsed.data.currentPassword, row.passwordHash))) {
    return { errors: { currentPassword: ["Your current password is incorrect"] } };
  }

  await db.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(parsed.data.newPassword, 12) } });
  await audit(user.id, "PASSWORD_CHANGED", "User", user.id);
  return { ok: true, message: "Your password has been updated." };
}
