import Link from "next/link";
import type { Category, Prisma, Status } from "@prisma/client";
import { db } from "@/lib/db";
import { Alert, Avatar, ButtonLink, EmptyState, PageHeader, StatusBadge, inputClass } from "@/components/ui";
import { CATEGORIES, STATUSES } from "@/lib/labels";
import { getT } from "@/lib/i18n/server";
import { localeOf } from "@/lib/i18n";

export async function generateMetadata() {
  return { title: (await getT())("rec.title") };
}
const PAGE_SIZE = 15;

type SP = { q?: string; status?: string; category?: string; page?: string; deleted?: string };

export default async function Recipients({ searchParams }: { searchParams: Promise<SP> }) {
  const [sp, t] = await Promise.all([searchParams, getT()]);
  const nf = new Intl.NumberFormat(localeOf(t.lang));
  const q = sp.q?.trim() ?? "";
  const status = STATUSES.includes(sp.status as Status) ? (sp.status as Status) : undefined;
  const category = CATEGORIES.includes(sp.category as Category) ? (sp.category as Category) : undefined;
  const page = Math.max(1, Number(sp.page) || 1);

  const where: Prisma.RecipientWhereInput = {
    ...(status && { status }),
    ...(category && { category }),
    ...(q && { OR: [{ name: { contains: q } }, { nid: { contains: q } }, { phone: { contains: q } }] }),
  };
  const [total, rows] = await Promise.all([
    db.recipient.count({ where }),
    db.recipient.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE, include: { card: true } }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const link = (p: number) => {
    const u = new URLSearchParams();
    if (q) u.set("q", q);
    if (status) u.set("status", status);
    if (category) u.set("category", category);
    if (p > 1) u.set("page", String(p));
    return `/admin/recipients?${u}`;
  };

  return (
    <>
      <PageHeader title={t("rec.title")} description={total === 1 ? t("rec.found_one") : t("rec.found", { n: nf.format(total) })} />
      {sp.deleted && <Alert tone="success" className="mb-4">{t("rec.deleted")}</Alert>}

      <form className="mb-5 grid gap-3 sm:grid-cols-[1fr_auto_auto_auto]" role="search">
        <input name="q" defaultValue={q} placeholder={t("rec.search_ph")} aria-label={t("rec.search_aria")} className={inputClass} />
        <select name="status" defaultValue={status ?? ""} aria-label={t("rec.filter_status")} className={inputClass}>
          <option value="">{t("rec.all_statuses")}</option>
          {STATUSES.map((s) => <option key={s} value={s}>{t(`status.${s}`)}</option>)}
        </select>
        <select name="category" defaultValue={category ?? ""} aria-label={t("rec.filter_category")} className={inputClass}>
          <option value="">{t("rec.all_categories")}</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{t(`category.${c}`)}</option>)}
        </select>
        <button className="min-h-11 rounded-lg bg-brand-700 px-5 text-sm font-semibold text-white hover:bg-brand-800">{t("rec.apply")}</button>
      </form>

      {rows.length === 0 ? (
        <EmptyState title={t("rec.none_title")} description={t("rec.none_desc")} action={<ButtonLink href="/admin/recipients" variant="secondary">{t("rec.clear")}</ButtonLink>} />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-sm">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-line bg-slate-50 text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">{t("rec.th_recipient")}</th><th className="px-4 py-3">{t("rec.th_nid")}</th><th className="px-4 py-3">{t("rec.th_phone")}</th>
                <th className="px-4 py-3">{t("rec.th_category")}</th><th className="px-4 py-3">{t("rec.th_status")}</th><th className="px-4 py-3 text-right">{t("rec.th_card")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/recipients/${r.id}`} className="flex items-center gap-3 font-medium hover:underline">
                      <Avatar recipientId={r.id} name={r.name} />{r.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 tabular-nums">{r.nid}</td>
                  <td className="px-4 py-3 tabular-nums">{r.phone}</td>
                  <td className="px-4 py-3">{t(`category.${r.category}`)}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} label={t(`status.${r.status}`)} /></td>
                  <td className="px-4 py-3 text-right">
                    {r.card ? <Link href={`/admin/cards/${r.id}`} className="font-medium text-brand-700 hover:underline">{t("rec.print")}</Link> : <span className="text-muted">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <nav aria-label={t("rec.pagination")} className="mt-5 flex items-center justify-between text-sm">
          <span className="text-muted">{t("rec.page", { page: nf.format(page), pages: nf.format(pages) })}</span>
          <div className="flex gap-2">
            {page > 1 && <ButtonLink href={link(page - 1)} variant="secondary">{t("rec.prev")}</ButtonLink>}
            {page < pages && <ButtonLink href={link(page + 1)} variant="secondary">{t("rec.next")}</ButtonLink>}
          </div>
        </nav>
      )}
    </>
  );
}
