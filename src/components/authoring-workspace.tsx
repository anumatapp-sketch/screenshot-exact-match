import { useState } from "react";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useRouter, type ErrorComponentProps } from "@tanstack/react-router";
import { ArrowLeft, Check, FilePlus2, GitBranch, Loader2, Plus, Save, Search } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ApprovalChainEditor } from "@/components/approval-chain-editor";
import { FormFieldsEditor } from "@/components/form-fields-editor";
import { RequestTypePreview } from "@/components/request-type-preview";
import { RequestTypesNav } from "@/components/request-types-nav";
import { EmptyState, ListSkeleton, ToneBadge } from "@/components/feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { confirmDiscard, useUnsavedChangesGuard } from "@/hooks/use-unsaved-changes-guard";
import { PRESETS, blankType, cloneType, newId, validateType, type RequestType } from "@/lib/authoring";
import { authoringQuery, saveRequestType } from "@/lib/mock-api";
import { authoringIssues, routeInWords, type AuthoringIssue } from "@/lib/authoring-checks";
import { WorkflowRouteTest } from "@/components/workflow-route-test";

type Mode = "templates" | "forms" | "workflows";
const TITLES = { templates: "Request types", forms: "Forms", workflows: "Workflows" };

export function AuthoringWorkspace({ mode }: { mode: Mode }) {
  const { data: items } = useSuspenseQuery(authoringQuery);
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState<RequestType | null>(null);
  const [baseline, setBaseline] = useState("");
  const [view, setView] = useState("edit");
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [focusIssue, setFocusIssue] = useState<AuthoringIssue | null>(null);
  const [evidence, setEvidence] = useState({ cases: 0, changed: 0, covered: 0, total: 0 });
  const issues = draft ? authoringIssues(draft) : [];
  const dirty = draft !== null && JSON.stringify(draft) !== baseline;
  useUnsavedChangesGuard(dirty);
  function open(value: RequestType, fresh = false) {
    if (!confirmDiscard(dirty)) return;
    setDraft(cloneType(value));
    setBaseline(fresh ? "" : JSON.stringify(value));
    setErrors([]); setNotice(""); setView("edit"); setFocusIssue(null); setEvidence({ cases: 0, changed: 0, covered: 0, total: 0 });
  }
  function update(patch: Partial<RequestType>) {
    if (!draft || busy) return;
    setDraft({ ...draft, ...patch, status: "Draft" });
    setErrors([]); setNotice("");
  }
  async function save(publish = false) {
    if (!draft || busy) return;
    if (publish && authoringIssues(draft).length) { setErrors(["Fix the listed problems before publishing."]); return; }
    const value: RequestType = { ...draft, status: publish ? "Published" : "Draft" };
    setBusy(true); setErrors([]); setNotice("");
    try {
      const next = await saveRequestType(value);
      queryClient.setQueryData(authoringQuery.queryKey, next);
      setDraft(value); setBaseline(JSON.stringify(value));
      const count = authoringIssues(value).length;
      setNotice(publish ? "Published in this demo session." : `Draft saved in this demo session.${count ? ` ${count} things to fix before publishing.` : ""}`);
    } catch { setErrors(["Your changes were not saved. Try again."]); }
    finally { setBusy(false); }
  }
  const filtered = items.filter(item => `${item.name} ${item.team}`.toLowerCase().includes(search.toLowerCase()));
  return <AppShell>
    <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="mb-2 text-xs font-medium text-muted-foreground">Authoring · Demo</p><h1 className="font-display text-4xl font-semibold">{TITLES[mode]}</h1></div>{!draft && <Button onClick={() => open(blankType(), true)}><Plus className="size-4" />New request type</Button>}</div>
    <RequestTypesNav />
    {draft ? <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><Button variant="ghost" disabled={busy} onClick={() => { if (confirmDiscard(dirty)) { setDraft(null); setNotice(""); setErrors([]); } }}><ArrowLeft className="size-4" />Back to list</Button><ToneBadge tone={draft.status === "Published" ? "success" : "neutral"}>{draft.status}{dirty ? " · Unsaved" : ""}</ToneBadge></div>
      <Tabs value={view} onValueChange={setView} className="mb-5 lg:hidden"><TabsList className="h-11"><TabsTrigger value="edit" className="min-h-9">Edit</TabsTrigger><TabsTrigger value="preview" className="min-h-9">Preview</TabsTrigger></TabsList></Tabs>
      {issues.length > 0 && <section aria-label="Things to fix" className="mb-6 border-y py-4"><h2 className="mb-3 text-sm font-semibold text-destructive">{issues.length} to fix before publishing</h2><ul className="space-y-3">{issues.map((issue, index) => <li key={`${issue.code}-${index}`} className="flex flex-wrap items-center justify-between gap-2 text-sm"><span className="min-w-0 flex-1">{issue.message}</span>{issue.code === "amount-field" ? <Button variant="outline" disabled={busy} onClick={() => update({ fields: [...draft.fields, { id: newId(), label: "Amount", type: "number" }] })}>Add numeric Amount</Button> : <Button variant="ghost" disabled={busy} onClick={() => { setView("edit"); setFocusIssue({ ...issue }); setTimeout(() => { const element = document.getElementById(issue.target); element?.scrollIntoView({ block: "center" }); element?.focus(); }, 50); }}>Go to</Button>}</li>)}</ul></section>}
      <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <fieldset disabled={busy} className={`min-w-0 space-y-7 ${view === "preview" ? "hidden lg:block" : ""}`}>
          <section className="space-y-4"><h2 className="text-lg font-semibold">Details</h2><div className="space-y-2"><Label htmlFor="request-type-name">Request type name</Label><Input id="request-type-name" value={draft.name} onChange={e => update({ name: e.target.value })} aria-invalid={errors.length > 0 && !draft.name.trim()} aria-describedby={errors.length ? "authoring-errors" : undefined} /></div><div className="space-y-2"><Label htmlFor="request-type-description">Description</Label><Textarea id="request-type-description" value={draft.description} onChange={e => update({ description: e.target.value })} /></div><div className="space-y-2"><Label htmlFor="request-type-team">Team</Label><Input id="request-type-team" value={draft.team} onChange={e => update({ team: e.target.value })} /></div></section>
          {mode !== "workflows" && <FormFieldsEditor fields={draft.fields} onChange={fields => update({ fields })} />}
          {mode !== "forms" && <ApprovalChainEditor steps={draft.steps} issues={issues} focusIssue={focusIssue} onChange={steps => update({ steps })} />}
        </fieldset>
        <div className={`min-w-0 space-y-6 lg:border-l lg:pl-7 ${view === "edit" ? "hidden lg:block" : ""}`}><RequestTypePreview key={draft.id} value={draft} mode={mode} />{mode !== "forms" && <WorkflowRouteTest key={draft.id} value={draft} issues={issues} onEvidence={setEvidence} />}</div>
      </div>
      <div className="mt-7 space-y-4 border-t pt-5">
        {errors.length > 0 && <div role="alert" id="authoring-errors" className="text-sm text-destructive"><ul className="list-disc space-y-1 pl-5">{errors.map(error => <li key={error}>{error}</li>)}</ul></div>}
        <p role="status" className="text-sm text-status-success">{notice}</p>
        <div className="flex flex-wrap gap-3"><Button variant="outline" disabled={!dirty || busy} onClick={() => void save()}>{busy ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}Save draft</Button>{mode === "templates" && <Button disabled={busy || (!dirty && draft.status === "Published")} onClick={() => { const validation = validateType(draft); setErrors(validation); if (!validation.length) setPublishing(true); }}><Check className="size-4" />Publish demo</Button>}</div>
      </div>
      <AlertDialog open={publishing} onOpenChange={setPublishing}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Ready to publish {draft.name}?</AlertDialogTitle><AlertDialogDescription>This updates the demo only. No live requests or approval rules will change.</AlertDialogDescription></AlertDialogHeader><ul className="space-y-3 text-sm"><li className="text-status-success">No problems found</li><li>{evidence.covered} of {evidence.total} amount-rule outcomes checked</li><li>{evidence.cases} session test cases · {evidence.changed} changed since testing</li>{(evidence.cases === 0 || evidence.changed > 0 || evidence.covered < evidence.total) && <li className="text-status-warning">Review untested or changed cases before using these approvals.</li>}<li className="break-words">{routeInWords(draft.steps)}</li><li>Only this demo request type changes. Existing submitted requests keep their route.</li></ul><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => void save(true)}>Publish demo</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </> : <>
      {mode === "templates" && <section className="mb-8"><h2 className="mb-4 text-lg font-semibold">Quick start</h2><div className="grid gap-3 sm:grid-cols-3">{PRESETS.map(preset => <div key={preset.id} className="flex min-w-0 flex-col items-start gap-3 rounded-lg border bg-card p-4"><FilePlus2 className="size-5 text-primary" /><h3 className="font-semibold">{preset.name}</h3><p className="flex-1 text-sm text-muted-foreground">{preset.description}</p><Button variant="outline" className="min-h-11" onClick={() => open({ ...cloneType(preset), id: newId(), status: "Draft" }, true)}>Use template</Button></div>)}</div></section>}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold">{mode === "templates" ? "All request types" : `Request type ${mode}`}</h2><div className="relative w-full sm:w-64"><Search className="absolute left-3 top-3 size-4 text-muted-foreground" aria-hidden /><Input className="min-h-11 pl-9" aria-label="Search request types" placeholder="Search request types" value={search} onChange={e => setSearch(e.target.value)} /></div></div>
      {filtered.length ? <ul className="divide-y border-y">{filtered.map(item => <li key={item.id} className="flex flex-wrap items-center gap-3 py-4"><div className="flex min-w-0 flex-1 items-center gap-3"><GitBranch className="size-5 shrink-0 text-muted-foreground" /><div className="min-w-0"><h3 className="break-words font-semibold">{item.name || "Untitled request type"}</h3><p className="text-xs text-muted-foreground">{item.team} · {item.fields.length} fields · {item.steps.length} steps</p>{mode !== "forms" && <p className="mt-2 break-words text-sm text-muted-foreground">{routeInWords(item.steps)}</p>}</div></div><ToneBadge tone={item.status === "Published" ? "success" : "neutral"}>{item.status}</ToneBadge><Button variant="outline" onClick={() => open(item)} aria-label={`Edit ${item.name}`}>Edit</Button></li>)}</ul> : <EmptyState variant={search ? "no-results" : "empty"} title={search ? "No matching request types" : "No request types yet"} description={search ? "Try a different name or team." : "Create your first request type."} action={<Button variant="outline" onClick={() => search ? setSearch("") : open(blankType(), true)}>{search ? "Clear search" : "New request type"}</Button>} />}
    </>}
  </AppShell>;
}

export function AuthoringPending() { return <AppShell><h1 className="mb-6 font-display text-4xl font-semibold">Request types</h1><ListSkeleton rows={3} /></AppShell>; }
export function AuthoringError({ reset }: ErrorComponentProps) {
  const router = useRouter();
  return <AppShell><h1 className="font-display text-4xl font-semibold">Request types</h1><RequestTypesNav /><EmptyState variant="error" title="Request types didn’t load" description="Try loading them again." action={<Button onClick={() => { router.history.replace(router.state.location.pathname); void router.invalidate().then(reset); }}>Retry</Button>} /></AppShell>;
}