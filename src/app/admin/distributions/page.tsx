import Link from "next/link";
import { db } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { deleteDistribution } from "@/app/actions/admin";
import { Card, EmptyState, PageHeader } from "@/components/ui";
import { ConfirmButton } from "@/components/confirm-button";
import { formatDate, formatPeriod, periodOf } from "@/lib/period";
import { getT } from "@/lib/i18n/server";
import { localeOf } from "@/lib/i18n";
import { DistributionForm } from "./distribution-form";

export async function generateMetadata() {
  return { title: (await getT())("dist.title") };
}

export default async function Distributions() {
  const t = await getT();
  const locale = localeOf(t.lang);
  const nf = new Intl.NumberFormat(locale);
  const period = periodOf();
  const [user, rows] = await Promise.all([
    getUser(),
    db.distribution.findMany({ where: { period }, orderBy: { distributedAt: "desc" }, take: 100, include: { recipient: true } }),
  ]);

  return (
    <>
      <PageHeader title={t("dist.title")} description={t("dist.desc", { month: formatPeriod(period, "long", locale) })} />
      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <Card className="h-fit"><h2 className="mb-4 font-semibold">{t("dist.new")}</h2><DistributionForm /></Card>
        {rows.length === 0 ? (
          <EmptyState title={t("dist.empty_title")} description={t("dist.empty_desc")} />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-sm">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="border-b border-line bg-slate-50 text-xs uppercase tracking-wide text-muted">
                <tr><th className="px-4 py-3">{t("dist.th_recipient")}</th><th className="px-4 py-3">{t("dist.th_item")}</th><th className="px-4 py-3">{t("dist.th_qty")}</th><th className="px-4 py-3">{t("dist.th_date")}</th>{user?.role === "ADMIN" && <th className="px-4 py-3" />}</tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((d) => (
                  <tr key={d.id}>
                    <td className="px-4 py-3"><Link href={`/admin/recipients/${d.recipientId}`} className="font-medium hover:underline">{d.recipient.name}</Link><div className="text-xs text-muted">{d.recipient.nid}</div></td>
                    <td className="px-4 py-3">{d.itemName}</td>
                    <td className="px-4 py-3 tabular-nums">{nf.format(Number(d.quantity))}</td>
                    <td className="px-4 py-3 text-muted">{formatDate(d.distributedAt, true, locale)}</td>
                    {user?.role === "ADMIN" && (
                      <td className="px-4 py-3 text-right">
                        <ConfirmButton action={deleteDistribution.bind(null, d.id)} message={t("dist.remove_confirm")} variant="ghost" className="!min-h-9 !px-3 !py-1.5 !text-red-700 hover:!bg-red-50">{t("dist.remove")}</ConfirmButton>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
