"use client";

import { useActionState } from "react";
import { submitMonthlyRequest } from "@/app/actions/public";
import { SubmitButton } from "@/components/submit-button";
import { Alert, Card } from "@/components/ui";
import { formatDate } from "@/lib/period";
import { useLocale, useT } from "@/lib/i18n/client";
import { VerifyFields } from "../VerifyFields";
import { Countdown } from "./countdown";

export function RequestForm() {
  const t = useT();
  const locale = useLocale();
  const [state, action] = useActionState(submitMonthlyRequest, {});
  const next = state.data?.nextRequestAt;

  return (
    <div className="space-y-6">
      <Card>
        <form action={action} className="space-y-5" noValidate>
          {state.ok && <Alert tone="success">{state.message} {t("request.success_extra")}</Alert>}
          {!state.ok && state.message && <Alert tone="error">{state.message}</Alert>}
          <VerifyFields errors={state.errors} values={state.values} />
          <SubmitButton pendingText={t("request.submitting")}>{t("request.submit")}</SubmitButton>
        </form>
      </Card>

      {next && (
        <section className="rounded-2xl bg-gradient-to-br from-brand-900 to-brand-700 p-6 text-white">
          <Countdown target={next} />
          <p className="mt-4 text-sm text-brand-100">{t("request.again_on", { date: formatDate(new Date(next), false, locale) })}</p>
        </section>
      )}
    </div>
  );
}
