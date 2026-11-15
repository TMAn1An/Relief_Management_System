import Link from "next/link";
import { HeartHandshake, LayoutDashboard, Users, ClipboardCheck, Package, BarChart3, LogOut, UserCog } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { logout } from "@/app/actions/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const pending = await db.recipient.count({ where: { status: "PENDING" } });
  const nav = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/recipients", label: "Recipients", icon: Users },
    { href: "/admin/approvals", label: "Approvals", icon: ClipboardCheck, badge: pending },
    { href: "/admin/distributions", label: "Distributions", icon: Package },
    { href: "/admin/statistics", label: "Statistics", icon: BarChart3 },
    { href: "/admin/account", label: "Account", icon: UserCog },
  ];

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[250px_1fr] print:block">
      <aside className="no-print border-b border-line bg-white lg:sticky lg:top-0 lg:h-dvh lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-3 px-4 py-3 lg:block lg:px-5 lg:py-5">
          <Link href="/admin" className="flex items-center gap-2 font-bold text-brand-800">
            <HeartHandshake className="h-6 w-6" aria-hidden /> Relief Admin
          </Link>
          <form action={logout} className="lg:hidden">
            <button className="rounded-lg p-2 text-muted hover:bg-slate-100" aria-label="Sign out"><LogOut className="h-5 w-5" /></button>
          </form>
        </div>
        <nav aria-label="Admin" className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:px-3 lg:pb-0">
          {nav.map(({ href, label, icon: Icon, badge }) => (
            <Link key={href} href={href} className="flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-800">
              <Icon className="h-4 w-4" aria-hidden />
              {label}
              {!!badge && <span className="ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">{badge}</span>}
            </Link>
          ))}
        </nav>
        <div className="mt-auto hidden border-t border-line p-4 lg:absolute lg:bottom-0 lg:block lg:w-[250px]">
          <Link href="/admin/account" className="block rounded-lg hover:bg-slate-50" title="Account settings">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="truncate text-xs text-muted">{user.email} · {user.role === "ADMIN" ? "Admin" : "Staff"}</p>
          </Link>
          <form action={logout} className="mt-3">
            <button className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-red-700"><LogOut className="h-4 w-4" aria-hidden /> Sign out</button>
          </form>
        </div>
      </aside>
      <main id="main" className="min-w-0 px-4 py-6 sm:px-8 sm:py-8">{children}</main>
    </div>
  );
}
