"use client";

import { useActionState } from "react";
import { changePassword } from "@/app/actions/admin";
import { SubmitButton } from "@/components/submit-button";
import { Alert, Field, Input } from "@/components/ui";
import { useT } from "@/lib/i18n/client";

export function PasswordForm() {
  const t = useT();
  const [state, action] = useActionState(changePassword, {});
  const e = state.errors ?? {};
  return (
    <form action={action} className="space-y-5" noValidate>
      {state.ok && <Alert tone="success">{state.message}</Alert>}
      {state.message && !state.ok && <Alert tone="error">{state.message}</Alert>}
      <Field label={t("account.current")} name="currentPassword" error={e.currentPassword}>
        <Input name="currentPassword" type="password" autoComplete="current-password" required error={e.currentPassword} />
      </Field>
      <Field label={t("account.new")} name="newPassword" error={e.newPassword} hint={t("account.new_hint")}>
        <Input name="newPassword" type="password" autoComplete="new-password" required error={e.newPassword} />
      </Field>
      <Field label={t("account.confirm")} name="confirmPassword" error={e.confirmPassword}>
        <Input name="confirmPassword" type="password" autoComplete="new-password" required error={e.confirmPassword} />
      </Field>
      <SubmitButton pendingText={t("account.updating")}>{t("account.update")}</SubmitButton>
    </form>
  );
}
