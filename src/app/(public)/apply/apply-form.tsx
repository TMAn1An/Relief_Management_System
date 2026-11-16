"use client";

import { useActionState } from "react";
import { registerRecipient } from "@/app/actions/public";
import { SubmitButton } from "@/components/submit-button";
import { Alert, ButtonLink, Field, Input, Select } from "@/components/ui";
import { CATEGORIES } from "@/lib/labels";
import { useT } from "@/lib/i18n/client";

export function ApplyForm() {
  const t = useT();
  const [state, action] = useActionState(registerRecipient, {});

  if (state.ok) {
    return (
      <div className="space-y-4">
        <Alert tone="success">
          <p className="font-semibold">{t("apply.ok_title")}</p>
          <p className="mt-1">{t("apply.ok_text", { nid: state.data?.nid ?? "" })}</p>
        </Alert>
        <ButtonLink href="/status">{t("apply.check")}</ButtonLink>
      </div>
    );
  }

  const e = state.errors ?? {};
  const v = state.values ?? {};
  return (
    <form action={action} className="space-y-5" noValidate>
      {state.message && <Alert tone="error">{state.message}</Alert>}
      <Field label={t("apply.name")} name="name" error={e.name}>
        <Input name="name" autoComplete="name" defaultValue={v.name} required error={e.name} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t("apply.nid")} name="nid" error={e.nid} hint={t("apply.nid_hint")}>
          <Input name="nid" inputMode="numeric" maxLength={10} defaultValue={v.nid} required error={e.nid} />
        </Field>
        <Field label={t("apply.phone")} name="phone" error={e.phone} hint={t("apply.phone_hint")}>
          <Input name="phone" type="tel" inputMode="tel" autoComplete="tel" maxLength={11} defaultValue={v.phone} required error={e.phone} />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t("apply.age")} name="age" error={e.age}>
          <Input name="age" type="number" min={1} max={120} defaultValue={v.age} required error={e.age} />
        </Field>
        <Field label={t("apply.category")} name="category" error={e.category}>
          <Select key={v.category ?? "none"} name="category" defaultValue={v.category ?? ""} required error={e.category}>
            <option value="" disabled>{t("apply.category_ph")}</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{t(`category.${c}`)}</option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label={t("apply.photo")} name="photo" error={e.photo} hint={t("apply.photo_hint")}>
        <Input name="photo" type="file" accept="image/png,image/jpeg" required error={e.photo} className="file:mr-3 file:rounded-md file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-brand-800" />
      </Field>
      <SubmitButton pendingText={t("apply.submitting")} className="w-full sm:w-auto">{t("apply.submit")}</SubmitButton>
    </form>
  );
}
