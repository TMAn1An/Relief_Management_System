import type { Metadata } from "next";
import { Card } from "@/components/ui";
import { getT } from "@/lib/i18n/server";
import { ApplyForm } from "./apply-form";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("apply.title") };
}

export default async function ApplyPage() {
  const t = await getT();
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">{t("apply.title")}</h1>
      <p className="mt-2 text-muted">{t("apply.subtitle")}</p>
      <Card className="mt-6">
        <ApplyForm />
      </Card>
    </div>
  );
}
