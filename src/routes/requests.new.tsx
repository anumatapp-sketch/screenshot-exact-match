import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { EmptyState, InlineError, ListSkeleton } from "@/components/feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUnsavedChangesGuard } from "@/hooks/use-unsaved-changes-guard";
import { simulateRoute, type RequestType } from "@/lib/authoring";
import { authoringQuery, createRequest } from "@/lib/mock-api";
import { formatMoney } from "@/lib/requests";

export const Route = createFileRoute("/requests/new")({
  head: () => ({
    meta: [
      { title: "New request — Anumat" },
      { name: "description", content: "Pick a request type, fill in the form and submit for approval." },
      { property: "og:title", content: "New request — Anumat" },
      { property: "og:description", content: "Start a new approval request." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NewRequest,
});

function NewRequest() {
  const { data, isPending, isError, refetch } = useQuery(authoringQuery);
  const [type, setType] = useState<RequestType | null>(null);
  const published = (data ?? []).filter((t) => t.status === "Published");

  return (
    <AppShell>
      <Link
        to="/requests"
        className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden /> Requests
      </Link>
      <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">New request</h1>
      <div className="mt-6">
        {isPending ? (
          <ListSkeleton rows={3} />
        ) : isError ? (
          <EmptyState
            variant="error"
            title="Request types didn't load"
            description="Check your connection, then try again."
            action={
              <Button variant="outline" className="h-11" onClick={() => refetch()}>
                Retry
              </Button>
            }
          />
        ) : type ? (
          <RequestForm type={type} onBack={() => setType(null)} />
        ) : published.length === 0 ? (
          <EmptyState
            title="No published request types"
            description="Publish a request type first, then come back."
            action={
              <Link to="/templates" className="text-sm font-medium underline">
                Go to request types
              </Link>
            }
          />
        ) : (
          <>
            <p className="text-sm text-muted-foreground">What do you need approved?</p>
            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
              {published.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => setType(t)}
                    className="min-h-11 w-full rounded-2xl border bg-card p-4 text-left shadow-card hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="font-medium">{t.name}</span>
                    <span className="mt-1 block text-sm text-muted-foreground">{t.description}</span>
                    <span className="mt-2 block text-xs text-muted-foreground">
                      {t.team} · {t.steps.length} approval steps
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </AppShell>
  );
}

function RequestForm({ type, onBack }: { type: RequestType; onBack: () => void }) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const amountField = type.fields.find((f) => f.label.trim().toLowerCase() === "amount");
  const amount = amountField ? Number(values[amountField.id] || 0) : 0;
  const route = simulateRoute(type.steps, amount);
  const dirty = !submitted && (title.trim() !== "" || Object.values(values).some((v) => v.trim()));
  useUnsavedChangesGuard(dirty);

  const m = useMutation({
    mutationFn: () =>
      createRequest({
        type,
        title: title.trim(),
        amount,
        values: Object.fromEntries(type.fields.map((f) => [f.label, values[f.id] ?? ""])),
      }),
    onSuccess: (req) => {
      setSubmitted(true);
      qc.invalidateQueries({ queryKey: ["requests"] });
      toast.success(`${req.id} submitted for approval`);
      // let the guard see submitted=true before leaving
      setTimeout(() => navigate({ to: "/requests/$id", params: { id: req.id } }), 0);
    },
    onError: () => toast.error("Couldn't submit. Your answers are still here — try again."),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (m.isPending) return;
    const next: Record<string, string> = {};
    if (!title.trim()) next["title"] = "Give your request a short title.";
    for (const f of type.fields) {
      const v = (values[f.id] ?? "").trim();
      if (!v) next[f.id] = `Enter ${f.label.toLowerCase()}.`;
      else if (f.type === "number" && (!Number.isFinite(Number(v)) || Number(v) < 0))
        next[f.id] = `${f.label} must be zero or more.`;
    }
    setErrors(next);
    if (Object.keys(next).length) {
      document.getElementById(Object.keys(next)[0] === "title" ? "rq-title" : `f-${Object.keys(next)[0]}`)?.focus();
      return;
    }
    m.mutate();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <form onSubmit={submit} noValidate className="space-y-4 rounded-2xl border bg-card p-5 shadow-card">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold">{type.name}</h2>
          <Button type="button" variant="ghost" className="h-11" onClick={onBack} disabled={m.isPending}>
            Change type
          </Button>
        </div>
        <Field id="rq-title" label="Title" error={errors["title"]}>
          <Input
            id="rq-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-invalid={!!errors["title"]}
            aria-describedby={errors["title"] ? "rq-title-err" : undefined}
            className="h-11"
          />
        </Field>
        {type.fields.map((f) => {
          const id = `f-${f.id}`;
          const props = {
            id,
            value: values[f.id] ?? "",
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
              setValues((v) => ({ ...v, [f.id]: e.target.value })),
            "aria-invalid": !!errors[f.id],
            "aria-describedby": errors[f.id] ? `${id}-err` : undefined,
          };
          return (
            <Field key={f.id} id={id} label={f.label} error={errors[f.id]}>
              {f.type === "textarea" ? (
                <Textarea {...props} />
              ) : (
                <Input {...props} type={f.type === "number" ? "number" : "text"} inputMode={f.type === "number" ? "decimal" : undefined} className="h-11" />
              )}
            </Field>
          );
        })}
        <Button type="submit" className="h-11 w-full sm:w-auto" disabled={m.isPending}>
          {m.isPending ? "Submitting…" : "Submit request"}
        </Button>
        <p className="text-xs text-muted-foreground">Demo only — nothing is saved after you reload.</p>
      </form>
      <aside className="h-fit rounded-2xl border bg-card p-5 shadow-card" aria-live="polite">
        <h2 className="font-semibold">Who will approve</h2>
        {amountField && <p className="mt-1 text-sm text-muted-foreground">For {formatMoney(amount)}</p>}
        <ol className="mt-3 space-y-2 text-sm">
          {route.map((s) => (
            <li key={s.id} className={s.included ? "" : "text-muted-foreground line-through"}>
              {s.name} · {s.assignee}
              {!s.included && <span className="sr-only"> (skipped)</span>}
            </li>
          ))}
        </ol>
      </aside>
    </div>
  );
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string | undefined; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && <InlineError id={`${id}-err`}>{error}</InlineError>}
    </div>
  );
}
