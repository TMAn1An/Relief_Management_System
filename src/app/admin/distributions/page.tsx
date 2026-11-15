import Link from "next/link";
import { db } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { deleteDistribution } from "@/app/actions/admin";
import { Card, EmptyState, PageHeader } from "@/components/ui";
import { ConfirmButton } from "@/components/confirm-button";
import { formatDate, formatPeriod, periodOf } from "@/lib/period";
import { DistributionForm } from "./distribution-form";

export const metadata = { title: "Distributions" };

export default async function Distributions() {
  const period = periodOf();
  const [user, rows] = await Promise.all([
    getUser(),
    db.distribution.findMany({ where: { period }, orderBy: { distributedAt: "desc" }, take: 100, include: { recipient: true } }),
  ]);

  return (
    <>
      <PageHeader title="Distributions" description={`Record relief items handed out. Each recipient can receive the same item once per month. Showing ${formatPeriod(period)}.`} />
      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <Card className="h-fit"><h2 className="mb-4 font-semibold">New distribution</h2><DistributionForm /></Card>
        {rows.length === 0 ? (
          <EmptyState title="Nothing distributed yet this month" description="Recorded distributions will appear here." />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-sm">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="border-b border-line bg-slate-50 text-xs uppercase tracking-wide text-muted">
                <tr><th className="px-4 py-3">Recipient</th><th className="px-4 py-3">Item</th><th className="px-4 py-3">Qty</th><th className="px-4 py-3">Date</th>{user?.role === "ADMIN" && <th className="px-4 py-3" />}</tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((d) => (
                  <tr key={d.id}>
                    <td className="px-4 py-3"><Link href={`/admin/recipients/${d.recipientId}`} className="font-medium hover:underline">{d.recipient.name}</Link><div className="text-xs text-muted">{d.recipient.nid}</div></td>
                    <td className="px-4 py-3">{d.itemName}</td>
                    <td className="px-4 py-3 tabular-nums">{d.quantity.toString()}</td>
                    <td className="px-4 py-3 text-muted">{formatDate(d.distributedAt, true)}</td>
                    {user?.role === "ADMIN" && (
                      <td className="px-4 py-3 text-right">
                        <ConfirmButton action={deleteDistribution.bind(null, d.id)} message="Remove this distribution record?" variant="ghost" className="!min-h-9 !px-3 !py-1.5 !text-red-700 hover:!bg-red-50">Remove</ConfirmButton>
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
