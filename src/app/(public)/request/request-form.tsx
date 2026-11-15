"use client";

import { useActionState } from "react";
import { submitMonthlyRequest } from "@/app/actions/public";
import { SubmitButton } from "@/components/submit-button";
import { Alert, Card } from "@/components/ui";
import { formatDate } from "@/lib/period";
import { VerifyFields } from "../VerifyFields";
import { Countdown } from "./countdown";

export function RequestForm() {
  const [state, action] = useActionState(submitMonthlyRequest, {});
  const next = state.data?.nextRequestAt;

  return (
    <div className="space-y-6">
      <Card>
        <form action={action} className="space-y-5" noValidate>
          {state.ok && <Alert tone="success">{state.message} We’ll let the relief office know — collect your package when it’s distributed.</Alert>}
          {!state.ok && state.message && <Alert tone="error">{state.message}</Alert>}
          <VerifyFields errors={state.errors} values={state.values} />
          <SubmitButton pendingText="Submitting…">Submit monthly request</SubmitButton>
        </form>
      </Card>

      {next && (
        <section className="rounded-2xl bg-gradient-to-br from-brand-900 to-brand-700 p-6 text-white">
          <Countdown target={next} />
          <p className="mt-4 text-sm text-brand-100">You can request again on {formatDate(new Date(next))}.</p>
        </section>
      )}
    </div>
  );
}
