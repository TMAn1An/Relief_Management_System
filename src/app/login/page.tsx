import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { HeartHandshake } from "lucide-react";
import { getUser } from "@/lib/auth";
import { Card } from "@/components/ui";
import { LanguageSwitcher } from "@/components/language-switcher";
import { getT } from "@/lib/i18n/server";
import { LoginForm } from "./login-form";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("login.title"), robots: { index: false, follow: false } };
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (await getUser()) redirect("/admin");
  const [{ next }, t] = await Promise.all([searchParams, getT()]);
  return (
    <main id="main" className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-4">
      <div className="mb-6 text-center">
        <HeartHandshake className="mx-auto h-10 w-10 text-brand-700" aria-hidden />
        <h1 className="mt-3 text-2xl font-bold">{t("login.title")}</h1>
        <p className="mt-1 text-sm text-muted">{t("login.subtitle")}</p>
      </div>
      <Card>
        <LoginForm next={next} />
      </Card>
      <LanguageSwitcher className="mt-4 text-center" />
    </main>
  );
}
