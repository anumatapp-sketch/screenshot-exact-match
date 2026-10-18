import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Settings, FileText, Inbox } from "lucide-react";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Menu — Anumat" },
      { name: "description", content: "All Anumat sections and settings in one place." },
      { property: "og:title", content: "Menu — Anumat" },
      { property: "og:description", content: "All Anumat sections and settings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MenuPage,
});

const ITEMS = [
  { to: "/", label: "Today", hint: "What needs you now", icon: Inbox },
  { to: "/requests", label: "Requests", hint: "Every request, by status", icon: FileText },
  { to: "/settings", label: "Settings", hint: "Profile and notifications", icon: Settings },
] as const;

function MenuPage() {
  return (
    <AppShell>
      <h1 className="font-display text-4xl font-semibold tracking-tight">Menu</h1>
      <ul className="mt-6 divide-y overflow-hidden rounded-2xl border bg-card">
        {ITEMS.map(({ to, label, hint, icon: Icon }) => (
          <li key={to}>
            <Link to={to} className="flex min-h-16 items-center gap-3 p-4 hover:bg-muted/60">
              <Icon className="size-5 shrink-0 text-muted-foreground" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="font-medium">{label}</p>
                <p className="truncate text-sm text-muted-foreground">{hint}</p>
              </div>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
