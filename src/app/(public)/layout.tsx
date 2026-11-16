import Link from "next/link";
import { HeartHandshake } from "lucide-react";
import { ButtonLink } from "@/components/ui";
import { LanguageSwitcher } from "@/components/language-switcher";
import { getT } from "@/lib/i18n/server";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const t = await getT();
  const links = [
    { href: "/apply", label: t("nav.apply") },
    { href: "/status", label: t("nav.status") },
    { href: "/request", label: t("nav.request") },
  ];
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-3">
          <Link href="/" className="flex items-center gap-2 font-bold text-brand-800">
            <HeartHandshake className="h-6 w-6" aria-hidden />
            <span className="hidden sm:inline">{t("brand.name")}</span>
          </Link>
          <nav aria-label={t("nav.main")} className="flex flex-wrap items-center gap-1 text-sm font-medium">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100">
                {l.label}
              </Link>
            ))}
            <LanguageSwitcher />
            <ButtonLink href="/login" variant="secondary" className="ml-1 !min-h-9 !px-3 !py-1.5">
              {t("nav.staff_login")}
            </ButtonLink>
          </nav>
        </div>
      </header>
      <main id="main">{children}</main>
      <footer className="mt-16 border-t border-line bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-muted">
          <p className="font-medium text-ink">{t("footer.title")}</p>
          <p className="mt-1">{t("footer.text")}</p>
        </div>
      </footer>
    </>
  );
}
