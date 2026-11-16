"use client";

import { Printer } from "lucide-react";
import { buttonClass } from "./ui";
import { useT } from "@/lib/i18n/client";

export function PrintButton() {
  const t = useT();
  return (
    <button type="button" onClick={() => window.print()} className={buttonClass("primary")}>
      <Printer className="h-4 w-4" aria-hidden /> {t("det.print_card")}
    </button>
  );
}
