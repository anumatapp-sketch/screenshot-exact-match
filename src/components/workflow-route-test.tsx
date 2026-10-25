import { useEffect, useState } from "react";
import { Check, FlaskConical, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { boundaryAmounts, decisionPreview, routeIds, type AuthoringIssue } from "@/lib/authoring-checks";
import { simulateRoute, type RequestType } from "@/lib/authoring";

type TestCase = { id: number; amount: number; expected: string[]; signature: string };
export function WorkflowRouteTest({ value, issues, onEvidence }: { value: RequestType; issues: AuthoringIssue[]; onEvidence: (evidence: { cases: number; changed: number; covered: number; total: number }) => void }) {
  const [amount, setAmount] = useState("500");
  const [settled, setSettled] = useState("500");
  const [outcome, setOutcome] = useState<"approve" | "reject" | "changes">("approve");
  const [cases, setCases] = useState<TestCase[]>([]);
  useEffect(() => { const timer = setTimeout(() => setSettled(amount), 600); return () => clearTimeout(timer); }, [amount]);
  const number = Number(settled);
  const valid = settled.trim() !== "" && Number.isFinite(number) && number >= 0;
  const routeIssues = issues.filter(issue => ["steps", "step-name", "approver", "threshold", "amount-field"].includes(issue.code));
  const ready = valid && !routeIssues.length;
  const signature = JSON.stringify(value.steps.map(step => [step.id, step.name, step.assignee, step.threshold]));
  const changed = cases.filter(item => item.signature !== signature || JSON.stringify(item.expected) !== JSON.stringify(routeIds(value.steps, item.amount))).length;
  const boundaries = boundaryAmounts(value.steps);
  const conditional = value.steps.filter(step => step.threshold !== null);
  const covered = routeIssues.length ? 0 : conditional.reduce((count, step) => {
    const results = boundaries.map(input => routeIds(value.steps, input).includes(step.id));
    return count + Number(results.includes(true)) + Number(results.includes(false));
  }, 0);
  useEffect(() => { onEvidence({ cases: cases.length, changed, covered, total: conditional.length * 2 }); }, [cases.length, changed, covered, conditional.length, onEvidence]);
  return <section aria-label="Test this route" className="space-y-4 border-t pt-6">
    <h3 className="flex items-center gap-2 font-semibold"><FlaskConical className="size-5 text-primary" />Test this route</h3>
    <div className="flex flex-wrap items-end gap-3"><div className="min-w-0 flex-1 space-y-2"><Label htmlFor="simulation-amount">Sample Amount</Label><Input id="simulation-amount" type="number" min="0" step="0.01" value={amount} onChange={event => setAmount(event.target.value)} /></div><Button variant="outline" disabled={!ready || amount !== settled} onClick={() => setCases(previous => [...previous, { id: Date.now(), amount: number, expected: routeIds(value.steps, number), signature }])}><Save className="size-4" />Keep test</Button></div>
    <p role="status" aria-live="polite" className="text-sm text-muted-foreground">{amount !== settled ? "Updating…" : !valid ? "Enter an amount of zero or more." : routeIssues.length ? `${routeIssues.length} ${routeIssues.length === 1 ? "approval problem" : "approval problems"} to fix before testing.` : `${routeIds(value.steps, number).length} approvers for Amount ${number.toLocaleString()}`}</p>
    {ready && <><ol className="space-y-3 border-l-2 pl-4">{simulateRoute(value.steps, number).map(step => <li key={step.id} className={`break-words text-sm ${step.included ? "" : "text-muted-foreground"}`}><p className="font-medium">{step.included ? "Included" : "Skipped"} · {step.assignee}</p>{step.threshold !== null && <p className="text-xs">Amount {number.toLocaleString()} is {number >= step.threshold ? "at least" : "below"} {step.threshold.toLocaleString()}</p>}</li>)}</ol><div className="space-y-2"><Label htmlFor="test-outcome">What if an included approver…</Label><Select value={outcome} onValueChange={next => { if (next === "approve" || next === "reject" || next === "changes") setOutcome(next); }}><SelectTrigger id="test-outcome" className="min-h-11"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="approve">Approves</SelectItem><SelectItem value="reject">Rejects</SelectItem><SelectItem value="changes">Requests changes</SelectItem></SelectContent></Select><p className="text-sm">{decisionPreview(outcome)}</p></div></>}
    <div className="space-y-3 border-t pt-4"><h4 className="text-sm font-semibold">Automatic amount checks</h4><p className="text-xs text-muted-foreground">{covered} of {conditional.length * 2} amount-rule outcomes checked</p>{!conditional.length ? <p className="text-sm text-muted-foreground">No amount rules.</p> : !routeIssues.length && <ul className="space-y-2">{boundaries.map(input => <li key={input} className="flex items-start gap-2 text-sm"><Check className="mt-0.5 size-4 shrink-0 text-status-success" /><span className="min-w-0 break-words">Amount {input.toLocaleString(undefined, { minimumFractionDigits: 2 })} → {simulateRoute(value.steps, input).filter(step => step.included).map(step => step.assignee).join(" → ") || "No extra approval"}</span></li>)}</ul>}</div>
    {cases.length > 0 && <div className="space-y-2 border-t pt-4"><h4 className="text-sm font-semibold">Session test cases</h4>{cases.map(item => { const differs = item.signature !== signature || JSON.stringify(item.expected) !== JSON.stringify(routeIds(value.steps, item.amount)); return <div key={item.id} className="flex items-center justify-between gap-2 text-sm"><span className={differs ? "text-status-warning" : "text-status-success"}>Amount {item.amount.toLocaleString()} · {differs ? "Changed — test again" : "Pass"}</span><Button variant="ghost" size="icon" className="size-11 shrink-0" title="Remove test case" aria-label={`Remove test for ${item.amount}`} onClick={() => setCases(previous => previous.filter(test => test.id !== item.id))}><Trash2 className="size-4" /></Button></div>; })}</div>}
  </section>;
}