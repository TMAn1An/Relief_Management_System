import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { setUserActive } from "@/app/actions/admin";
import { Card, PageHeader } from "@/components/ui";
import { ConfirmButton } from "@/components/confirm-button";
import { formatDate } from "@/lib/period";
import { CreateUserForm } from "./create-user-form";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata = { title: "Staff" };

export default async function UsersPage() {
  const me = await requireAdmin();
  const users = await db.user.findMany({ orderBy: [{ active: "desc" }, { createdAt: "asc" }] });

  return (
    <>
      <PageHeader title="Staff" description="Create accounts for staff and administrators, deactivate people who leave, and reset forgotten passwords." />
      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <Card className="h-fit">
          <h2 className="mb-4 font-semibold">New account</h2>
          <CreateUserForm />
        </Card>
        <div className="space-y-3">
          {users.map((u) => (
            <Card key={u.id} className={u.active ? "" : "opacity-70"}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold">
                    {u.name} {u.id === me.id && <span className="text-xs font-normal text-muted">(you)</span>}
                  </p>
                  <p className="truncate text-sm text-muted">{u.email}</p>
                  <p className="mt-1 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium">{u.role === "ADMIN" ? "Admin" : "Staff"}</span>
                    {!u.active && <span className="rounded-full bg-red-50 px-2 py-0.5 font-medium text-red-800">Deactivated</span>}
                    {u.mustChangePassword && <span className="rounded-full bg-amber-50 px-2 py-0.5 font-medium text-amber-800">Must change password</span>}
                    <span className="text-muted">Added {formatDate(u.createdAt)}</span>
                  </p>
                </div>
                {u.id !== me.id && (
                  <ConfirmButton
                    action={setUserActive.bind(null, u.id, !u.active)}
                    message={u.active ? `Deactivate ${u.name}? They will be signed out immediately.` : `Reactivate ${u.name}?`}
                    variant="secondary"
                    className={u.active ? "!min-h-9 !px-3 !py-1.5 !text-red-700" : "!min-h-9 !px-3 !py-1.5"}
                  >
                    {u.active ? "Deactivate" : "Reactivate"}
                  </ConfirmButton>
                )}
              </div>
              {u.id !== me.id && u.active && (
                <details className="mt-4 border-t border-line pt-3">
                  <summary className="cursor-pointer text-sm font-medium text-brand-700">Reset password</summary>
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
