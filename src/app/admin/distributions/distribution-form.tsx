"use client";

import { useActionState, useEffect, useRef } from "react";
import { addDistribution } from "@/app/actions/admin";
import { SubmitButton } from "@/components/submit-button";
import { Alert, Field, Input } from "@/components/ui";
import { useT } from "@/lib/i18n/client";

export function DistributionForm() {
  const t = useT();
  const [state, action] = useActionState(addDistribution, {});
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state.ok) ref.current?.reset(); }, [state]);
  const e = state.errors ?? {};
  const v = state.values ?? {};
  return (
    <form ref={ref} action={action} className="space-y-4" noValidate>
      {state.ok && <Alert tone="success">{state.message}</Alert>}
      {state.message && !state.ok && <Alert tone="error">{state.message}</Alert>}
      <Field label={t("dist.nid")} name="nid" error={e.nid}><Input name="nid" inputMode="numeric" maxLength={10} defaultValue={v.nid} required error={e.nid} /></Field>
      <Field label={t("dist.item")} name="itemName" error={e.itemName} hint={t("dist.item_hint")}>
        <Input name="itemName" required list="items" defaultValue={v.itemName} error={e.itemName} />
        <datalist id="items"><option value={t("dist.rice")} /><option value={t("dist.lentils")} /><option value={t("dist.oil")} /><option value={t("dist.cash")} /></datalist>
      </Field>
      <Field label={t("dist.qty")} name="quantity" error={e.quantity}><Input name="quantity" type="number" step="0.01" min="0.01" defaultValue={v.quantity} required error={e.quantity} /></Field>
      <SubmitButton pendingText={t("dist.saving")} className="w-full">{t("dist.record")}</SubmitButton>
    </form>
  );
}
