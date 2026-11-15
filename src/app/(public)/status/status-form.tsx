"use client";

import { useActionState } from "react";
import { lookupStatus } from "@/app/actions/public";
import { SubmitButton } from "@/components/submit-button";
import { Alert, Card, StatusBadge } from "@/components/ui";
import { CATEGORY_LABEL, cardNumber } from "@/lib/labels";
import { VerifyFields } from "../VerifyFields";
import { ButtonLink } from "@/components/ui";

const copy = {
  PENDING: "Your application is being reviewed. Please check back soon.",
  APPROVED: "You’re approved. You can submit a relief request every month.",
  REJECTED: "Your application was not approved. Please contact the relief office for details.",
} as const;

export function StatusForm() {
  const [state, action] = useActionState(lookupStatus, {});
  const r = state.data;

  return (
    <div className="space-y-6">
      <Card>
        <form action={action} className="space-y-5" noValidate>
          {state.message && <Alert tone="error">{state.message}</Alert>}
          <VerifyFields errors={state.errors} values={state.values} />
          <SubmitButton pendingText="Checking…">Check status</SubmitButton>
        </form>
      </Card>

      {r && (
        <Card aria-live="polite">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted">Applicant</p>
              <p className="text-xl font-semibold">{r.name}</p>
              <p className="text-sm text-muted">{CATEGORY_LABEL[r.category]}</p>
            </div>
            <StatusBadge status={r.status} />
          </div>
          <p className="mt-4 text-sm">{copy[r.status]}</p>
          {r.cardNo && <p className="mt-3 text-sm">Relief card no. <strong>{cardNumber(r.cardNo)}</strong></p>}
          {r.status === "APPROVED" && (
            <div className="mt-5">
              {r.requestedThisMonth ? (
                <Alert tone="success">You’ve already requested relief this month.</Alert>
              ) : (
                <ButtonLink href="/request">Submit this month’s request</ButtonLink>
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
