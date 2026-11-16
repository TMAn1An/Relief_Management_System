"use client";

import { useActionState } from "react";
import { lookupStatus } from "@/app/actions/public";
import { SubmitButton } from "@/components/submit-button";
import { Alert, ButtonLink, Card, StatusBadge } from "@/components/ui";
import { cardNumber } from "@/lib/labels";
import { useLocale, useT } from "@/lib/i18n/client";
import { VerifyFields } from "../VerifyFields";

export function StatusForm() {
  const t = useT();
  const locale = useLocale();
  const [state, action] = useActionState(lookupStatus, {});
  const r = state.data;

  return (
    <div className="space-y-6">
      <Card>
        <form action={action} className="space-y-5" noValidate>
          {state.message && <Alert tone="error">{state.message}</Alert>}
          <VerifyFields errors={state.errors} values={state.values} />
          <SubmitButton pendingText={t("status.checking")}>{t("status.check")}</SubmitButton>
        </form>
      </Card>

      {r && (
        <Card aria-live="polite">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted">{t("status.applicant")}</p>
              <p className="text-xl font-semibold">{r.name}</p>
              <p className="text-sm text-muted">{t(`category.${r.category}`)}</p>
            </div>
            <StatusBadge status={r.status} label={t(`status.${r.status}`)} />
          </div>
          <p className="mt-4 text-sm">{t(`status.msg.${r.status}`)}</p>
          {r.cardNo && <p className="mt-3 text-sm">{t("status.card_no")} <strong>{cardNumber(r.cardNo, locale)}</strong></p>}
          {r.status === "APPROVED" && (
            <div className="mt-5">
              {r.requestedThisMonth ? (
                <Alert tone="success">{t("status.already")}</Alert>
              ) : (
                <ButtonLink href="/request">{t("status.submit_request")}</ButtonLink>
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
