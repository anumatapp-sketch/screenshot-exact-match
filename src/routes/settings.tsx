import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { EmptyState, InlineError, ListSkeleton } from "@/components/feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useUnsavedChangesGuard } from "@/hooks/use-unsaved-changes-guard";
import { profileQuery, saveProfile, type Profile } from "@/lib/mock-api";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Anumat" },
      {
        name: "description",
        content: "Update your Anumat profile and how you get notified about approvals.",
      },
      { property: "og:title", content: "Settings — Anumat" },
      { property: "og:description", content: "Profile and notification settings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { data, isPending, isError, isFetching, refetch } = useQuery(profileQuery);
  return (
    <AppShell>
      <h1 className="font-display text-4xl font-semibold tracking-tight">Settings</h1>
      <div className="mt-6 max-w-xl">
        {isError ? (
          <EmptyState
            variant="error"
            title="Settings didn't load"
            description="Check your connection, then try again."
            action={
              <Button variant="outline" className="h-11" disabled={isFetching} onClick={() => refetch()}>
                {isFetching ? "Retrying…" : "Retry"}
              </Button>
            }
          />
        ) : isPending || !data ? <ListSkeleton rows={2} /> : <ProfileForm initial={data} />}
      </div>
    </AppShell>
  );
}

function ProfileForm({ initial }: { initial: Profile }) {
  const qc = useQueryClient();
  const [saved, setSaved] = useState(initial);
  const [form, setForm] = useState(initial);
  const [touched, setTouched] = useState(false);
  const dirty = JSON.stringify(form) !== JSON.stringify(saved);
  useUnsavedChangesGuard(dirty);

  const errors = {
    name: !form.name.trim() ? "Enter your name." : "",
    email: !/^\S+@\S+\.\S+$/.test(form.email) ? "Enter a valid email, like name@company.com." : "",
  };
  const invalid = Boolean(errors.name || errors.email);

  const m = useMutation({
    mutationFn: saveProfile,
    onSuccess: (p) => {
      setSaved(p);
      setForm(p);
      setTouched(false);
      qc.setQueryData(profileQuery.queryKey, p);
      toast.success("Settings saved");
    },
    onError: () => toast.error("Couldn't save. Try again."),
  });
  useEffect(() => setSaved(initial), [initial]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (invalid || m.isPending || !dirty) return;
    m.mutate(form);
  };

  return (
    <form onSubmit={submit} noValidate className="rounded-2xl border bg-card shadow-card">
      <div className="space-y-5 p-5">
        <h2 className="font-semibold">Profile</h2>
        <Field id="name" label="Full name" error={touched ? errors.name : ""}>
          <Input
            id="name"
            className="h-11"
            value={form.name}
            onBlur={() => setTouched(true)}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            aria-invalid={touched && !!errors.name}
            aria-describedby={touched && errors.name ? "name-err" : undefined}
          />
        </Field>
        <Field id="email" label="Work email" error={touched ? errors.email : ""}>
          <Input
            id="email"
            type="email"
            className="h-11"
            value={form.email}
            onBlur={() => setTouched(true)}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            aria-invalid={touched && !!errors.email}
            aria-describedby={touched && errors.email ? "email-err" : undefined}
          />
        </Field>
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Approval notifications</legend>
          <RadioGroup
            value={form.digest}
            onValueChange={(v) => setForm({ ...form, digest: v as Profile["digest"] })}
          >
             {([
              ["instant", "As soon as something needs me"],
              ["daily", "Once a day, in a summary"],
             ] as const).map(([v, l]) => (
              <Label
                key={v}
                htmlFor={`d-${v}`}
                className="flex min-h-11 cursor-pointer items-center gap-3 font-normal"
              >
                <RadioGroupItem id={`d-${v}`} value={v} /> {l}
              </Label>
            ))}
          </RadioGroup>
        </fieldset>
      </div>
      <div className="sticky bottom-14 flex items-center justify-between gap-3 rounded-b-2xl border-t bg-card p-4 md:bottom-0">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {dirty ? "Unsaved changes" : "All changes saved"}
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            className="h-11"
            disabled={!dirty || m.isPending}
            onClick={() => {
              setForm(saved);
              setTouched(false);
            }}
          >
            Cancel
          </Button>
          <Button type="submit" className="h-11 min-w-24" disabled={!dirty || m.isPending}>
            {m.isPending ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && <InlineError id={`${id}-err`}>{error}</InlineError>}
    </div>
  );
}
