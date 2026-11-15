"use client";

import { useActionState } from "react";
import type { Category } from "@prisma/client";
import { updateRecipient } from "@/app/actions/admin";
import { SubmitButton } from "@/components/submit-button";
import { Alert, ButtonLink, Field, Input, Select } from "@/components/ui";
import { CATEGORIES, CATEGORY_LABEL } from "@/lib/labels";

type R = { id: string; nid: string; name: string; phone: string; age: number; category: Category };

export function EditForm({ recipient }: { recipient: R }) {
  const [state, action] = useActionState(updateRecipient.bind(null, recipient.id), {});
  const e = state.errors ?? {};
  const v = { ...recipient, age: String(recipient.age), ...state.values };
  return (
    <form action={action} className="space-y-5" noValidate>
      {state.message && <Alert tone="error">{state.message}</Alert>}
      <Field label="Full name" name="name" error={e.name}><Input name="name" defaultValue={v.name} required error={e.name} /></Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="NID number" name="nid" error={e.nid}><Input name="nid" defaultValue={v.nid} inputMode="numeric" maxLength={10} required error={e.nid} /></Field>
        <Field label="Mobile number" name="phone" error={e.phone}><Input name="phone" defaultValue={v.phone} type="tel" maxLength={11} required error={e.phone} /></Field>
        <Field label="Age" name="age" error={e.age}><Input name="age" defaultValue={v.age} type="number" min={1} max={120} required error={e.age} /></Field>
        <Field label="Category" name="category" error={e.category}>
          <Select key={v.category} name="category" defaultValue={v.category} required error={e.category}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>)}
          </Select>
        </Field>
      </div>
      <Field label="Replace photo" name="photo" error={e.photo} hint="Optional. JPG or PNG, up to 500 KB">
        <Input name="photo" type="file" accept="image/png,image/jpeg" error={e.photo} />
      </Field>
      <div className="flex gap-3">
        <SubmitButton pendingText="Saving…">Save changes</SubmitButton>
        <ButtonLink href={`/admin/recipients/${recipient.id}`} variant="secondary">Cancel</ButtonLink>
      </div>
    </form>
  );
}
