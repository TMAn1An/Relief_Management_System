import { requireUser } from "@/lib/auth";
import { Card, PageHeader } from "@/components/ui";
import { PasswordForm } from "./password-form";

export const metadata = { title: "Account" };

export default async function AccountPage() {
  const user = await requireUser();
  return (
    <>
      <PageHeader title="Account" description={`Signed in as ${user.email}.`} />
      <Card className="max-w-lg">
        <h2 className="mb-4 font-semibold">Change password</h2>
        <PasswordForm />
      </Card>
    </>
  );
}
