"use client";

import { Languages } from "lucide-react";
import { setLanguage } from "@/app/actions/lang";
import { useLang, useT } from "@/lib/i18n/client";

/** A plain form, so switching language works even before JavaScript loads. */
export function LanguageSwitcher({ className }: { className?: string }) {
  const lang = useLang();
  const t = useT();
  const other = lang === "bn" ? "en" : "bn";
  return (
    <form action={setLanguage.bind(null, other)} className={className}>
      <button
        type="submit"
        lang={other}
        aria-label={t("lang.switch_label")}
        className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
      >
        <Languages className="h-4 w-4" aria-hidden /> {t("lang.switch")}
      </button>
    </form>
  );
}
