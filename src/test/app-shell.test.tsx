import { render, screen } from "@testing-library/react";
import type { ComponentProps, ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { AppShell } from "@/components/app-shell";

type MockLinkProps = {
  to?: string;
  children?: ReactNode;
  className?: string;
   activeProps?: { className?: string; "aria-current"?: ComponentProps<"a">["aria-current"] };
  activeOptions?: { exact?: boolean };
} & ComponentProps<"a">;

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    to,
    children,
    className,
    activeProps,
    activeOptions: _activeOptions,
    ...props
  }: MockLinkProps) => {
    // Simulate active route for "/" in this mock if exact is checked
    const isActive = to === "/";
    return (
      <a
        href={to}
        className={`${className ?? ""} ${isActive && activeProps?.className ? activeProps.className : ""}`}
        aria-current={
          isActive && activeProps?.["aria-current"] ? activeProps["aria-current"] : undefined
        }
        {...props}
      >
        {children}
      </a>
    );
  },
}));

describe("AppShell (A-01, G-02, G-07, T-NAV-01)", () => {
  it("renders skip to content link targeting main landmark", () => {
    render(<AppShell>Content</AppShell>);
    const skipLink = screen.getByRole("link", { name: /skip to content/i });
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute("href", "#main");
  });

  it("reserves safe-area bottom padding based on docked prop", () => {
    const { container, rerender } = render(<AppShell docked={false}>Content</AppShell>);
    const mainDefault = container.querySelector("main#main");
    expect(mainDefault?.className).toContain("pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))]");

    rerender(<AppShell docked={true}>Content</AppShell>);
    const mainDocked = container.querySelector("main#main");
    expect(mainDocked?.className).toContain("pb-[calc(10.5rem+env(safe-area-inset-bottom,0px))]");
  });

  it("renders mobile tab bar with aria-current on active item", () => {
    render(<AppShell>Content</AppShell>);
    const navs = screen.getAllByRole("navigation", { name: "Main" });
    expect(navs.length).toBe(2); // desktop + mobile

    const mobileNav = navs[1];
     if (!mobileNav) throw new Error("Mobile navigation missing");
    expect(mobileNav).toHaveClass("md:hidden");

    // "Today" is active in our mock
    const todayLinks = screen.getAllByRole("link", { name: /today/i });
    const mobileTodayLink = todayLinks.find((l) => mobileNav.contains(l));
    expect(mobileTodayLink).toHaveAttribute("aria-current", "page");

    // "Requests" is not active
    const requestLinks = screen.getAllByRole("link", { name: /requests/i });
    const mobileRequestsLink = requestLinks.find((l) => mobileNav.contains(l));
    expect(mobileRequestsLink).not.toHaveAttribute("aria-current");
  });
});
