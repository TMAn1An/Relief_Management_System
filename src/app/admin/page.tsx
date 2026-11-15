import Link from "next/link";
import { Users, Clock, CheckCircle2, Package } from "lucide-react";
import { db } from "@/lib/db";
import { periodOf, formatDate, formatPeriod } from "@/lib/period";
import { Alert, Card, PageHeader, StatusBadge } from "@/components/ui";
import { CATEGORY_LABEL } from "@/lib/labels";

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const { denied } = await searchParams;
  const period = periodOf();
  const [total, pending, approved, requests, distributions, recent] = await Promise.all([
    db.recipient.count(),
    db.recipient.count({ where: { status: "PENDING" } }),
    db.recipient.count({ where: { status: "APPROVED" } }),
    db.reliefRequest.count({ where: { period } }),
    db.distribution.count({ where: { period } }),
    db.recipient.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
  ]);

  const stats = [
    { label: "Total recipients", value: total, icon: Users },
    { label: "Awaiting review", value: pending, icon: Clock, href: "/admin/approvals" },
    { label: "Approved", value: approved, icon: CheckCircle2 },
    { label: `Requests · ${formatPeriod(period)}`, value: requests, icon: Package },
    { label: `Distributions · ${formatPeriod(period)}`, value: distributions, icon: Package, href: "/admin/distributions" },
  ];

  return (
    <>
      <PageHeader title="Dashboard" description="An overview of relief operations at a glance." />
      {denied && <Alert tone="error" className="mb-6">You need administrator access to do that.</Alert>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map(({ label, value, icon: Icon, href }) => {
          const body = (
            <Card className="h-full transition-shadow hover:shadow-md">
              <Icon className="h-5 w-5 text-brand-700" aria-hidden />
              <p className="mt-3 text-3xl font-bold tabular-nums">{value.toLocaleString("en-GB")}</p>
              <p className="text-sm text-muted">{label}</p>
            </Card>
          );
          return href ? <Link key={label} href={href}>{body}</Link> : <div key={label}>{body}</div>;
        })}
      </div>

      <h2 className="mb-3 mt-10 text-lg font-semibold">Recent applications</h2>
      <Card className="!p-0">
        {recent.length === 0 ? (
          <p className="p-6 text-sm text-muted">No applications yet.</p>
        ) : (
          <ul className="divide-y divide-line">
            {recent.map((r) => (
              <li key={r.id}>
                <Link href={`/admin/recipients/${r.id}`} className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-slate-50">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{r.name}</p>
                    <p className="text-xs text-muted">{CATEGORY_LABEL[r.category]} · applied {formatDate(r.createdAt)}</p>
                  </div>
                  <StatusBadge status={r.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
