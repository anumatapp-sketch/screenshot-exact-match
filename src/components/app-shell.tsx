import { Link } from "@tanstack/react-router";
import { Inbox, FileText, Menu, Settings, Layers } from "lucide-react";
import type { ReactNode } from "react";

const DESKTOP_NAV = [
  { to: "/", label: "Today", icon: Inbox },
  { to: "/requests", label: "Requests", icon: FileText },
  { to: "/templates", label: "Request types", icon: Layers },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

const TABS = [
  { to: "/", label: "Today", icon: Inbox },
  { to: "/requests", label: "Requests", icon: FileText },
  { to: "/menu", label: "Menu", icon: Menu },
] as const;

export function AppShell({ children, docked = false }: { children: ReactNode; docked?: boolean }) {
  return (
    <div className="min-h-screen md:grid md:grid-cols-[232px_minmax(0,1fr)]">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-card focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <aside className="hidden border-r bg-card md:sticky md:top-0 md:flex md:h-screen md:flex-col md:gap-8 md:p-5">
        <div className="font-display text-2xl font-semibold tracking-tight">anumat</div>
        <nav aria-label="Main" className="flex flex-col gap-1">
          {DESKTOP_NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: to === "/" }}
              className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              activeProps={{ className: "bg-accent !text-accent-foreground" }}
            >
              <Icon className="size-4" aria-hidden /> {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto text-xs text-muted-foreground">Ask → Approve → Move forward</div>
      </aside>
      {/* Reserved bottom space: tab bar (56px) + optional docked bar (64px) + safe area */}
      <main
        id="main"
        className={`min-w-0 px-4 pt-6 sm:px-8 md:pb-12 md:pt-10 ${docked ? "pb-[calc(10.5rem+env(safe-area-inset-bottom,0px))]" : "pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))]"}`}
      >
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 border-t bg-card pb-[env(safe-area-inset-bottom,0px)] md:hidden"
      >
        {TABS.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: to === "/" }}
            className="flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs text-muted-foreground"
            activeProps={{ className: "!text-primary font-semibold", "aria-current": "page" }}
          >
            <Icon className="size-5" aria-hidden /> {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
