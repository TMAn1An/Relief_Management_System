"use client";

import { useTransition } from "react";
import { buttonClass, type ButtonVariant } from "./ui";

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
      {pending ? "Working…" : children}
    </button>
  );
}
