"use client";

import { useActionState } from "react";
import { login } from "@/app/actions/auth";
import { SubmitButton } from "@/components/submit-button";
import { Alert, Field, Input } from "@/components/ui";

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState(login, {});
  return (
    <form action={action} className="space-y-5" noValidate>
      {state.message && <Alert tone="error">{state.message}</Alert>}
      {next && <input type="hidden" name="next" value={next} />}
      <Field label="Email" name="email" error={state.errors?.email}>
        <Input name="email" type="email" autoComplete="username" defaultValue={state.values?.email} required error={state.errors?.email} />
      </Field>
      <Field label="Password" name="password" error={state.errors?.password}>
        <Input name="password" type="password" autoComplete="current-password" required error={state.errors?.password} />
      </Field>
      <SubmitButton pendingText="Signing in…" className="w-full">Sign in</SubmitButton>
    </form>
  );
}
