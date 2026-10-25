import { FileText, GitBranch } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { RequestType } from "@/lib/authoring";
import { routeInWords } from "@/lib/authoring-checks";

export function RequestTypePreview({ value, mode }: { value: RequestType; mode: "templates" | "forms" | "workflows" }) {
  return <section aria-label="Live preview" className="min-w-0 space-y-6 border-t pt-6">
    <div><span className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground"><FileText className="size-4" />Live preview</span><h3 className="mt-3 break-words font-display text-2xl font-semibold">{value.name || "Untitled request type"}</h3><p className="mt-2 break-words text-sm text-muted-foreground">{value.description}</p></div>
    {mode !== "workflows" && <div className="space-y-4">{value.fields.map(field => <div key={field.id} className="space-y-2"><Label htmlFor={`preview-${field.id}`}>{field.label || "Untitled field"}</Label>{field.type === "textarea" ? <Textarea id={`preview-${field.id}`} /> : <Input id={`preview-${field.id}`} type={field.type === "number" ? "number" : "text"} />}</div>)}</div>}
    {mode !== "forms" && <div><h4 className="mb-3 flex items-center gap-2 text-sm font-semibold"><GitBranch className="size-4" />Approval route</h4><p className="mb-4 break-words text-sm text-muted-foreground">{routeInWords(value.steps)}</p><ol className="space-y-3 border-l-2 pl-4">{value.steps.map((step, index) => <li key={step.id} className="break-words text-sm"><p className="font-medium">{index + 1}. {step.assignee || "No approver"}</p><p className="text-muted-foreground">{step.name || "Untitled step"}</p>{step.threshold !== null && <p className="text-xs text-status-warning">Only if Amount is at least {Number.isFinite(step.threshold) ? step.threshold.toLocaleString() : "…"}</p>}</li>)}</ol></div>}
  </section>;
}