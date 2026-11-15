import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Card, PageHeader } from "@/components/ui";
import { EditForm } from "./edit-form";

export const metadata = { title: "Edit recipient" };

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const r = await db.recipient.findUnique({ where: { id } });
  if (!r) notFound();
  return (
    <>
      <PageHeader title={`Edit ${r.name}`} />
      <Card className="max-w-2xl">
        <EditForm recipient={{ id: r.id, nid: r.nid, name: r.name, phone: r.phone, age: r.age, category: r.category }} />
      </Card>
    </>
  );
}
