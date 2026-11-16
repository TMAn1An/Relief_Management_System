import type { Metadata } from "next";
import { getT } from "@/lib/i18n/server";
import { RequestForm } from "./request-form";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("request.title") };
}

export default async function RequestPage() {
  const t = await getT();
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">{t("request.title")}</h1>
      <p className="mb-6 mt-2 text-muted">{t("request.subtitle")}</p>
      <RequestForm />
    </div>
  );
}
