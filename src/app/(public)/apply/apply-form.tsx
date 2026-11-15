"use client";

import { useActionState } from "react";
import { registerRecipient } from "@/app/actions/public";
import { SubmitButton } from "@/components/submit-button";
import { Alert, ButtonLink, Field, Input, Select } from "@/components/ui";
import { CATEGORIES, CATEGORY_LABEL } from "@/lib/labels";

export function ApplyForm() {
  const [state, action] = useActionState(registerRecipient, {});

  if (state.ok) {
    return (
      <div className="space-y-4">
        <Alert tone="success">
          <p className="font-semibold">Application received</p>
          <p className="mt-1">
            Thank you. Our team will review your application. Keep your NID <strong>{state.data?.nid}</strong> and phone number handy —
            you’ll need both to check your status.
          </p>
        </Alert>
        <ButtonLink href="/status">Check my status</ButtonLink>
      </div>
    );
  }

  const e = state.errors ?? {};
  const v = state.values ?? {};
  return (
    <form action={action} className="space-y-5" noValidate>
      {state.message && <Alert tone="error">{state.message}</Alert>}
      <Field label="Full name" name="name" error={e.name}>
        <Input name="name" autoComplete="name" defaultValue={v.name} required error={e.name} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="NID number" name="nid" error={e.nid} hint="10 digits">
          <Input name="nid" inputMode="numeric" maxLength={10} defaultValue={v.nid} required error={e.nid} />
        </Field>
        <Field label="Mobile number" name="phone" error={e.phone} hint="e.g. 01712345678">
          <Input name="phone" type="tel" inputMode="tel" autoComplete="tel" maxLength={11} defaultValue={v.phone} required error={e.phone} />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Age" name="age" error={e.age}>
          <Input name="age" type="number" min={1} max={120} defaultValue={v.age} required error={e.age} />
        </Field>
        <Field label="Category" name="category" error={e.category}>
          <Select key={v.category ?? "none"} name="category" defaultValue={v.category ?? ""} required error={e.category}>
            <option value="" disabled>Select a category</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label="Photo" name="photo" error={e.photo} hint="JPG or PNG, up to 500 KB">
        <Input name="photo" type="file" accept="image/png,image/jpeg" required error={e.photo} className="file:mr-3 file:rounded-md file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-brand-800" />
      </Field>
      <SubmitButton pendingText="Submitting…" className="w-full sm:w-auto">Submit application</SubmitButton>
    </form>
  );
}
