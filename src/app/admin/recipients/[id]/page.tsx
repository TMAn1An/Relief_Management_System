import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { deleteRecipient } from "@/app/actions/admin";
import { Alert, Avatar, ButtonLink, Card, PageHeader, StatusBadge } from "@/components/ui";
import { StatusActions } from "@/components/status-actions";
import { ConfirmButton } from "@/components/confirm-button";
import { CATEGORY_LABEL, cardNumber } from "@/lib/labels";
import { formatDate, formatPeriod } from "@/lib/period";

export default async function RecipientPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const [{ id }, { saved }, user] = await Promise.all([params, searchParams, getUser()]);
  const r = await db.recipient.findUnique({
    where: { id },
    include: { card: true, requests: { orderBy: { period: "desc" }, take: 12 }, distributions: { orderBy: { distributedAt: "desc" }, take: 20 } },
  });
  if (!r) notFound();

  const facts = [
    ["NID", r.nid], ["Phone", r.phone], ["Age", `${r.age} years`], ["Category", CATEGORY_LABEL[r.category]],
    ["Applied", formatDate(r.createdAt)], ["Relief card", r.card ? cardNumber(r.card.cardNo) : "Not issued"],
  ];

  return (
    <>
      <PageHeader
        title={r.name}
        actions={
          <>
            {r.card && <ButtonLink href={`/admin/cards/${r.id}`} variant="secondary">Print card</ButtonLink>}
            <ButtonLink href={`/admin/recipients/${r.id}/edit`} variant="secondary">Edit</ButtonLink>
          </>
        }
      />
      {saved && <Alert tone="success" className="mb-4">Changes saved.</Alert>}

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card className="h-fit">
          <div className="flex flex-col items-center text-center">
            <Avatar recipientId={r.id} name={r.name} size={112} />
            <div className="mt-3"><StatusBadge status={r.status} /></div>
          </div>
          <dl className="mt-5 space-y-3 text-sm">
            {facts.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4"><dt className="text-muted">{k}</dt><dd className="font-medium tabular-nums">{v}</dd></div>
            ))}
          </dl>
          <div className="mt-5 border-t border-line pt-5">
            <p className="mb-2 text-sm font-medium">Review</p>
            <StatusActions id={r.id} status={r.status} />
          </div>
          {user?.role === "ADMIN" && (
            <div className="mt-5 border-t border-line pt-5">
              <ConfirmButton action={deleteRecipient.bind(null, r.id)} message={`Permanently delete ${r.name} and all their records? This cannot be undone.`} variant="secondary" className="w-full !text-red-700">
                Delete recipient
              </ConfirmButton>
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <Card>
            <h2 className="font-semibold">Monthly requests</h2>
            {r.requests.length === 0 ? <p className="mt-2 text-sm text-muted">No requests yet.</p> : (
              <ul className="mt-3 flex flex-wrap gap-2">{r.requests.map((q) => <li key={q.id} className="rounded-full bg-brand-50 px-3 py-1 text-sm text-brand-800">{formatPeriod(q.period)}</li>)}</ul>
            )}
          </Card>
          <Card>
            <h2 className="font-semibold">Distribution history</h2>
            {r.distributions.length === 0 ? <p className="mt-2 text-sm text-muted">Nothing distributed yet.</p> : (
              <table className="mt-3 w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wide text-muted"><tr><th className="py-2">Item</th><th>Qty</th><th className="text-right">Date</th></tr></thead>
                <tbody className="divide-y divide-line">
                  {r.distributions.map((d) => (
                    <tr key={d.id}><td className="py-2.5">{d.itemName}</td><td className="tabular-nums">{d.quantity.toString()}</td><td className="text-right text-muted">{formatDate(d.distributedAt)}</td></tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
