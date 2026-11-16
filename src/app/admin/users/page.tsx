import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { setUserActive } from "@/app/actions/admin";
import { Card, PageHeader } from "@/components/ui";
import { ConfirmButton } from "@/components/confirm-button";
import { formatDate } from "@/lib/period";
import { getT } from "@/lib/i18n/server";
import { localeOf } from "@/lib/i18n";
import { CreateUserForm } from "./create-user-form";
import { ResetPasswordForm } from "./reset-password-form";

export async function generateMetadata() {
  return { title: (await getT())("users.title") };
}

export default async function UsersPage() {
  const [me, t] = await Promise.all([requireAdmin(), getT()]);
  const locale = localeOf(t.lang);
  const users = await db.user.findMany({ orderBy: [{ active: "desc" }, { createdAt: "asc" }] });

  return (
    <>
      <PageHeader title={t("users.title")} description={t("users.desc")} />
      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <Card className="h-fit">
          <h2 className="mb-4 font-semibold">{t("users.new")}</h2>
          <CreateUserForm />
        </Card>
        <div className="space-y-3">
          {users.map((u) => (
            <Card key={u.id} className={u.active ? "" : "opacity-70"}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold">
                    {u.name} {u.id === me.id && <span className="text-xs font-normal text-muted">{t("users.you")}</span>}
                  </p>
                  <p className="truncate text-sm text-muted">{u.email}</p>
                  <p className="mt-1 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium">{t(`role.${u.role}`)}</span>
                    {!u.active && <span className="rounded-full bg-red-50 px-2 py-0.5 font-medium text-red-800">{t("users.deactivated")}</span>}
                    {u.mustChangePassword && <span className="rounded-full bg-amber-50 px-2 py-0.5 font-medium text-amber-800">{t("users.must_change")}</span>}
                    <span className="text-muted">{t("users.added", { date: formatDate(u.createdAt, false, locale) })}</span>
                  </p>
                </div>
                {u.id !== me.id && (
                  <ConfirmButton
                    action={setUserActive.bind(null, u.id, !u.active)}
                    message={u.active ? t("users.deactivate_confirm", { name: u.name }) : t("users.reactivate_confirm", { name: u.name })}
                    variant="secondary"
                    className={u.active ? "!min-h-9 !px-3 !py-1.5 !text-red-700" : "!min-h-9 !px-3 !py-1.5"}
                  >
                    {u.active ? t("users.deactivate") : t("users.reactivate")}
                  </ConfirmButton>
                )}
              </div>
              {u.id !== me.id && u.active && (
                <details className="mt-4 border-t border-line pt-3">
                  <summary className="cursor-pointer text-sm font-medium text-brand-700">{t("users.reset")}</summary>
                  <div className="mt-3 max-w-sm"><ResetPasswordForm userId={u.id} /></div>
                </details>
              )}
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
