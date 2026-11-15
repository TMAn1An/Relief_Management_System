import Link from "next/link";
import { cn } from "@/lib/cn";
import type { ComponentProps, ReactNode } from "react";
import type { Status } from "@prisma/client";
import { STATUS_LABEL } from "@/lib/labels";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";

const btnBase =
  "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 min-h-11";
const btnVariants = {
  primary: "bg-brand-700 text-white hover:bg-brand-800",
  secondary: "border border-line bg-white text-ink hover:bg-slate-50",
  danger: "bg-red-600 text-white hover:bg-red-700",
  ghost: "text-brand-700 hover:bg-brand-50",
};
export type ButtonVariant = keyof typeof btnVariants;

export const buttonClass = (variant: ButtonVariant = "primary", className?: string) =>
  cn(btnBase, btnVariants[variant], className);

export function ButtonLink({
  variant = "primary",
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: ButtonVariant }) {
  return <Link className={buttonClass(variant, className)} {...props} />;
}

export function Card({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-6", className)} {...props} />;
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}

const statusStyles: Record<Status, string> = {
  PENDING: "bg-amber-50 text-amber-800 ring-amber-600/20",
  APPROVED: "bg-emerald-50 text-emerald-800 ring-emerald-600/20",
  REJECTED: "bg-red-50 text-red-800 ring-red-600/20",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset", statusStyles[status])}>
      {STATUS_LABEL[status]}
    </span>
  );
}

export function Alert({ tone = "info", children, className }: { tone?: "info" | "success" | "error"; children: ReactNode; className?: string }) {
  const tones = {
    info: ["border-sky-200 bg-sky-50 text-sky-900", Info],
    success: ["border-emerald-200 bg-emerald-50 text-emerald-900", CheckCircle2],
    error: ["border-red-200 bg-red-50 text-red-900", AlertCircle],
  } as const;
  const [style, Icon] = tones[tone];
  return (
    <div role={tone === "error" ? "alert" : "status"} className={cn("flex gap-3 rounded-xl border p-4 text-sm", style, className)}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <div>{children}</div>
    </div>
  );
}

export function Field({
  label,
  name,
  error,
  hint,
  children,
}: {
  label: string;
  name: string;
  error?: string[];
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-muted">{hint}</p>}
      {error && (
        <p id={`${name}-error`} className="mt-1 text-xs font-medium text-red-700">
          {error[0]}
        </p>
      )}
    </div>
  );
}

export const inputClass =
  "block w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm shadow-sm placeholder:text-slate-400 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20 aria-[invalid=true]:border-red-500 min-h-11";

export function Input({ error, className, ...props }: ComponentProps<"input"> & { error?: string[] }) {
  return (
    <input
      id={props.name}
      aria-invalid={!!error}
      aria-describedby={error ? `${props.name}-error` : undefined}
      className={cn(inputClass, className)}
      {...props}
    />
  );
}

export function Select({ error, className, ...props }: ComponentProps<"select"> & { error?: string[] }) {
  return (
    <select
      id={props.name}
      aria-invalid={!!error}
      aria-describedby={error ? `${props.name}-error` : undefined}
      className={cn(inputClass, className)}
      {...props}
    />
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-line bg-white px-6 py-12 text-center">
      <p className="font-semibold">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Avatar({ recipientId, name, size = 40 }: { recipientId: string; name: string; size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- photos are small DB-served images
    <img
      src={`/api/photos/${recipientId}`}
      alt={`Photo of ${name}`}
      width={size}
      height={size}
      loading="lazy"
      className="rounded-full bg-slate-100 object-cover ring-1 ring-line"
      style={{ width: size, height: size }}
    />
  );
}
