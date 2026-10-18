import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import type { ComponentProps, ComponentType, ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route } from "@/routes/index";

type MockLinkProps = {
  to?: unknown;
  params?: Record<string, string>;
  children?: ReactNode;
  className?: string;
  activeProps?: { className?: string; "aria-current"?: string };
  activeOptions?: { exact?: boolean };
} & ComponentProps<"a">;

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (config: { component: ComponentType }) => config,
  Link: ({
    to,
    children,
    className,
    activeProps: _activeProps,
    activeOptions: _activeOptions,
    ...props
  }: MockLinkProps) => (
    <a href={typeof to === "string" ? to : "#"} className={className} {...props}>
      {children}
    </a>
  ),
}));

describe("Today page (Phase 7)", () => {
  const routeObj = Route as unknown as { component: ComponentType };
  const TodayComponent = routeObj.component;

  const renderWithQuery = (client: QueryClient) => {
    return render(
      <QueryClientProvider client={client}>
        <TodayComponent />
      </QueryClientProvider>,
    );
  };

  it("opens a bottom sheet on mobile attention bar click instead of immediately navigating (Phase 7)", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    renderWithQuery(queryClient);

    await waitFor(() => {
      expect(screen.getByText("Waiting for your approval")).toBeInTheDocument();
    });

    // Mobile attention bar button
    const attentionBar = screen.getByRole("button", {
      name: /\d+ approvals? need(s)? you/i,
    });
    expect(attentionBar).toBeInTheDocument();
    expect(attentionBar).toHaveAttribute("aria-haspopup", "dialog");

    fireEvent.click(attentionBar);

    // Sheet should be opened
    await waitFor(() => {
      expect(screen.getByText(/waiting, oldest deadline first/i)).toBeInTheDocument();
    });
  });
});
