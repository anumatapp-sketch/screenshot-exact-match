import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { ArrowLeft, Check, Circle, X, Dot, ListChecks } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { StatusBadge, InlineError, ListSkeleton, EmptyState } from "@/components/feedback";
import { Button, buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { confirmDiscard, useUnsavedChangesGuard } from "@/hooks/use-unsaved-changes-guard";
import { decideRequest, requestQuery } from "@/lib/mock-api";
import { formatMoney, type Request } from "@/lib/requests";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/requests/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.id} — Anumat` },
      {
        name: "description",
        content: `Review request ${params.id}: summary, line items and approval chain.`,
      },
      { property: "og:title", content: `${params.id} — Anumat` },
      { property: "og:description", content: "Review and decide on a request." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Detail,
});

const SECTIONS = [
  { id: "summary", label: "Summary" },
  { id: "items", label: "Line items" },
  { id: "chain", label: "Approval chain" },
] as const;

function Detail() {
  const { id } = Route.useParams();
  const { data: r, isPending, isError, refetch } = useQuery(requestQuery(id));
  const canDecide = Boolean(r?.needsMe && r?.status === "in_review");

  return (
    <AppShell docked={canDecide}>
      <Link
        to="/requests"
        className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden /> Requests
      </Link>
      {isPending ? (
        <div className="mt-4">
          <ListSkeleton rows={3} />
        </div>
      ) : isError ? (
        <EmptyState
          variant="error"
          title="This request didn't load"
          description="Check your connection, then try again."
          action={
            <Button variant="outline" className="h-11" onClick={() => refetch()}>
              Retry
            </Button>
          }
        />
      ) : !r ? (
        <EmptyState
          title="Request not found"
          description={`There's no request with the ID ${id}.`}
          action={
            <Link to="/requests" className={buttonVariants({ variant: "outline" })}>
              Back to requests
            </Link>
          }
        />
      ) : (
        <RequestView r={r} />
      )}
    </AppShell>
  );
}

function RequestView({ r }: { r: Request }) {
  const qc = useQueryClient();
  const [dialog, setDialog] = useState<null | "approve" | "reject">(null);
  const [reason, setReason] = useState("");
  const [err, setErr] = useState(false);
  const isSubmitting = useRef(false);
  const canDecide = r.needsMe && r.status === "in_review";
  const total = r.lines.reduce((s, l) => s + l.qty * l.price, 0);

  // Guard against navigating away with unsaved rejection reason text
  useUnsavedChangesGuard(dialog === "reject" && reason.trim().length > 0);

  const m = useMutation({
    mutationFn: (v: { d: "approve" | "reject"; reason?: string | undefined }) =>
      decideRequest(r.id, v.d, v.reason),
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ["requests"] });
      toast.success(v.d === "approve" ? `${r.id} approved` : `${r.id} rejected`);
      setDialog(null);
      setReason("");
    },
    onError: () => toast.error("Couldn't save your decision. Try again."),
  });

  const confirm = () => {
    if (m.isPending || isSubmitting.current || !dialog) return;
    if (dialog === "reject" && !reason.trim()) {
      setErr(true);
      return;
    }
    isSubmitting.current = true;
    m.mutate(
      { d: dialog, reason: reason.trim() || undefined },
      {
        onSettled: () => {
          isSubmitting.current = false;
        },
      },
    );
  };
  const closeDialog = (open: boolean) => {
    if (open || m.isPending) return;
    if (dialog === "reject" && !confirmDiscard(reason.trim().length > 0)) return;
    setDialog(null);
  };

  return (
    <>
      <div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">
            {r.id} · {r.type}
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            {r.title}
          </h1>
        </div>
        <StatusBadge status={r.status} />
      </div>

      <nav aria-label="Sections" className="mt-6 flex gap-2 overflow-x-auto pb-1">
        {SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="inline-flex min-h-11 shrink-0 items-center rounded-full border bg-card px-4 text-sm font-medium hover:bg-muted"
          >
            {s.label}
            {s.id === "chain" && canDecide && (
              <span
                className="ml-2 size-2 rounded-full bg-status-warning"
                aria-label="needs action"
              />
            )}
          </a>
        ))}
      </nav>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <section id="summary" className="scroll-mt-6 rounded-2xl border bg-card p-5 shadow-card">
            <h2 className="font-semibold">Summary</h2>
            <p className="mt-2 text-sm text-muted-foreground">{r.summary}</p>
            <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-muted-foreground">Requester</dt>
                <dd className="font-medium">{r.requester}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Amount</dt>
                <dd className="font-medium">{formatMoney(r.amount)}</dd>
              </div>
            </dl>
          </section>
          <section id="items" className="scroll-mt-6 rounded-2xl border bg-card p-5 shadow-card">
            <h2 className="font-semibold">Line items</h2>
            <ul className="mt-3 divide-y text-sm">
              {r.lines.map((l) => (
                <li key={l.item} className="flex justify-between gap-4 py-2.5">
                  <span className="min-w-0">
                    {l.item} <span className="text-muted-foreground">× {l.qty}</span>
                  </span>
                  <span className="shrink-0 tabular-nums">{formatMoney(l.qty * l.price)}</span>
                </li>
              ))}
              <li className="flex justify-between py-2.5 font-semibold">
                <span>Total</span>
                <span className="tabular-nums">{formatMoney(total)}</span>
              </li>
            </ul>
          </section>
          {/* Compact: chain opens in a sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="h-11 w-full justify-start gap-2 lg:hidden">
                <ListChecks className="size-4" aria-hidden /> View approval chain ({r.chain.length}{" "}
                steps)
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-2xl">
              <SheetHeader className="text-left">
                <SheetTitle>Approval chain</SheetTitle>
                <SheetDescription>
                  {r.id} · {r.title}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-4">
                <Chain r={r} />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <section
          id="chain"
          className="hidden h-fit scroll-mt-6 rounded-2xl border bg-card p-5 shadow-card lg:block"
        >
          <h2 className="font-semibold">Approval chain</h2>
          <div className="mt-4">
            <Chain r={r} />
          </div>
        </section>
      </div>

      {canDecide && (
        <div className="sticky bottom-16 z-30 mt-8 flex gap-3 rounded-2xl border bg-card p-3 shadow-card md:bottom-4">
          <Button
            variant="outline"
            className="h-11 flex-1"
            onClick={() => {
              setErr(false);
              setDialog("reject");
            }}
          >
            Reject
          </Button>
          <Button className="h-11 flex-1" onClick={() => setDialog("approve")}>
            Approve {formatMoney(r.amount)}
          </Button>
        </div>
      )}

      <AlertDialog open={!!dialog} onOpenChange={closeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {dialog === "approve" ? "Approve" : "Reject"} {r.id}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {r.title} · {formatMoney(r.amount)}.{" "}
              {dialog === "approve"
                ? "It moves to the next approver."
                : "The requester will see your reason."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {dialog === "reject" && (
            <div className="space-y-2">
              <Label htmlFor="reason">Reason (required)</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  setErr(false);
                }}
                aria-invalid={err}
                aria-describedby={err ? "reason-err" : undefined}
              />
              {err && (
                <InlineError id="reason-err">
                  Please give a reason so the requester knows what to fix.
                </InlineError>
              )}
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={m.isPending} className="h-11">
              Cancel
            </AlertDialogCancel>
            <Button
              className="h-11"
              variant={dialog === "reject" ? "destructive" : "default"}
              disabled={m.isPending}
              onClick={confirm}
            >
              {m.isPending ? "Saving…" : dialog === "approve" ? "Approve" : "Reject"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function Chain({ r }: { r: Request }) {
  return (
    <ol className="space-y-4">
      {r.chain.map((s, i) => {
        const Icon =
          s.state === "done"
            ? Check
            : s.state === "rejected"
              ? X
              : s.state === "current"
                ? Dot
                : Circle;
        const cls =
          s.state === "done"
            ? "bg-status-success-soft text-status-success"
            : s.state === "rejected"
              ? "bg-status-danger-soft text-status-danger"
              : s.state === "current"
                ? "bg-status-warning-soft text-status-warning"
                : "bg-muted text-muted-foreground";
        const word = {
          done: "Approved",
          rejected: "Sent back",
          current: "Waiting now",
          waiting: "Not yet",
        }[s.state];
        return (
          <li key={i} className="flex gap-3">
            <span
              className={cn("flex size-7 shrink-0 items-center justify-center rounded-full", cls)}
            >
              <Icon className="size-4" aria-hidden />
            </span>
            <div className="min-w-0 text-sm">
              <p className="font-medium">
                {s.name} <span className="font-normal text-muted-foreground">· {s.role}</span>
              </p>
              <p className="text-muted-foreground">
                {word}
                {s.at ? ` · ${s.at}` : ""}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
