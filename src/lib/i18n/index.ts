import { en, type TKey } from "./en";
import { bn } from "./bn";

export type Lang = "en" | "bn";
export const LANGS: Lang[] = ["en", "bn"];
export const DEFAULT_LANG: Lang = "en";
export const LANG_COOKIE = "lang";

export const dictionaries: Record<Lang, Record<TKey, string>> = { en, bn };
export type { TKey };

export type TFn = (key: TKey, vars?: Record<string, string | number>) => string;

export function isLang(v: unknown): v is Lang {
  return v === "en" || v === "bn";
}

export function makeT(lang: Lang): TFn {
  const dict = dictionaries[lang];
  return (key, vars) => {
    let s: string = dict[key] ?? en[key] ?? key;
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
    return s;
  };
}

/** Locale used for numbers and dates. Bangladesh locale gives Bengali digits and month names. */
export const localeOf = (lang: Lang) => (lang === "bn" ? "bn-BD" : "en-GB");
