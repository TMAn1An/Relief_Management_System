import Link from "next/link";
import { Users, Clock, CheckCircle2, Package } from "lucide-react";
import { db } from "@/lib/db";
import { periodOf, formatDate, formatPeriod } from "@/lib/period";
import { Alert, Card, PageHeader, StatusBadge } from "@/components/ui";
import { getT } from "@/lib/i18n/server";
import { localeOf } from "@/lib/i18n";

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const [{ denied }, t] = await Promise.all([searchParams, getT()]);
  const locale = localeOf(t.lang);
  const nf = new Intl.NumberFormat(locale);
  const period = periodOf();
  const month = formatPeriod(period, "long", locale);
  const [total, pending, approved, requests, distributions, recent] = await Promise.all([
    db.recipient.count(),
    db.recipient.count({ where: { status: "PENDING" } }),
    db.recipient.count({ where: { status: "APPROVED" } }),
    db.reliefRequest.count({ where: { period } }),
    db.distribution.count({ where: { period } }),
    db.recipient.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
  ]);

  const stats = [
    { label: t("dash.total"), value: total, icon: Users },
    { label: t("dash.awaiting"), value: pending, icon: Clock, href: "/admin/approvals" },
    { label: t("dash.approved"), value: approved, icon: CheckCircle2 },
    { label: t("dash.requests", { month }), value: requests, icon: Package },
    { label: t("dash.distributions", { month }), value: distributions, icon: Package, href: "/admin/distributions" },
  ];

  return (
    <>
      <PageHeader title={t("dash.title")} description={t("dash.desc")} />
      {denied && <Alert tone="error" className="mb-6">{t("admin.denied")}</Alert>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map(({ label, value, icon: Icon, href }) => {
          const body = (
            <Card className="h-full transition-shadow hover:shadow-md">
              <Icon className="h-5 w-5 text-brand-700" aria-hidden />
              <p className="mt-3 text-3xl font-bold tabular-nums">{nf.format(value)}</p>
              <p className="text-sm text-muted">{label}</p>
            </Card>
          );
          return href ? <Link key={label} href={href}>{body}</Link> : <div key={label}>{body}</div>;
        })}
      </div>

      <h2 className="mb-3 mt-10 text-lg font-semibold">{t("dash.recent")}</h2>
      <Card className="!p-0">
        {recent.length === 0 ? (
          <p className="p-6 text-sm text-muted">{t("dash.none")}</p>
        ) : (
          <ul className="divide-y divide-line">
            {recent.map((r) => (
              <li key={r.id}>
                <Link href={`/admin/recipients/${r.id}`} className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-slate-50">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{r.name}</p>
                    <p className="text-xs text-muted">{t(`category.${r.category}`)} · {t("dash.applied", { date: formatDate(r.createdAt, false, locale) })}</p>
                  </div>
                  <StatusBadge status={r.status} label={t(`status.${r.status}`)} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
