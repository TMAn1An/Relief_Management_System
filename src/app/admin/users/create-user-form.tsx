"use client";

import { useActionState, useEffect, useRef } from "react";
import { createUser } from "@/app/actions/admin";
import { SubmitButton } from "@/components/submit-button";
import { Alert, Field, Input, Select } from "@/components/ui";
import { useT } from "@/lib/i18n/client";

export function CreateUserForm() {
  const t = useT();
  const [state, action] = useActionState(createUser, {});
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state.ok) ref.current?.reset(); }, [state]);
  const e = state.errors ?? {};
  const v = state.values ?? {};
  return (
    <form ref={ref} action={action} className="space-y-4" noValidate>
      {state.ok && <Alert tone="success">{state.message}</Alert>}
      {state.message && !state.ok && <Alert tone="error">{state.message}</Alert>}
      <Field label={t("users.name")} name="name" error={e.name}><Input name="name" defaultValue={v.name} required error={e.name} /></Field>
      <Field label={t("users.email")} name="email" error={e.email}><Input name="email" type="email" defaultValue={v.email} required error={e.email} /></Field>
      <Field label={t("users.role")} name="role" error={e.role} hint={t("users.role_hint")}>
        <Select key={v.role ?? "STAFF"} name="role" defaultValue={v.role ?? "STAFF"} error={e.role}>
          <option value="STAFF">{t("role.STAFF")}</option>
          <option value="ADMIN">{t("role.ADMIN")}</option>
        </Select>
      </Field>
      <Field label={t("users.temp_pw")} name="password" error={e.password} hint={t("users.temp_pw_hint")}>
        <Input name="password" type="text" autoComplete="off" required error={e.password} />
      </Field>
      <SubmitButton pendingText={t("users.creating")} className="w-full">{t("users.create")}</SubmitButton>
    </form>
  );
}
