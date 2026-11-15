import type { Metadata } from "next";
import { Card } from "@/components/ui";
import { ApplyForm } from "./apply-form";

export const metadata: Metadata = { title: "Apply for relief" };

export default function ApplyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Apply for relief</h1>
      <p className="mt-2 text-muted">Apply once. If approved, you can request relief every month.</p>
      <Card className="mt-6">
        <ApplyForm />
      </Card>
    </div>
  );
}
