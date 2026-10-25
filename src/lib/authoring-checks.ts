import { simulateRoute, type ApprovalStep, type RequestType } from "@/lib/authoring";

export function routeInWords(steps: ApprovalStep[]) {
  return steps.length ? steps.map(step => `${step.assignee.trim() || "Choose an approver"}${step.threshold === null ? "" : ` if Amount is at least ${step.threshold.toLocaleString()}`}`).join(" → ") + " → Complete" : "No approvers yet";
}

export type AuthoringIssue = {
  code: "name" | "fields" | "field-label" | "steps" | "step-name" | "approver" | "threshold" | "amount-field";
  message: string;
  target: string;
  stepId?: string;
};

export function authoringIssues(value: RequestType): AuthoringIssue[] {
  const issues: AuthoringIssue[] = [];
  if (!value.name.trim()) issues.push({ code: "name", message: "Name this request type before publishing.", target: "request-type-name" });
  if (!value.fields.length) issues.push({ code: "fields", message: "Add a form field so people can describe their request.", target: "authoring-fields" });
  value.fields.forEach((field, index) => {
    if (!field.label.trim()) issues.push({ code: "field-label", message: `Field ${index + 1} needs a label so people know what to enter.`, target: `label-${field.id}` });
  });
  if (!value.steps.length) issues.push({ code: "steps", message: "Add an approver before publishing.", target: "authoring-approvals" });
  value.steps.forEach((step, index) => {
    if (!step.name.trim()) issues.push({ code: "step-name", message: `Step ${index + 1} needs a name.`, target: "step-name", stepId: step.id });
    if (!step.assignee.trim()) issues.push({ code: "approver", message: `Step ${index + 1} doesn't say who approves. Choose an approver.`, target: "step-approver", stepId: step.id });
    if (step.threshold !== null && (!Number.isFinite(step.threshold) || step.threshold < 0)) issues.push({ code: "threshold", message: `Step ${index + 1} needs a minimum amount of zero or more.`, target: "threshold", stepId: step.id });
  });
  if (value.steps.some(step => step.threshold !== null) && !value.fields.some(field => field.type === "number" && field.label.trim().toLowerCase() === "amount")) {
    issues.push({ code: "amount-field", message: "These rules need a numeric Amount field so the approval route can use the answer.", target: "authoring-fields" });
  }
  return issues;
}

export function boundaryAmounts(steps: ApprovalStep[]): number[] {
  return [...new Set(steps.flatMap(step => {
    if (step.threshold === null || !Number.isFinite(step.threshold) || step.threshold < 0) return [];
    return [Math.max(0, Number((step.threshold - 0.01).toFixed(2))), step.threshold];
  }))].sort((a, b) => a - b);
}

export function routeIds(steps: ApprovalStep[], amount: number) {
  return simulateRoute(steps, amount).filter(step => step.included).map(step => step.id);
}

export function decisionPreview(outcome: "approve" | "reject" | "changes") {
  if (outcome === "reject") return "The request ends as Rejected. Later approvers do not review it.";
  if (outcome === "changes") return "The request returns to the requester for changes. Review restarts when they resubmit.";
  return "All included approvers approve; the request completes.";
}