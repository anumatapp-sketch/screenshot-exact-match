import { AlertCircle, Inbox, SearchX } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { STATUS_META, type RequestStatus, type Tone } from "@/lib/requests";

const dot: Record<Tone, string> = {
  success: "bg-status-success",
  warning: "bg-status-warning",
  info: "bg-status-info",
  danger: "bg-status-danger",
  neutral: "bg-status-neutral",
};

/** Status is always dot + visible text, never colour alone. */
export function StatusBadge({ status, className }: { status: RequestStatus; className?: string }) {
  const { label, tone } = STATUS_META[status];
  return (
    <ToneBadge tone={tone} className={className}>
      {label}
    </ToneBadge>
  );
}

export function ToneBadge({
  tone,
  children,
  className,
}: {
  tone: Tone;
  children: ReactNode;
  className?: string | undefined;
}) {
  return (
    <Badge
      variant={tone}
      className={cn("rounded-full px-2.5 py-1 gap-1.5 font-semibold whitespace-nowrap", className)}
    >
      <span className={cn("size-1.5 rounded-full shrink-0", dot[tone])} aria-hidden />
      {children}
    </Badge>
  );
}

type EmptyVariant = "empty" | "no-results" | "error";
const icons = { empty: Inbox, "no-results": SearchX, error: AlertCircle };

export function EmptyState({
  variant = "empty",
  title,
  description,
  action,
}: {
  variant?: EmptyVariant;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  const Icon = icons[variant];
  return (
    <div
      role={variant === "error" ? "alert" : undefined}
      className="rounded-2xl border border-dashed bg-card px-6 py-12 text-center"
    >
      <span
        className={cn(
          "mx-auto mb-3 flex size-10 items-center justify-center rounded-full",
          variant === "error"
            ? "bg-status-danger-soft text-status-danger"
            : "bg-muted text-muted-foreground",
        )}
      >
        <Icon className="size-5" aria-hidden />
      </span>
      <p className="font-semibold">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function InlineError({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} className="flex items-center gap-1.5 text-sm text-destructive">
      <AlertCircle className="size-4 shrink-0" aria-hidden />
      {children}
    </p>
  );
}

export function ListSkeleton({
  rows = 5,
  variant = "list",
}: {
  rows?: number;
  variant?: "table" | "list";
}) {
  return (
    <div aria-busy="true" className="space-y-3">
      <span className="sr-only" role="status">
        Loading…
      </span>
      {Array.from({ length: rows }).map((_, i) =>
        variant === "table" ? (
          <Skeleton key={i} className="h-11 w-full rounded-lg" />
        ) : (
          <div key={i} className="space-y-2 rounded-2xl border bg-card p-4">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        ),
      )}
    </div>
  );
}
