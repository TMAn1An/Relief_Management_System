"use client";

import { useEffect, useState } from "react";

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { days: Math.floor(s / 86400), hours: Math.floor((s % 86400) / 3600), minutes: Math.floor((s % 3600) / 60), seconds: s % 60 };
}

export function Countdown({ target }: { target: string }) {
  const end = new Date(target).getTime();
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const p = parts(now === null ? 0 : end - now);
  return (
    <div>
      <p className="text-sm font-medium text-brand-100">Next request opens in</p>
      <div className="mt-3 grid grid-cols-4 gap-2 text-center" role="timer" aria-label="Time until next request opens">
        {(["days", "hours", "minutes", "seconds"] as const).map((k) => (
          <div key={k} className="rounded-xl bg-white/10 px-2 py-3">
            <div className="text-2xl font-bold tabular-nums sm:text-3xl">{now === null ? "–" : String(p[k]).padStart(2, "0")}</div>
            <div className="text-[11px] uppercase tracking-wide text-brand-100">{k}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
