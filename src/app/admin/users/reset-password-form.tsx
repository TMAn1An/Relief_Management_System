"use client";

import { useActionState } from "react";
import { resetUserPassword } from "@/app/actions/admin";
import { SubmitButton } from "@/components/submit-button";
import { Alert, Field, Input } from "@/components/ui";

export function ResetPasswordForm({ userId }: { userId: string }) {
  const [state, action] = useActionState(resetUserPassword.bind(null, userId), {});
  const e = state.errors ?? {};
  return (
    <form action={action} className="space-y-3" noValidate>
      {state.ok && <Alert tone="success">{state.message}</Alert>}
      {state.message && !state.ok && <Alert tone="error">{state.message}</Alert>}
      <Field label="New temporary password" name={`password-${userId}`} error={e.password}>
        <Input name="password" id={`password-${userId}`} type="text" autoComplete="off" required error={e.password} />
      </Field>
      <SubmitButton pendingText="Resetting…" variant="secondary">Reset password</SubmitButton>
    </form>
  );
}
