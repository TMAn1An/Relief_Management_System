"use server";

import type { Status } from "@prisma/client";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { isUniqueViolation } from "@/lib/db-errors";
import { requireAdmin, requireUser } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { blockedMessage, clearRateLimit, rateLimit } from "@/lib/rate-limit";
import { getT } from "@/lib/i18n/server";
import { readPhoto } from "@/lib/photo";
import { periodOf } from "@/lib/period";
import { STATUSES } from "@/lib/labels";
import {
  changePasswordSchema,
  createUserSchema,
  resetPasswordSchema,
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
  const t = await getT();
  const user = await requireUser();
  const parsed = recipientSchema.safeParse(Object.fromEntries(formData));
  const photo = await readPhoto(formData.get("photo"), false);
  const errors = parsed.success ? {} : flattenErrors(parsed.error, t);
  if (photo && "error" in photo) errors.photo = [t(photo.error)];
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
    if (isUniqueViolation(e)) return { errors: { nid: [t("m.nid_used")] } };
    console.error("updateRecipient failed", e);
    return { message: t("m.edit_error") };
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
  const t = await getT();
  const user = await requireUser();
  const parsed = distributionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: flattenErrors(parsed.error, t) };

  const recipient = await db.recipient.findUnique({ where: { nid: parsed.data.nid } });
  if (!recipient) return { errors: { nid: [t("m.no_recipient")] } };
  if (recipient.status !== "APPROVED") {
    return { errors: { nid: [t("m.not_approved", { name: recipient.name })] } };
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
      return { errors: { itemName: [t("m.item_dup", { name: recipient.name, item: itemName })] } };
    }
    console.error("addDistribution failed", e);
    return { message: t("m.dist_error") };
  }
  revalidatePath("/admin", "layout");
  return { ok: true, message: t("m.recorded", { item: itemName, name: recipient.name }) };
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
  const t = await getT();
  const user = await requireUser();
  const wait = await rateLimit("change-password", user.id, 5, 15 * 60);
  if (wait) return { message: blockedMessage(t, wait) };
  const parsed = changePasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: flattenErrors(parsed.error, t) };

  const row = await db.user.findUnique({ where: { id: user.id }, select: { passwordHash: true } });
  if (!row || !(await bcrypt.compare(parsed.data.currentPassword, row.passwordHash))) {
    return { errors: { currentPassword: [t("m.pw_incorrect")] } };
  }

  await db.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(parsed.data.newPassword, 12), mustChangePassword: false },
  });
  await clearRateLimit("change-password", user.id);
  await audit(user.id, "PASSWORD_CHANGED", "User", user.id);
  return { ok: true, message: t("m.pw_updated") };
}

// ---------- Staff management (admin only) ----------

export async function createUser(prev: ActionState, formData: FormData): Promise<ActionState> {
  return keepInput(await createUserImpl(prev, formData), formData);
}

async function createUserImpl(_: ActionState, formData: FormData): Promise<ActionState> {
  const t = await getT();
  const admin = await requireAdmin();
  const parsed = createUserSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: flattenErrors(parsed.error, t) };
  try {
    const u = await db.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        role: parsed.data.role,
        passwordHash: await bcrypt.hash(parsed.data.password, 12),
        mustChangePassword: true,
      },
    });
    await audit(admin.id, "USER_CREATED", "User", u.id, `${u.email} (${u.role})`);
  } catch (e) {
    if (isUniqueViolation(e)) return { errors: { email: [t("m.email_exists")] } };
    console.error("createUser failed", e);
    return { message: t("m.user_error") };
  }
  revalidatePath("/admin/users");
  return { ok: true, message: t("m.user_created", { name: parsed.data.name }) };
}

export async function setUserActive(id: string, active: boolean) {
  const admin = await requireAdmin();
  if (id === admin.id) return; // an admin can't lock themselves out
  const u = await db.user.update({ where: { id }, data: { active } });
  await audit(admin.id, active ? "USER_ACTIVATED" : "USER_DEACTIVATED", "User", id, u.email);
  revalidatePath("/admin/users");
}

export async function resetUserPassword(id: string, _: ActionState, formData: FormData): Promise<ActionState> {
  const t = await getT();
  const admin = await requireAdmin();
  if (id === admin.id) return { message: t("m.reset_self") };
  const parsed = resetPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: flattenErrors(parsed.error, t) };
  const u = await db.user.update({
    where: { id },
    data: { passwordHash: await bcrypt.hash(parsed.data.password, 12), mustChangePassword: true },
  });
  await audit(admin.id, "USER_PASSWORD_RESET", "User", id, u.email);
  return { ok: true, message: t("m.pw_reset", { name: u.name }) };
}
