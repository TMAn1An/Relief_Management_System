"use client";

import { useActionState } from "react";
import { login } from "@/app/actions/auth";
import { SubmitButton } from "@/components/submit-button";
import { Alert, Field, Input } from "@/components/ui";
import { useT } from "@/lib/i18n/client";

export function LoginForm({ next }: { next?: string }) {
  const t = useT();
  const [state, action] = useActionState(login, {});
  return (
    <form action={action} className="space-y-5" noValidate>
      {state.message && <Alert tone="error">{state.message}</Alert>}
      {next && <input type="hidden" name="next" value={next} />}
      <Field label={t("login.email")} name="email" error={state.errors?.email}>
        <Input name="email" type="email" autoComplete="username" defaultValue={state.values?.email} required error={state.errors?.email} />
      </Field>
      <Field label={t("login.password")} name="password" error={state.errors?.password}>
        <Input name="password" type="password" autoComplete="current-password" required error={state.errors?.password} />
      </Field>
      <SubmitButton pendingText={t("login.submitting")} className="w-full">{t("login.submit")}</SubmitButton>
    </form>
  );
}
