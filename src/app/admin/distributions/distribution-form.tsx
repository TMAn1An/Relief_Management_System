"use client";

import { useActionState, useEffect, useRef } from "react";
import { addDistribution } from "@/app/actions/admin";
import { SubmitButton } from "@/components/submit-button";
import { Alert, Field, Input } from "@/components/ui";

export function DistributionForm() {
  const [state, action] = useActionState(addDistribution, {});
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state.ok) ref.current?.reset(); }, [state]);
  const e = state.errors ?? {};
  const v = state.values ?? {};
  return (
    <form ref={ref} action={action} className="space-y-4" noValidate>
      {state.ok && <Alert tone="success">{state.message}</Alert>}
      {state.message && !state.ok && <Alert tone="error">{state.message}</Alert>}
      <Field label="Recipient NID" name="nid" error={e.nid}><Input name="nid" inputMode="numeric" maxLength={10} defaultValue={v.nid} required error={e.nid} /></Field>
      <Field label="Item" name="itemName" error={e.itemName} hint="e.g. Rice (kg), Lentils (kg), Cash (BDT)">
        <Input name="itemName" required list="items" defaultValue={v.itemName} error={e.itemName} />
        <datalist id="items"><option value="Rice (kg)" /><option value="Lentils (kg)" /><option value="Cooking oil (L)" /><option value="Cash (BDT)" /></datalist>
      </Field>
      <Field label="Quantity" name="quantity" error={e.quantity}><Input name="quantity" type="number" step="0.01" min="0.01" defaultValue={v.quantity} required error={e.quantity} /></Field>
      <SubmitButton pendingText="Saving…" className="w-full">Record distribution</SubmitButton>
    </form>
  );
}
