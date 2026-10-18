import { render, screen, fireEvent } from "@testing-library/react";
import type { ComponentProps, ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { ResponsiveDataView, type Sort } from "@/components/responsive-data-view";
import { REQUESTS } from "@/lib/requests";

type MockLinkProps = {
  to?: unknown;
  params?: Record<string, string>;
  children?: ReactNode;
  className?: string;
} & ComponentProps<"a">;

vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, children, className, ...props }: MockLinkProps) => (
    <a href={typeof to === "string" ? to : "#"} className={className} {...props}>
      {children}
    </a>
  ),
}));

describe("ResponsiveDataView (G-01, G-05, G-06, A-04)", () => {
  const defaultSort: Sort = { key: "updatedRank", dir: "asc" };

  it("renders desktop table with hidden lg:block and mobile view with lg:hidden", () => {
    const onSort = vi.fn();
    const { container } = render(
      <ResponsiveDataView rows={REQUESTS} sort={defaultSort} onSort={onSort} />,
    );

    const desktopWrapper = container.querySelector(".hidden.lg\\:block");
    expect(desktopWrapper).toBeInTheDocument();
    expect(desktopWrapper?.querySelector("table")).toBeInTheDocument();

    const mobileWrapper = container.querySelector(".lg\\:hidden");
    expect(mobileWrapper).toBeInTheDocument();
  });

  it("exposes aria-sort on sortable table headers and marks the sorted column", () => {
    const onSort = vi.fn();
    render(
      <ResponsiveDataView rows={REQUESTS} sort={{ key: "amount", dir: "desc" }} onSort={onSort} />,
    );

    const amountHeader = screen.getByRole("columnheader", { name: /amount/i });
    expect(amountHeader).toHaveAttribute("aria-sort", "descending");

    const idHeader = screen.getByRole("columnheader", { name: /id/i });
    expect(idHeader).toHaveAttribute("aria-sort", "none");

    const requesterHeader = screen.getByRole("columnheader", { name: /requester/i });
    expect(requesterHeader).not.toHaveAttribute("aria-sort");
  });

  it("calls onSort when a sortable column header button is clicked", () => {
    const onSort = vi.fn();
    render(
      <ResponsiveDataView rows={REQUESTS} sort={{ key: "amount", dir: "desc" }} onSort={onSort} />,
    );

    const titleSortButton = screen.getByRole("button", { name: /title/i });
    fireEvent.click(titleSortButton);
    expect(onSort).toHaveBeenCalledWith("title");
  });

  it("locks identity column with sticky left-0", () => {
    const { container } = render(
      <ResponsiveDataView rows={REQUESTS} sort={defaultSort} onSort={vi.fn()} />,
    );

    const stickyTh = container.querySelector("th.sticky.left-0");
    expect(stickyTh).toBeInTheDocument();

    const stickyTd = container.querySelector("td.sticky.left-0");
    expect(stickyTd).toBeInTheDocument();
  });

  it("groups requests by status with section headers on mobile", () => {
    render(<ResponsiveDataView rows={REQUESTS} sort={defaultSort} onSort={vi.fn()} />);

    // In REQUESTS there are items with In review status
    const inReviewGroup = screen.getByRole("heading", { name: /In review \(\d+\)/i });
    expect(inReviewGroup).toBeInTheDocument();
  });
});
