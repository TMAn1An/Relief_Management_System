"use client";

import { createContext, useContext, useMemo } from "react";
import { dictionaries, localeOf, makeT, type Lang, type TFn } from "./index";

const Ctx = createContext<Lang>("en");

export function I18nProvider({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return <Ctx.Provider value={lang}>{children}</Ctx.Provider>;
}

export function useLang(): Lang {
  return useContext(Ctx);
}

export function useT(): TFn {
  const lang = useContext(Ctx);
  return useMemo(() => makeT(lang), [lang]);
}

export function useLocale(): string {
  return localeOf(useContext(Ctx));
}

export { dictionaries };
