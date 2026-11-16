import { notFound } from "next/navigation";
import { HeartHandshake } from "lucide-react";
import { db } from "@/lib/db";
import { Avatar, ButtonLink, PageHeader } from "@/components/ui";
import { PrintButton } from "@/components/print-button";
import { cardNumber } from "@/lib/labels";
import { formatDate } from "@/lib/period";
import { getT } from "@/lib/i18n/server";
import { localeOf } from "@/lib/i18n";

export async function generateMetadata() {
  return { title: (await getT())("card.title") };
}

export default async function CardPage({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, t] = await Promise.all([params, getT()]);
  const locale = localeOf(t.lang);
  const r = await db.recipient.findUnique({ where: { id }, include: { card: true } });
  if (!r || !r.card || r.status !== "APPROVED") notFound();

  return (
    <>
      <div className="no-print">
        <PageHeader title={t("card.title")} description={t("card.desc")} actions={<><ButtonLink href={`/admin/recipients/${r.id}`} variant="secondary">{t("card.back")}</ButtonLink><PrintButton /></>} />
      </div>
      <div className="print-area mx-auto w-full max-w-[520px] overflow-hidden rounded-2xl border border-line bg-white shadow-lg">
        <div className="flex items-center justify-between bg-gradient-to-r from-brand-900 to-brand-700 px-6 py-4 text-white" style={{ printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" }}>
          <div className="flex items-center gap-2 font-bold"><HeartHandshake className="h-6 w-6" aria-hidden /> {t("card.title")}</div>
          <div className="text-right"><p className="text-[11px] uppercase tracking-wider text-brand-100">{t("card.no")}</p><p className="font-mono text-lg font-bold tracking-widest">{cardNumber(r.card.cardNo, locale)}</p></div>
        </div>
        <div className="flex gap-5 p-6">
          <Avatar recipientId={r.id} name={r.name} size={112} />
          <div className="flex-1 space-y-2 text-sm">
            <dl>
              <div><dt className="text-xs uppercase tracking-wide text-muted">{t("card.name")}</dt><dd className="text-lg font-semibold">{r.name}</dd></div>
            </dl>
            <dl className="grid grid-cols-2 gap-2">
              <div><dt className="text-xs uppercase tracking-wide text-muted">{t("card.nid")}</dt><dd className="font-medium tabular-nums">{r.nid}</dd></div>
              <div><dt className="text-xs uppercase tracking-wide text-muted">{t("card.category")}</dt><dd className="font-medium">{t(`category.${r.category}`)}</dd></div>
              <div><dt className="text-xs uppercase tracking-wide text-muted">{t("card.age")}</dt><dd className="font-medium">{new Intl.NumberFormat(locale).format(r.age)}</dd></div>
              <div><dt className="text-xs uppercase tracking-wide text-muted">{t("card.issued")}</dt><dd className="font-medium">{formatDate(r.card.issuedAt, false, locale)}</dd></div>
            </dl>
          </div>
        </div>
        <p className="border-t border-dashed border-line px-6 py-3 text-center text-[11px] text-muted">{t("card.footer")}</p>
      </div>
    </>
  );
}
