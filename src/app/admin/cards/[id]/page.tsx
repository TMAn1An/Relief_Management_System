import { notFound } from "next/navigation";
import { HeartHandshake } from "lucide-react";
import { db } from "@/lib/db";
import { Avatar, ButtonLink, PageHeader } from "@/components/ui";
import { PrintButton } from "@/components/print-button";
import { CATEGORY_LABEL, cardNumber } from "@/lib/labels";
import { formatDate } from "@/lib/period";

export const metadata = { title: "Relief card" };

export default async function CardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const r = await db.recipient.findUnique({ where: { id }, include: { card: true } });
  if (!r || !r.card || r.status !== "APPROVED") notFound();

  return (
    <>
      <div className="no-print">
        <PageHeader title="Relief card" description="Print on A5 landscape or standard card stock." actions={<><ButtonLink href={`/admin/recipients/${r.id}`} variant="secondary">Back</ButtonLink><PrintButton /></>} />
      </div>
      <div className="print-area mx-auto w-full max-w-[520px] overflow-hidden rounded-2xl border border-line bg-white shadow-lg">
        <div className="flex items-center justify-between bg-gradient-to-r from-brand-900 to-brand-700 px-6 py-4 text-white" style={{ printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" }}>
          <div className="flex items-center gap-2 font-bold"><HeartHandshake className="h-6 w-6" aria-hidden /> Relief Card</div>
          <div className="text-right"><p className="text-[11px] uppercase tracking-wider text-brand-100">Card no.</p><p className="font-mono text-lg font-bold tracking-widest">{cardNumber(r.card.cardNo)}</p></div>
        </div>
        <div className="flex gap-5 p-6">
          <Avatar recipientId={r.id} name={r.name} size={112} />
          <dl className="grid flex-1 gap-2 text-sm">
            <div><dt className="text-xs uppercase tracking-wide text-muted">Name</dt><dd className="text-lg font-semibold">{r.name}</dd></div>
            <div className="grid grid-cols-2 gap-2">
              <div><dt className="text-xs uppercase tracking-wide text-muted">NID</dt><dd className="font-medium tabular-nums">{r.nid}</dd></div>
              <div><dt className="text-xs uppercase tracking-wide text-muted">Category</dt><dd className="font-medium">{CATEGORY_LABEL[r.category]}</dd></div>
              <div><dt className="text-xs uppercase tracking-wide text-muted">Age</dt><dd className="font-medium">{r.age}</dd></div>
              <div><dt className="text-xs uppercase tracking-wide text-muted">Issued</dt><dd className="font-medium">{formatDate(r.card.issuedAt)}</dd></div>
            </div>
          </dl>
        </div>
        <p className="border-t border-dashed border-line px-6 py-3 text-center text-[11px] text-muted">This card is non-transferable and must be presented at every distribution.</p>
      </div>
    </>
  );
}
