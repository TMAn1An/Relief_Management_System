import { describe, expect, it } from "vitest";
import { parseClientIp, retryMessage } from "./rate-limit";

const hdr = (o: Record<string, string>) => ({ get: (n: string) => o[n] ?? null });

describe("parseClientIp", () => {
  it("uses the first x-forwarded-for entry", () => expect(parseClientIp(hdr({ "x-forwarded-for": "203.0.113.9, 10.0.0.1" }))).toBe("203.0.113.9"));
  it("falls back to x-real-ip then unknown", () => {
    expect(parseClientIp(hdr({ "x-real-ip": "198.51.100.4" }))).toBe("198.51.100.4");
    expect(parseClientIp(hdr({}))).toBe("unknown");
  });
});

describe("retryMessage", () => {
  it("rounds up to whole minutes", () => {
    expect(retryMessage(30)).toMatch(/a minute/);
    expect(retryMessage(61)).toMatch(/2 minutes/);
    expect(retryMessage(900)).toMatch(/15 minutes/);
  });
});
