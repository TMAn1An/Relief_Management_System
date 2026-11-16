import { headers } from "next/headers";
import { db } from "./db";
import type { TFn } from "./i18n";

/** Client IP as set by the hosting proxy (Vercel overwrites x-forwarded-for, so it can't be spoofed by callers). */
export function parseClientIp(h: { get(name: string): string | null }): string {
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || h.get("x-real-ip")?.trim() || "unknown";
}

export async function clientIp(): Promise<string> {
  return parseClientIp(await headers());
}

export function blockedMessage(t: TFn, seconds: number): string {
  const minutes = Math.ceil(seconds / 60);
  return minutes <= 1 ? t("m.rate_1") : t("m.rate_n", { minutes });
}

/**
 * Counts one hit against `scope:identifier` and reports whether it is still within `limit`
 * per `windowSec`. The upsert is a single atomic statement, so concurrent requests can't slip past the limit.
 * Returns the seconds until the window resets when blocked (see blockedMessage), otherwise null. Fails open if the database errors,
 * so a limiter fault never takes the site down.
 */
export async function rateLimit(scope: string, identifier: string, limit: number, windowSec: number): Promise<number | null> {
  const key = `${scope}:${identifier}`;
  // BigInt on purpose: the libSQL adapter binds plain JS numbers as floats (e.g. 1794772385793.0),
  // which breaks integer comparison and read-back.
  const now = BigInt(Date.now());
  const resetAt = now + BigInt(windowSec) * 1000n;
  try {
    const rows = await db.$queryRaw<{ count: number | bigint; resetAt: number | bigint }[]>`
      INSERT INTO "RateLimit" ("key", "count", "resetAt") VALUES (${key}, 1, ${resetAt})
      ON CONFLICT ("key") DO UPDATE SET
        "count" = CASE WHEN "RateLimit"."resetAt" <= ${now} THEN 1 ELSE "RateLimit"."count" + 1 END,
        "resetAt" = CASE WHEN "RateLimit"."resetAt" <= ${now} THEN ${resetAt} ELSE "RateLimit"."resetAt" END
      RETURNING "count", CAST("resetAt" AS INTEGER) AS "resetAt"`;
    // Housekeeping: occasionally drop expired windows so the table stays small.
    if (Math.random() < 0.02) await db.rateLimit.deleteMany({ where: { resetAt: { lte: now } } });
    const count = Number(rows[0]?.count ?? 0);
    if (count > limit) return Math.max(1, Math.ceil((Number(rows[0].resetAt) - Number(now)) / 1000));
    return null;
  } catch (e) {
    console.error("rateLimit failed open", e);
    return null;
  }
}

/** Forget a counter, e.g. after a successful sign-in. */
export async function clearRateLimit(scope: string, identifier: string): Promise<void> {
  await db.rateLimit.deleteMany({ where: { key: `${scope}:${identifier}` } }).catch(() => undefined);
}
