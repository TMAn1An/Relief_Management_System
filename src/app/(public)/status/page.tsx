import type { Metadata } from "next";
import { getT } from "@/lib/i18n/server";
import { StatusForm } from "./status-form";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("status.meta_title") };
}

export default async function StatusPage() {
  const t = await getT();
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">{t("status.title")}</h1>
      <p className="mb-6 mt-2 text-muted">{t("status.subtitle")}</p>
      <StatusForm />
    </div>
  );
}
