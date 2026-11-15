import { db } from "@/lib/db";
import { Card, PageHeader } from "@/components/ui";
import { CATEGORIES, CATEGORY_LABEL } from "@/lib/labels";
import { formatPeriod, periodOf, previousPeriods } from "@/lib/period";

export const metadata = { title: "Statistics" };

export default async function Statistics() {
  const periods = previousPeriods(12);
  const [requests, distributions] = await Promise.all([
    db.reliefRequest.findMany({ where: { period: { in: periods } }, select: { period: true, recipient: { select: { category: true } } } }),
    db.distribution.groupBy({ by: ["period"], where: { period: { in: periods } }, _count: { _all: true } }),
  ]);

  const rows = periods.map((p) => {
    const mine = requests.filter((r) => r.period === p);
    const byCat = Object.fromEntries(CATEGORIES.map((c) => [c, mine.filter((r) => r.recipient.category === c).length]));
    return { period: p, total: mine.length, byCat, distributed: distributions.find((d) => d.period === p)?._count._all ?? 0 };
  });
  const max = Math.max(1, ...rows.map((r) => r.total));
  const current = rows[rows.length - 1];
  const totalAll = rows.reduce((s, r) => s + r.total, 0);

  return (
    <>
      <PageHeader title="Statistics" description="Monthly relief requests and distributions over the last 12 months." />
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><p className="text-sm text-muted">Requests · {formatPeriod(periodOf())}</p><p className="mt-1 text-3xl font-bold tabular-nums">{current.total}</p></Card>
        <Card><p className="text-sm text-muted">Distributions · {formatPeriod(periodOf())}</p><p className="mt-1 text-3xl font-bold tabular-nums">{current.distributed}</p></Card>
        <Card><p className="text-sm text-muted">Requests · last 12 months</p><p className="mt-1 text-3xl font-bold tabular-nums">{totalAll}</p></Card>
      </div>

      <Card className="mt-6">
        <h2 className="font-semibold">Requests per month</h2>
        <div className="mt-6 flex h-52 items-end gap-2" role="img" aria-label={`Bar chart of monthly requests; this month has ${current.total}`}>
          {rows.map((r) => (
            <div key={r.period} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1">
              <span className="text-xs font-medium tabular-nums">{r.total || ""}</span>
              <div className="w-full rounded-t-md bg-brand-600" style={{ height: `${(r.total / max) * 100}%`, minHeight: r.total ? 4 : 0 }} />
              <span className="text-[10px] text-muted sm:text-xs">{formatPeriod(r.period, "short").split(" ")[0]}</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-white shadow-sm">
        <table className="w-full min-w-[620px] text-left text-sm">
          <caption className="sr-only">Monthly breakdown</caption>
          <thead className="border-b border-line bg-slate-50 text-xs uppercase tracking-wide text-muted">
            <tr><th className="px-4 py-3">Month</th><th className="px-4 py-3">Requests</th>{CATEGORIES.map((c) => <th key={c} className="px-4 py-3">{CATEGORY_LABEL[c]}</th>)}<th className="px-4 py-3">Distributions</th></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {[...rows].reverse().map((r) => (
              <tr key={r.period}>
                <td className="px-4 py-3 font-medium">{formatPeriod(r.period)}</td>
                <td className="px-4 py-3 tabular-nums">{r.total}</td>
                {CATEGORIES.map((c) => <td key={c} className="px-4 py-3 tabular-nums">{r.byCat[c]}</td>)}
                <td className="px-4 py-3 tabular-nums">{r.distributed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
