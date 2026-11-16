import { HandHeart, PersonStanding, Users, ShieldCheck, ClipboardCheck, CalendarClock } from "lucide-react";
import { ButtonLink, Card } from "@/components/ui";
import { db } from "@/lib/db";
import { periodOf } from "@/lib/period";
import { getT } from "@/lib/i18n/server";
import { localeOf } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function Home() {
  const t = await getT();
  const nf = new Intl.NumberFormat(localeOf(t.lang));
  const programs = [
    { icon: Users, title: t("home.p1_title"), text: t("home.p1_text") },
    { icon: HandHeart, title: t("home.p2_title"), text: t("home.p2_text") },
    { icon: PersonStanding, title: t("home.p3_title"), text: t("home.p3_text") },
  ];
  const steps = [
    { icon: ClipboardCheck, title: t("home.s1_title"), text: t("home.s1_text") },
    { icon: ShieldCheck, title: t("home.s2_title"), text: t("home.s2_text") },
    { icon: CalendarClock, title: t("home.s3_title"), text: t("home.s3_text") },
  ];
  // The landing page must stay up even if the database is briefly unreachable.
  const stats = await Promise.all([
    db.recipient.count({ where: { status: "APPROVED" } }),
    db.distribution.count({ where: { period: periodOf() } }),
  ]).catch(() => null);

  return (
    <>
      <section className="bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            {t("home.hero_title")}
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-brand-100">
            {t("home.hero_text")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/apply" className="!bg-white !text-brand-800 hover:!bg-brand-50">{t("home.cta_apply")}</ButtonLink>
            <ButtonLink href="/status" variant="ghost" className="!text-white ring-1 ring-white/40 hover:!bg-white/10">
              {t("home.cta_status")}
            </ButtonLink>
          </div>
          {stats && (
            <dl className="mt-12 grid max-w-md grid-cols-2 gap-6">
              <div>
                <dt className="text-sm text-brand-100">{t("home.stat_recipients")}</dt>
                <dd className="text-3xl font-bold">{nf.format(stats[0])}</dd>
              </div>
              <div>
                <dt className="text-sm text-brand-100">{t("home.stat_distributed")}</dt>
                <dd className="text-3xl font-bold">{nf.format(stats[1])}</dd>
              </div>
            </dl>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-2xl font-bold">{t("home.who")}</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {programs.map(({ icon: Icon, title, text }) => (
            <Card key={title}>
              <span className="inline-flex rounded-xl bg-brand-50 p-3 text-brand-700"><Icon className="h-6 w-6" aria-hidden /></span>
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted">{text}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4">
        <h2 className="text-2xl font-bold">{t("home.how")}</h2>
        <ol className="mt-6 grid gap-4 md:grid-cols-3">
          {steps.map(({ icon: Icon, title, text }) => (
            <li key={title}>
              <Card className="h-full">
                <Icon className="h-6 w-6 text-brand-700" aria-hidden />
                <h3 className="mt-3 font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-muted">{text}</p>
              </Card>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
