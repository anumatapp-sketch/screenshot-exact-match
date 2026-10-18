import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AlertTriangle, Clock, Undo2, ChevronRight, ChevronUp } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { StatusBadge, EmptyState, ListSkeleton } from "@/components/feedback";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { requestsQuery } from "@/lib/mock-api";
import { formatMoney, type Request } from "@/lib/requests";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Today — Anumat" },
      {
        name: "description",
        content:
          "See the approvals waiting for you, returned requests and overdue items in Anumat.",
      },
      { property: "og:title", content: "Today — Anumat" },
      { property: "og:description", content: "Approvals waiting for you, at a glance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Today,
});

function Today() {
  const { data, isPending, isError, refetch } = useQuery(requestsQuery);
  const [open, setOpen] = useState(false);
  const all = data ?? [];
  const mine = all.filter((r) => r.needsMe);
  const overdue = mine.filter((r) => (r.dueInHours ?? 1) < 0);
  const returned = all.filter((r) => r.status === "returned" && r.requester === "You");
  const cards = [
    {
      label: "Waiting for your approval",
      count: mine.length,
      icon: Clock,
      tone: "text-status-warning bg-status-warning-soft",
    },
    {
      label: "Returned to you",
      count: returned.length,
      icon: Undo2,
      tone: "text-status-info bg-status-info-soft",
    },
    {
      label: "Overdue",
      count: overdue.length,
      icon: AlertTriangle,
      tone: "text-status-danger bg-status-danger-soft",
    },
  ];

  return (
    <AppShell docked={mine.length > 0}>
      <p className="text-sm text-muted-foreground">Monday, October 19</p>
      <h1 className="mt-1 font-display text-4xl font-semibold tracking-tight">Good morning</h1>

      {isError ? (
        <div className="mt-6">
          <EmptyState
            variant="error"
            title="Your day didn't load"
            description="Check your connection, then try again."
            action={
              <Button variant="outline" className="h-11" onClick={() => refetch()}>
                Retry
              </Button>
            }
          />
        </div>
      ) : isPending ? (
        <div className="mt-6">
          <ListSkeleton rows={3} />
        </div>
      ) : (
        <>
          {overdue.length > 0 && (
            <div
              role="status"
              className="mt-6 flex items-start gap-3 rounded-2xl bg-status-danger-soft p-4 text-status-danger"
            >
              <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden />
              <p className="text-sm">
                <strong>
                  {overdue.length} {overdue.length === 1 ? "approval is" : "approvals are"} past the
                  deadline.
                </strong>{" "}
                The requester is waiting on you.
              </p>
            </div>
          )}

          <section aria-label="Summary" className="mt-6 grid gap-3 sm:grid-cols-3">
            {cards.map(({ label, count, icon: Icon, tone }) => (
              <div key={label} className="rounded-2xl border bg-card p-5 shadow-card">
                <span
                  className={`inline-flex size-9 items-center justify-center rounded-xl ${tone}`}
                >
                  <Icon className="size-4" aria-hidden />
                </span>
                <p className="mt-4 font-display text-3xl font-semibold">{count}</p>
                <p className="text-sm text-muted-foreground">{label}</p>
              </div>
            ))}
          </section>

          <section className="mt-10" aria-labelledby="decide">
            <h2 id="decide" className="text-lg font-semibold">
              Needs your decision
            </h2>
            <div className="mt-3">
              {mine.length === 0 ? (
                <EmptyState
                  title="You're all caught up"
                  description="No requests are waiting for your approval right now."
                />
              ) : (
                <ApprovalList items={mine} />
              )}
            </div>
          </section>

          {mine.length > 0 && (
            <>
              <button
                type="button"
                onClick={() => setOpen(true)}
                aria-haspopup="dialog"
                className="fixed inset-x-4 bottom-[4.25rem] z-30 flex min-h-12 items-center justify-between rounded-2xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-card md:hidden"
              >
                {mine.length} {mine.length === 1 ? "approval needs" : "approvals need"} you{" "}
                <ChevronUp className="size-4" aria-hidden />
              </button>
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-2xl">
                  <SheetHeader className="text-left">
                    <SheetTitle>Needs your decision</SheetTitle>
                    <SheetDescription>
                      {mine.length} waiting, oldest deadline first.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-4">
                    <ApprovalList
                      items={[...mine].sort((a, b) => (a.dueInHours ?? 0) - (b.dueInHours ?? 0))}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </>
          )}
        </>
      )}
    </AppShell>
  );
}

function ApprovalList({ items }: { items: Request[] }) {
  return (
    <ul className="space-y-3">
      {items.map((r) => (
        <li key={r.id}>
          <Link
            to="/requests/$id"
            params={{ id: r.id }}
            className="flex items-center gap-4 rounded-2xl border bg-card p-4 shadow-card transition hover:border-primary/40"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">{r.id}</span>
                {(r.dueInHours ?? 1) < 0 ? (
                  <span className="text-xs font-semibold text-status-danger">
                    Overdue {Math.abs(r.dueInHours!)}h
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">Due in {r.dueInHours}h</span>
                )}
              </div>
              <p className="mt-1 truncate font-semibold">{r.title}</p>
              <p className="truncate text-sm text-muted-foreground">
                {r.requester} · {formatMoney(r.amount)}
              </p>
            </div>
            <StatusBadge status={r.status} className="hidden sm:inline-flex" />
            <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden />
          </Link>
        </li>
      ))}
    </ul>
  );
}
