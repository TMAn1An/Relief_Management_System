"use client";

import { Field, Input } from "@/components/ui";
import { useT } from "@/lib/i18n/client";

export function VerifyFields({ errors, values }: { errors?: Record<string, string[] | undefined>; values?: Record<string, string> }) {
  const t = useT();
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field label={t("verify.nid")} name="nid" error={errors?.nid}>
        <Input name="nid" inputMode="numeric" maxLength={10} defaultValue={values?.nid} required error={errors?.nid} />
      </Field>
      <Field label={t("verify.phone")} name="phone" error={errors?.phone} hint={t("verify.phone_hint")}>
        <Input name="phone" type="tel" inputMode="tel" maxLength={11} defaultValue={values?.phone} required error={errors?.phone} />
      </Field>
    </div>
  );
}
