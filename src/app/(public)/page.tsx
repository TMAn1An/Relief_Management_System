import { HandHeart, PersonStanding, Users, ShieldCheck, ClipboardCheck, CalendarClock } from "lucide-react";
import { ButtonLink, Card } from "@/components/ui";
import { db } from "@/lib/db";
import { periodOf } from "@/lib/period";

export const dynamic = "force-dynamic";

const programs = [
  { icon: Users, title: "Elderly support", text: "Allowances and essential supplies for citizens aged 60 and above, so they can live with comfort and dignity." },
  { icon: HandHeart, title: "Widow assistance", text: "Financial aid and essential resources that help widows build a secure, self-reliant life." },
  { icon: PersonStanding, title: "Disability care", text: "Dedicated assistance that reaches differently-abled community members and promotes equal opportunity." },
];

const steps = [
  { icon: ClipboardCheck, title: "1. Apply once", text: "Fill in the short form with your NID, phone number and a photo." },
  { icon: ShieldCheck, title: "2. Get approved", text: "Our team reviews your application. Approved recipients receive a relief card." },
  { icon: CalendarClock, title: "3. Request monthly", text: "Submit a request each month and collect your relief package." },
];

export default async function Home() {
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
            Relief that reaches the people who need it most.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-brand-100">
            Apply for support, track your application and submit your monthly relief request — all in one place.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/apply" className="!bg-white !text-brand-800 hover:!bg-brand-50">Apply for relief</ButtonLink>
            <ButtonLink href="/status" variant="ghost" className="!text-white ring-1 ring-white/40 hover:!bg-white/10">
              Check my status
            </ButtonLink>
          </div>
          {stats && (
            <dl className="mt-12 grid max-w-md grid-cols-2 gap-6">
              <div>
                <dt className="text-sm text-brand-100">Approved recipients</dt>
                <dd className="text-3xl font-bold">{stats[0].toLocaleString("en-GB")}</dd>
              </div>
              <div>
                <dt className="text-sm text-brand-100">Items distributed this month</dt>
                <dd className="text-3xl font-bold">{stats[1].toLocaleString("en-GB")}</dd>
              </div>
            </dl>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-2xl font-bold">Who we support</h2>
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
        <h2 className="text-2xl font-bold">How it works</h2>
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
