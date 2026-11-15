import { describe, expect, it } from "vitest";
import { formatPeriod, nextPeriod, nextPeriodStart, periodOf, previousPeriods } from "./period";

describe("period helpers", () => {
  it("uses Dhaka time at month boundaries", () => {
    // 2026-01-31 19:00 UTC is already 2026-02-01 01:00 in Dhaka.
    expect(periodOf(new Date("2026-01-31T19:00:00Z"))).toBe("2026-02");
    expect(periodOf(new Date("2026-01-31T17:59:00Z"))).toBe("2026-01");
  });

  it("computes the next period start in UTC", () => {
    expect(nextPeriodStart("2026-02").toISOString()).toBe("2026-02-28T18:00:00.000Z");
    expect(nextPeriodStart("2026-12").toISOString()).toBe("2026-12-31T18:00:00.000Z");
  });

  it("rolls over the year", () => {
    expect(nextPeriod("2026-12")).toBe("2027-01");
    expect(nextPeriod("2026-03")).toBe("2026-04");
  });

  it("lists previous periods oldest-first", () => {
    expect(previousPeriods(3, "2026-02")).toEqual(["2025-12", "2026-01", "2026-02"]);
  });

  it("formats periods", () => {
    expect(formatPeriod("2026-03")).toBe("March 2026");
  });
});
