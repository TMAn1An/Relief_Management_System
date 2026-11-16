"use client";

import { useTransition } from "react";
import { buttonClass, type ButtonVariant } from "./ui";
import { useT } from "@/lib/i18n/client";

/** Runs a server action after a native confirm() prompt. */
export function ConfirmButton({
  action,
  message,
  children,
  variant = "danger",
  className,
}: {
  action: () => Promise<void>;
  message: string;
  children: React.ReactNode;
  variant?: ButtonVariant;
  className?: string;
}) {
  const t = useT();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      className={buttonClass(variant, className)}
      onClick={() => {
        if (window.confirm(message)) start(() => action());
      }}
    >
      {pending ? t("common.working") : children}
    </button>
  );
}
