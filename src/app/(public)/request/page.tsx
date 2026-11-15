import type { Metadata } from "next";
import { RequestForm } from "./request-form";

export const metadata: Metadata = { title: "Monthly relief request" };

export default function RequestPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Monthly relief request</h1>
      <p className="mb-6 mt-2 text-muted">Approved recipients can submit one request each calendar month.</p>
      <RequestForm />
    </div>
  );
}
