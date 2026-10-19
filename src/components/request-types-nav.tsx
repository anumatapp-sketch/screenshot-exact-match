import { Link } from "@tanstack/react-router";

export function RequestTypesNav() {
  return <nav aria-label="Request types" className="mb-7 mt-6 flex gap-6 border-b">
    {([{ to: "/templates", label: "Templates" }, { to: "/forms", label: "Forms" }, { to: "/workflows", label: "Workflows" }] as const).map(item => <Link key={item.to} to={item.to} className="min-h-11 border-b-2 border-transparent py-3 text-sm font-medium text-muted-foreground" activeProps={{ className: "!border-primary !text-primary", "aria-current": "page" }}>{item.label}</Link>)}
  </nav>;
}