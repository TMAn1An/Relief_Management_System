import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { HeartHandshake } from "lucide-react";
import { getUser } from "@/lib/auth";
import { Card } from "@/components/ui";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Staff login" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (await getUser()) redirect("/admin");
  const { next } = await searchParams;
  return (
    <main id="main" className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-4">
      <div className="mb-6 text-center">
        <HeartHandshake className="mx-auto h-10 w-10 text-brand-700" aria-hidden />
        <h1 className="mt-3 text-2xl font-bold">Staff login</h1>
        <p className="mt-1 text-sm text-muted">Sign in to manage relief operations.</p>
      </div>
      <Card>
        <LoginForm next={next} />
      </Card>
    </main>
  );
}
