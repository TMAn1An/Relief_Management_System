import { ButtonLink } from "@/components/ui";
import { getT } from "@/lib/i18n/server";

export default async function NotFound() {
  const t = await getT();
  return (
    <main id="main" className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-4 text-center">
      <p className="text-5xl font-bold text-brand-700">404</p>
      <h1 className="mt-3 text-xl font-semibold">{t("nf.title")}</h1>
      <p className="mt-2 text-sm text-muted">{t("nf.text")}</p>
      <ButtonLink href="/" className="mt-6">{t("nf.home")}</ButtonLink>
    </main>
  );
}
