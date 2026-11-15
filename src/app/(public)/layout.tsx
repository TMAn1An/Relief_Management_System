import Link from "next/link";
import { HeartHandshake } from "lucide-react";
import { ButtonLink } from "@/components/ui";

const links = [
  { href: "/apply", label: "Apply" },
  { href: "/status", label: "Check status" },
  { href: "/request", label: "Monthly request" },
];

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="flex items-center gap-2 font-bold text-brand-800">
            <HeartHandshake className="h-6 w-6" aria-hidden />
            <span className="hidden sm:inline">Relief Management</span>
          </Link>
          <nav aria-label="Main" className="flex items-center gap-1 text-sm font-medium">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100">
                {l.label}
              </Link>
            ))}
            <ButtonLink href="/login" variant="secondary" className="ml-2 !min-h-9 !px-3 !py-1.5">
              Staff login
            </ButtonLink>
          </nav>
        </div>
      </header>
      <main id="main">{children}</main>
      <footer className="mt-16 border-t border-line bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-muted">
          <p className="font-medium text-ink">Relief Management System</p>
          <p className="mt-1">Supporting widows, the elderly and people with disabilities with dignity and transparency.</p>
        </div>
      </footer>
    </>
  );
}
