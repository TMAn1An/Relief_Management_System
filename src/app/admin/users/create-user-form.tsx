"use client";

import { useActionState, useEffect, useRef } from "react";
import { createUser } from "@/app/actions/admin";
import { SubmitButton } from "@/components/submit-button";
import { Alert, Field, Input, Select } from "@/components/ui";

export function CreateUserForm() {
  const [state, action] = useActionState(createUser, {});
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state.ok) ref.current?.reset(); }, [state]);
  const e = state.errors ?? {};
  const v = state.values ?? {};
  return (
    <form ref={ref} action={action} className="space-y-4" noValidate>
      {state.ok && <Alert tone="success">{state.message}</Alert>}
      {state.message && !state.ok && <Alert tone="error">{state.message}</Alert>}
      <Field label="Full name" name="name" error={e.name}><Input name="name" defaultValue={v.name} required error={e.name} /></Field>
      <Field label="Email" name="email" error={e.email}><Input name="email" type="email" defaultValue={v.email} required error={e.email} /></Field>
      <Field label="Role" name="role" error={e.role} hint="Admins can manage staff and delete records; staff can review and distribute.">
        <Select key={v.role ?? "STAFF"} name="role" defaultValue={v.role ?? "STAFF"} error={e.role}>
          <option value="STAFF">Staff</option>
          <option value="ADMIN">Admin</option>
        </Select>
      </Field>
      <Field label="Temporary password" name="password" error={e.password} hint="At least 8 characters. They'll be asked to change it on first sign-in.">
        <Input name="password" type="text" autoComplete="off" required error={e.password} />
      </Field>
      <SubmitButton pendingText="Creating…" className="w-full">Create account</SubmitButton>
    </form>
  );
}
