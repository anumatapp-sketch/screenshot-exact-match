import { useState } from "react";
import { ArrowDown, ArrowUp, Copy, GitBranch, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { newId, simulateRoute, type ApprovalStep } from "@/lib/authoring";
import { routeInWords, type AuthoringIssue } from "@/lib/authoring-checks";
import { useEffect } from "react";

export function ApprovalChainEditor({ steps, onChange, issues = [], focusIssue }: { steps: ApprovalStep[]; onChange: (steps: ApprovalStep[]) => void; issues?: AuthoringIssue[]; focusIssue?: AuthoringIssue | null }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [amount, setAmount] = useState("500");
  const [testing, setTesting] = useState(false);
  const current = steps.find(s => s.id === selected);
  useEffect(() => {
    if (!focusIssue?.stepId) return;
    setSelected(focusIssue.stepId);
    const timer = setTimeout(() => document.getElementById(focusIssue.target)?.focus(), 0);
    return () => clearTimeout(timer);
  }, [focusIssue]);
  const fieldIssues = issues.filter(issue => issue.stepId === selected);
  const results = simulateRoute(steps, Number(amount));
  const update = (patch: Partial<ApprovalStep>) => onChange(steps.map(s => s.id === selected ? { ...s, ...patch } : s));
  const move = (index: number, delta: number) => { const next = [...steps]; const step = next[index]; const other = next[index + delta]; if (!step || !other) return; next[index] = other; next[index + delta] = step; onChange(next); };
  return <div className="space-y-4">
    <div id="authoring-approvals" tabIndex={-1} className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-semibold">Who approves</h3><Button variant="outline" onClick={() => { const step = { id: newId(), name: "Manager approval", assignee: "Requester's manager", threshold: null }; onChange([...steps, step]); setSelected(step.id); }}><Plus className="size-4" />Add approver</Button></div>
    <p className="break-words text-sm text-muted-foreground">{routeInWords(steps)}</p>
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_240px]">
      <ol className="min-w-0 space-y-3" aria-label="Approval chain">
        <li className="text-xs font-medium text-muted-foreground">Request submitted</li>
        {steps.map((step, index) => <li key={step.id} className={`rounded-lg border bg-card p-3 ${selected === step.id ? "border-primary" : ""} ${testing && results[index]?.included ? "ring-2 ring-status-success" : ""} ${testing && !results[index]?.included ? "opacity-50" : ""}`}>
          <div className="flex items-start gap-2"><span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">{index + 1}</span><Button variant="ghost" className="h-auto min-h-11 min-w-0 flex-1 justify-start whitespace-normal px-1 text-left" onClick={() => setSelected(step.id)}><span><span className="block">{step.name}</span><span className="block text-xs font-normal text-muted-foreground">{step.assignee || "Choose approver"}</span></span></Button><div className="flex shrink-0 flex-col"><Button variant="ghost" size="icon" className="size-11" aria-label={`Move ${step.name} up`} title="Move up" disabled={index === 0} onClick={() => move(index, -1)}><ArrowUp className="size-4" /></Button><Button variant="ghost" size="icon" className="size-11" aria-label={`Move ${step.name} down`} title="Move down" disabled={index === steps.length - 1} onClick={() => move(index, 1)}><ArrowDown className="size-4" /></Button></div></div>
          {step.threshold !== null && <div className="mt-2 flex items-center gap-2 border-l-2 border-status-warning bg-status-warning-soft p-2 text-xs font-medium text-status-warning"><GitBranch className="size-4 shrink-0" />Only if Amount is at least {Number.isFinite(step.threshold) ? step.threshold.toLocaleString() : "…"} · otherwise skip</div>}
          {issues.some(issue => issue.stepId === step.id) && <p className="mt-2 text-xs font-medium text-destructive">{issues.filter(issue => issue.stepId === step.id).length} to fix</p>}
          {testing && <p className="mt-2 text-xs font-semibold">{results[index]?.included ? "Included in route" : "Skipped"}</p>}
        </li>)}
        <li className="text-xs font-medium text-muted-foreground">Request complete</li>
      </ol>
      <aside aria-label="Step inspector" className="min-w-0 border-t pt-4 xl:border-l xl:border-t-0 xl:pl-5 xl:pt-0">
        {current ? <div className="space-y-4"><h4 className="font-semibold">Step settings</h4><div className="space-y-2"><Label htmlFor="step-approver">Approver</Label><Input id="step-approver" value={current.assignee} aria-invalid={fieldIssues.some(issue => issue.code === "approver")} aria-describedby={fieldIssues.some(issue => issue.code === "approver") ? "approver-error" : undefined} onChange={e => update({ assignee: e.target.value })} />{fieldIssues.find(issue => issue.code === "approver") && <p id="approver-error" className="text-xs text-destructive">{fieldIssues.find(issue => issue.code === "approver")?.message}</p>}</div><div className="space-y-2"><Label htmlFor="step-name">Step name</Label><Input id="step-name" value={current.name} aria-invalid={fieldIssues.some(issue => issue.code === "step-name")} onChange={e => update({ name: e.target.value })} /></div><div className="flex min-h-11 items-center justify-between gap-2"><Label htmlFor="conditional">Only above an amount</Label><Switch id="conditional" checked={current.threshold !== null} onCheckedChange={checked => update({ threshold: checked ? 1000 : null })} /></div>{current.threshold !== null && <div className="space-y-2"><Label htmlFor="threshold">Minimum amount (included)</Label><Input id="threshold" type="number" min="0" step="0.01" value={Number.isFinite(current.threshold) ? current.threshold : ""} aria-invalid={fieldIssues.some(issue => issue.code === "threshold")} aria-describedby={fieldIssues.some(issue => issue.code === "threshold") ? "threshold-error" : undefined} onChange={e => update({ threshold: e.target.valueAsNumber })} />{fieldIssues.find(issue => issue.code === "threshold") && <p id="threshold-error" className="text-xs text-destructive">{fieldIssues.find(issue => issue.code === "threshold")?.message}</p>}</div>}<div className="flex gap-2"><Button variant="outline" size="icon" className="size-11" title="Duplicate step" aria-label="Duplicate step" onClick={() => { const copy = { ...current, id: newId(), name: `${current.name} copy` }; const index = steps.findIndex(s => s.id === current.id); const next = [...steps]; next.splice(index + 1, 0, copy); onChange(next); setSelected(copy.id); }}><Copy className="size-4" /></Button><Button variant="outline" size="icon" className="size-11 text-destructive" title="Delete step" aria-label="Delete step" onClick={() => { onChange(steps.filter(s => s.id !== current.id)); setSelected(null); }}><Trash2 className="size-4" /></Button></div></div> : <p className="text-sm text-muted-foreground">No step selected</p>}
      </aside>
    </div>
    <div className="flex flex-wrap items-end gap-3 border-t pt-4"><div className="space-y-2"><Label htmlFor="test-amount">Test amount</Label><Input id="test-amount" className="w-36" type="number" min="0" value={amount} onChange={e => { setAmount(e.target.value); setTesting(false); }} /></div><Button variant="outline" disabled={amount === "" || !Number.isFinite(Number(amount)) || Number(amount) < 0 || !steps.length} onClick={() => setTesting(true)}><GitBranch className="size-4" />Test the route</Button></div>
  </div>;
}