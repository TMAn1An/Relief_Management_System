import { describe, expect, it } from "vitest";
import { en } from "./en";
import { bn } from "./bn";
import { makeT, localeOf } from "./index";

const vars = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(",");

describe("dictionaries", () => {
  it("have the same keys", () => {
    expect(Object.keys(bn).sort()).toEqual(Object.keys(en).sort());
  });
  it("use the same {placeholders} in both languages", () => {
    for (const k of Object.keys(en) as (keyof typeof en)[]) {
      expect(vars(bn[k]), `placeholders of ${k}`).toBe(vars(en[k]));
    }
  });
  it("have no empty strings", () => {
    for (const k of Object.keys(en) as (keyof typeof en)[]) {
      expect(en[k].trim(), `en ${k}`).not.toBe("");
      expect(bn[k].trim(), `bn ${k}`).not.toBe("");
    }
  });
});

describe("makeT", () => {
  it("interpolates variables", () => {
    expect(makeT("en")("rec.found", { n: 5 })).toBe("5 recipients found");
    expect(makeT("bn")("rec.found", { n: "৫" })).toBe("৫ জন উপকারভোগী পাওয়া গেছে");
  });
  it("uses Bangladeshi locale for Bangla", () => {
    expect(localeOf("bn")).toBe("bn-BD");
    expect(new Intl.NumberFormat(localeOf("bn")).format(120)).toBe("১২০");
  });
});
