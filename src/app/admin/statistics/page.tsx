import { db } from "@/lib/db";
import { Card, PageHeader } from "@/components/ui";
import { CATEGORIES } from "@/lib/labels";
import { formatPeriod, periodOf, previousPeriods } from "@/lib/period";
import { getT } from "@/lib/i18n/server";
import { localeOf } from "@/lib/i18n";

export async function generateMetadata() {
  return { title: (await getT())("stats.title") };
}

export default async function Statistics() {
  const t = await getT();
  const locale = localeOf(t.lang);
  const nf = new Intl.NumberFormat(locale);
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
  const month = formatPeriod(periodOf(), "long", locale);

  return (
    <>
      <PageHeader title={t("stats.title")} description={t("stats.desc")} />
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><p className="text-sm text-muted">{t("stats.req_month", { month })}</p><p className="mt-1 text-3xl font-bold tabular-nums">{nf.format(current.total)}</p></Card>
        <Card><p className="text-sm text-muted">{t("stats.dist_month", { month })}</p><p className="mt-1 text-3xl font-bold tabular-nums">{nf.format(current.distributed)}</p></Card>
        <Card><p className="text-sm text-muted">{t("stats.req_12")}</p><p className="mt-1 text-3xl font-bold tabular-nums">{nf.format(totalAll)}</p></Card>
      </div>

      <Card className="mt-6">
        <h2 className="font-semibold">{t("stats.chart")}</h2>
        <div className="mt-6 flex h-52 items-end gap-2" role="img" aria-label={t("stats.chart_aria", { n: nf.format(current.total) })}>
          {rows.map((r) => (
            <div key={r.period} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1">
              <span className="text-xs font-medium tabular-nums">{r.total ? nf.format(r.total) : ""}</span>
              <div className="w-full rounded-t-md bg-brand-600" style={{ height: `${(r.total / max) * 100}%`, minHeight: r.total ? 4 : 0 }} />
              <span className="text-[10px] text-muted sm:text-xs">{formatPeriod(r.period, "short", locale).split(" ")[0]}</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-white shadow-sm">
        <table className="w-full min-w-[620px] text-left text-sm">
          <caption className="sr-only">{t("stats.breakdown")}</caption>
          <thead className="border-b border-line bg-slate-50 text-xs uppercase tracking-wide text-muted">
            <tr><th className="px-4 py-3">{t("stats.th_month")}</th><th className="px-4 py-3">{t("stats.th_requests")}</th>{CATEGORIES.map((c) => <th key={c} className="px-4 py-3">{t(`category.${c}`)}</th>)}<th className="px-4 py-3">{t("stats.th_dist")}</th></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {[...rows].reverse().map((r) => (
              <tr key={r.period}>
                <td className="px-4 py-3 font-medium">{formatPeriod(r.period, "long", locale)}</td>
                <td className="px-4 py-3 tabular-nums">{nf.format(r.total)}</td>
                {CATEGORIES.map((c) => <td key={c} className="px-4 py-3 tabular-nums">{nf.format(r.byCat[c])}</td>)}
                <td className="px-4 py-3 tabular-nums">{nf.format(r.distributed)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
