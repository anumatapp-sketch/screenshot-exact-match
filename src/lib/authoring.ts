export type FormField = { id: string; label: string; type: "text" | "number" | "textarea" };
export type ApprovalStep = { id: string; name: string; assignee: string; threshold: number | null };
export type RequestType = { id: string; name: string; description: string; team: string; status: "Draft" | "Published"; fields: FormField[]; steps: ApprovalStep[] };
export const newId = () => crypto.randomUUID();
export const cloneType = (value: RequestType): RequestType => structuredClone(value);
export const PRESETS: RequestType[] = [
  { id: "expense", name: "Expense reimbursement", description: "Travel, supplies, and other business expenses.", team: "Finance", status: "Published", fields: [{ id: "amount", label: "Amount", type: "number" }, { id: "vendor", label: "Vendor", type: "text" }, { id: "reason", label: "Justification", type: "textarea" }], steps: [{ id: "manager", name: "Manager approval", assignee: "Department manager", threshold: null }, { id: "finance", name: "Finance review", assignee: "Finance team", threshold: 1000 }] },
  { id: "onboarding", name: "Employee onboarding", description: "Prepare access and equipment for a new colleague.", team: "People", status: "Published", fields: [{ id: "employee", label: "Employee name", type: "text" }, { id: "department", label: "Department", type: "text" }], steps: [{ id: "hr", name: "People review", assignee: "People team", threshold: null }, { id: "it", name: "Equipment approval", assignee: "IT team", threshold: null }] },
  { id: "contract", name: "Contract review", description: "Review supplier agreements before signing.", team: "Operations", status: "Draft", fields: [{ id: "supplier", label: "Supplier", type: "text" }, { id: "amount", label: "Amount", type: "number" }], steps: [{ id: "legal", name: "Legal review", assignee: "Legal team", threshold: null }, { id: "director", name: "Director approval", assignee: "Operations director", threshold: null }] },
];
export const blankType = (): RequestType => ({ id: newId(), name: "", description: "", team: "All teams", status: "Draft", fields: [], steps: [] });
export function simulateRoute(steps: ApprovalStep[], amount: number) {
  return steps.map(step => ({ ...step, included: step.threshold === null || amount >= step.threshold }));
}
export function validateType(value: RequestType) {
  const errors: string[] = [];
  if (!value.name.trim()) errors.push("Enter a request type name.");
  if (!value.fields.length) errors.push("Add at least one form field.");
  if (value.fields.some(f => !f.label.trim())) errors.push("Give every field a label.");
  if (!value.steps.length) errors.push("Add at least one approval step.");
  if (value.steps.some(s => !s.name.trim() || !s.assignee.trim())) errors.push("Give every step a name and approver.");
  if (value.steps.some(s => s.threshold !== null && (!Number.isFinite(s.threshold) || s.threshold < 0))) errors.push("Thresholds must be zero or greater.");
  if (value.steps.some(s => s.threshold !== null) && !value.fields.some(f => f.label.trim().toLowerCase() === "amount" && f.type === "number")) errors.push("Add a numeric Amount field for conditional approvals.");
  return errors;
}