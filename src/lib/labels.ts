import type { Category, Status } from "@prisma/client";

export const CATEGORIES: Category[] = ["WIDOW", "ELDERLY", "DISABLED"];
export const STATUSES: Status[] = ["PENDING", "APPROVED", "REJECTED"];

export function cardNumber(n: number, locale = "en-GB") {
  return n.toLocaleString(locale, { minimumIntegerDigits: 6, useGrouping: false });
}
