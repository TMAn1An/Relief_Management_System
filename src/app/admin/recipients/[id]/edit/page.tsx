import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Card, PageHeader } from "@/components/ui";
import { getT } from "@/lib/i18n/server";
import { EditForm } from "./edit-form";

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, t] = await Promise.all([params, getT()]);
  const r = await db.recipient.findUnique({ where: { id } });
  if (!r) notFound();
  return (
    <>
      <PageHeader title={t("edit.title", { name: r.name })} />
      <Card className="max-w-2xl">
        <EditForm recipient={{ id: r.id, nid: r.nid, name: r.name, phone: r.phone, age: r.age, category: r.category }} />
      </Card>
    </>
  );
}
