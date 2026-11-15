"use client";

import { useTransition } from "react";
import type { Status } from "@prisma/client";
import { setRecipientStatus } from "@/app/actions/admin";
import { buttonClass } from "./ui";

export function StatusActions({ id, status, compact }: { id: string; status: Status; compact?: boolean }) {
  const [pending, start] = useTransition();
  const cls = (v: "primary" | "secondary" | "danger") => buttonClass(v, compact ? "!min-h-9 !px-3 !py-1.5" : "");
  const set = (s: Status) => start(() => setRecipientStatus(id, s));
  return (
    <div className="flex flex-wrap gap-2">
      {status !== "APPROVED" && (
        <button disabled={pending} onClick={() => set("APPROVED")} className={cls("primary")}>Approve</button>
      )}
      {status !== "REJECTED" && (
        <button
          disabled={pending}
          onClick={() => window.confirm("Reject this application?") && set("REJECTED")}
          className={cls("danger")}
        >
          Reject
        </button>
      )}
      {status !== "PENDING" && (
        <button disabled={pending} onClick={() => set("PENDING")} className={cls("secondary")}>Mark pending</button>
      )}
    </div>
  );
}
