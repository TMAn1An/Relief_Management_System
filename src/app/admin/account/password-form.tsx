"use client";

import { useActionState } from "react";
import { changePassword } from "@/app/actions/admin";
import { SubmitButton } from "@/components/submit-button";
import { Alert, Field, Input } from "@/components/ui";

export function PasswordForm() {
  const [state, action] = useActionState(changePassword, {});
  const e = state.errors ?? {};
  return (
    <form action={action} className="space-y-5" noValidate>
      {state.ok && <Alert tone="success">{state.message}</Alert>}
      {state.message && !state.ok && <Alert tone="error">{state.message}</Alert>}
      <Field label="Current password" name="currentPassword" error={e.currentPassword}>
        <Input name="currentPassword" type="password" autoComplete="current-password" required error={e.currentPassword} />
      </Field>
      <Field label="New password" name="newPassword" error={e.newPassword} hint="At least 8 characters">
        <Input name="newPassword" type="password" autoComplete="new-password" required error={e.newPassword} />
      </Field>
      <Field label="Confirm new password" name="confirmPassword" error={e.confirmPassword}>
        <Input name="confirmPassword" type="password" autoComplete="new-password" required error={e.confirmPassword} />
      </Field>
      <SubmitButton pendingText="Updating…">Update password</SubmitButton>
    </form>
  );
}
