"use client";

import { useActionState } from "react";
import type { Category } from "@prisma/client";
import { updateRecipient } from "@/app/actions/admin";
import { SubmitButton } from "@/components/submit-button";
import { Alert, ButtonLink, Field, Input, Select } from "@/components/ui";
import { CATEGORIES } from "@/lib/labels";
import { useT } from "@/lib/i18n/client";

type R = { id: string; nid: string; name: string; phone: string; age: number; category: Category };

export function EditForm({ recipient }: { recipient: R }) {
  const t = useT();
  const [state, action] = useActionState(updateRecipient.bind(null, recipient.id), {});
  const e = state.errors ?? {};
  const v = { ...recipient, age: String(recipient.age), ...state.values };
  return (
    <form action={action} className="space-y-5" noValidate>
      {state.message && <Alert tone="error">{state.message}</Alert>}
      <Field label={t("apply.name")} name="name" error={e.name}><Input name="name" defaultValue={v.name} required error={e.name} /></Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t("apply.nid")} name="nid" error={e.nid}><Input name="nid" defaultValue={v.nid} inputMode="numeric" maxLength={10} required error={e.nid} /></Field>
        <Field label={t("apply.phone")} name="phone" error={e.phone}><Input name="phone" defaultValue={v.phone} type="tel" maxLength={11} required error={e.phone} /></Field>
        <Field label={t("apply.age")} name="age" error={e.age}><Input name="age" defaultValue={v.age} type="number" min={1} max={120} required error={e.age} /></Field>
        <Field label={t("apply.category")} name="category" error={e.category}>
          <Select key={v.category} name="category" defaultValue={v.category} required error={e.category}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{t(`category.${c}`)}</option>)}
          </Select>
        </Field>
      </div>
      <Field label={t("edit.replace_photo")} name="photo" error={e.photo} hint={t("edit.replace_hint")}>
        <Input name="photo" type="file" accept="image/png,image/jpeg" error={e.photo} />
      </Field>
      <div className="flex gap-3">
        <SubmitButton pendingText={t("edit.saving")}>{t("edit.save")}</SubmitButton>
        <ButtonLink href={`/admin/recipients/${recipient.id}`} variant="secondary">{t("edit.cancel")}</ButtonLink>
      </div>
    </form>
  );
}
