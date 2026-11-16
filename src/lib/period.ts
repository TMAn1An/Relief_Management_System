/**
 * Relief cycles are calendar months in Bangladesh time (Asia/Dhaka, UTC+6, no DST).
 * A "period" is a "YYYY-MM" string.
 */
const TZ = "Asia/Dhaka";
const OFFSET_HOURS = 6;

export function periodOf(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(date);
  const y = parts.find((p) => p.type === "year")!.value;
  const m = parts.find((p) => p.type === "month")!.value;
  return `${y}-${m}`;
}

/** Instant (UTC) at which the month after `period` begins in Dhaka. */
export function nextPeriodStart(period: string): Date {
  const [y, m] = period.split("-").map(Number);
  return new Date(Date.UTC(y, m, 1, -OFFSET_HOURS, 0, 0));
}

export function nextPeriod(period: string): string {
  const [y, m] = period.split("-").map(Number);
  return m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`;
}

export function previousPeriods(count: number, from: string = periodOf()): string[] {
  const out: string[] = [];
  let [y, m] = from.split("-").map(Number);
  for (let i = 0; i < count; i++) {
    out.push(`${y}-${String(m).padStart(2, "0")}`);
    m -= 1;
    if (m === 0) {
      m = 12;
      y -= 1;
    }
  }
  return out.reverse();
}

export function formatPeriod(period: string, style: "long" | "short" = "long", locale = "en-GB"): string {
  const [y, m] = period.split("-").map(Number);
  return new Intl.DateTimeFormat(locale, {
    month: style,
    year: style === "long" ? "numeric" : "2-digit",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, 1)));
}

export function formatDate(date: Date, withTime = false, locale = "en-GB"): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone: TZ,
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(date);
}
