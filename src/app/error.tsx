"use client";

import { useT } from "@/lib/i18n/client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  const t = useT();
  return (
    <main id="main" className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-4 text-center">
      <h1 className="text-xl font-semibold">{t("err.title")}</h1>
      <p className="mt-2 text-sm text-muted">{t("err.text")}</p>
      <button onClick={reset} className="mt-6 rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-800">
        {t("err.retry")}
      </button>
    </main>
  );
}
