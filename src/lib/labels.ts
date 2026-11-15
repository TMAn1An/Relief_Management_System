import type { Category, Status } from "@prisma/client";

export const CATEGORY_LABEL: Record<Category, string> = {
  WIDOW: "Widow",
  ELDERLY: "Elderly",
  DISABLED: "Disabled",
};

export const STATUS_LABEL: Record<Status, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export const CATEGORIES = Object.keys(CATEGORY_LABEL) as Category[];
export const STATUSES = Object.keys(STATUS_LABEL) as Status[];

export function cardNumber(n: number) {
  return String(n).padStart(6, "0");
}
