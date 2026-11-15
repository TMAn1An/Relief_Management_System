import type { Metadata } from "next";
import { StatusForm } from "./status-form";

export const metadata: Metadata = { title: "Check application status" };

export default function StatusPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Check your status</h1>
      <p className="mb-6 mt-2 text-muted">Enter your NID and the mobile number you applied with.</p>
      <StatusForm />
    </div>
  );
}
