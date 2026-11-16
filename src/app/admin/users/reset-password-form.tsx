"use client";

import { useActionState } from "react";
import { resetUserPassword } from "@/app/actions/admin";
import { SubmitButton } from "@/components/submit-button";
import { Alert, Field, Input } from "@/components/ui";
import { useT } from "@/lib/i18n/client";

export function ResetPasswordForm({ userId }: { userId: string }) {
  const t = useT();
  const [state, action] = useActionState(resetUserPassword.bind(null, userId), {});
  const e = state.errors ?? {};
  return (
    <form action={action} className="space-y-3" noValidate>
      {state.ok && <Alert tone="success">{state.message}</Alert>}
      {state.message && !state.ok && <Alert tone="error">{state.message}</Alert>}
      <Field label={t("users.reset_new")} name={`password-${userId}`} error={e.password}>
        <Input name="password" id={`password-${userId}`} type="text" autoComplete="off" required error={e.password} />
      </Field>
      <SubmitButton pendingText={t("users.resetting")} variant="secondary">{t("users.reset")}</SubmitButton>
    </form>
  );
}
