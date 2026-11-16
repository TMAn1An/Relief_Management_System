import "server-only";
import { cookies, headers } from "next/headers";
import { DEFAULT_LANG, LANG_COOKIE, isLang, makeT, type Lang, type TFn } from "./index";

/** Language from the cookie, else from Accept-Language (Bangla speakers get Bangla by default). */
export async function getLang(): Promise<Lang> {
  const c = (await cookies()).get(LANG_COOKIE)?.value;
  if (isLang(c)) return c;
  const accept = (await headers()).get("accept-language")?.toLowerCase() ?? "";
  return /^\s*bn\b/.test(accept) ? "bn" : DEFAULT_LANG;
}

export async function getT(): Promise<TFn & { lang: Lang }> {
  const lang = await getLang();
  return Object.assign(makeT(lang), { lang });
}
