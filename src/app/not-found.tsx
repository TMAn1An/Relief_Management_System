import { ButtonLink } from "@/components/ui";

export default function NotFound() {
  return (
    <main id="main" className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-4 text-center">
      <p className="text-5xl font-bold text-brand-700">404</p>
      <h1 className="mt-3 text-xl font-semibold">Page not found</h1>
      <p className="mt-2 text-sm text-muted">The page you’re looking for doesn’t exist or has been moved.</p>
      <ButtonLink href="/" className="mt-6">Back to home</ButtonLink>
    </main>
  );
}
