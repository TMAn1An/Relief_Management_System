import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { Avatar, Card, EmptyState, PageHeader } from "@/components/ui";
import { StatusActions } from "@/components/status-actions";
import { formatDate } from "@/lib/period";
import { getT } from "@/lib/i18n/server";
import { localeOf } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("appr.title") };
}

export default async function Approvals() {
  const t = await getT();
  const locale = localeOf(t.lang);
  const nf = new Intl.NumberFormat(locale);
  const pending = await db.recipient.findMany({ where: { status: "PENDING" }, orderBy: { createdAt: "asc" } });
  return (
    <>
      <PageHeader title={t("appr.title")} description={t("appr.desc")} />
      {pending.length === 0 ? (
        <EmptyState title={t("appr.empty_title")} description={t("appr.empty_desc")} />
      ) : (
        <ul className="space-y-3">
          {pending.map((r) => (
            <li key={r.id}>
              <Card className="flex flex-wrap items-center gap-4">
                <Avatar recipientId={r.id} name={r.name} size={56} />
                <div className="min-w-0 flex-1">
                  <Link href={`/admin/recipients/${r.id}`} className="font-semibold hover:underline">{r.name}</Link>
                  <p className="text-sm text-muted">
                    NID {r.nid} · {r.phone} · {t("appr.yrs", { n: nf.format(r.age) })} · {t(`category.${r.category}`)}
                  </p>
                  <p className="text-xs text-muted">{t("appr.applied", { date: formatDate(r.createdAt, true, locale) })}</p>
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
