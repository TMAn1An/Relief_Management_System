import { requireUser } from "@/lib/auth";
import { Card, PageHeader } from "@/components/ui";
import { getT } from "@/lib/i18n/server";
import { PasswordForm } from "./password-form";

export async function generateMetadata() {
  return { title: (await getT())("account.title") };
}

export default async function AccountPage() {
  const [user, t] = await Promise.all([requireUser(), getT()]);
  return (
    <>
      <PageHeader title={t("account.title")} description={t("account.signed_in", { email: user.email })} />
      <Card className="max-w-lg">
        <h2 className="mb-4 font-semibold">{t("account.change")}</h2>
        <PasswordForm />
      </Card>
    </>
  );
}
