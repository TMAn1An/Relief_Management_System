import Link from "next/link";
import { db } from "@/lib/db";
import { Avatar, Card, EmptyState, PageHeader } from "@/components/ui";
import { StatusActions } from "@/components/status-actions";
import { CATEGORY_LABEL } from "@/lib/labels";
import { formatDate } from "@/lib/period";

export const metadata = { title: "Approvals" };

export default async function Approvals() {
  const pending = await db.recipient.findMany({ where: { status: "PENDING" }, orderBy: { createdAt: "asc" } });
  return (
    <>
      <PageHeader title="Approvals" description="Applications waiting for review, oldest first. Approving an application issues a relief card." />
      {pending.length === 0 ? (
        <EmptyState title="All caught up" description="There are no applications waiting for review." />
      ) : (
        <ul className="space-y-3">
          {pending.map((r) => (
            <li key={r.id}>
              <Card className="flex flex-wrap items-center gap-4">
                <Avatar recipientId={r.id} name={r.name} size={56} />
                <div className="min-w-0 flex-1">
                  <Link href={`/admin/recipients/${r.id}`} className="font-semibold hover:underline">{r.name}</Link>
                  <p className="text-sm text-muted">
                    NID {r.nid} · {r.phone} · {r.age} yrs · {CATEGORY_LABEL[r.category]}
                  </p>
                  <p className="text-xs text-muted">Applied {formatDate(r.createdAt, true)}</p>
                </div>
                <StatusActions id={r.id} status={r.status} compact />
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
