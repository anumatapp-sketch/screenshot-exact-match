import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import type { ComponentProps, ComponentType, ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route } from "@/routes/requests.$id";

type MockLinkProps = {
  to?: unknown;
  params?: Record<string, string>;
  children?: ReactNode;
  className?: string;
  activeProps?: { className?: string; "aria-current"?: string };
  activeOptions?: { exact?: boolean };
} & ComponentProps<"a">;

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (config: { component: ComponentType }) => ({
    ...config,
    useParams: () => ({ id: "RQ-1042" }),
  }),
  useBlocker: vi.fn(),
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

describe("Request detail (Phase 3, Phase 6, G-08, G-09, G-10)", () => {
  const routeObj = Route as unknown as { component: ComponentType };
  const DetailComponent = routeObj.component;

  const renderWithQuery = (client: QueryClient) => {
    return render(
      <QueryClientProvider client={client}>
        <DetailComponent />
      </QueryClientProvider>,
    );
  };

  it("renders request details, deep link section anchors and mobile approval chain trigger", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    renderWithQuery(queryClient);

    await waitFor(() => {
      expect(screen.getByText("Laptops for new finance hires")).toBeInTheDocument();
    });

    // Check deep-link section links
    expect(screen.getByRole("link", { name: "Summary" })).toHaveAttribute("href", "#summary");
    expect(screen.getByRole("link", { name: "Line items" })).toHaveAttribute("href", "#items");
    expect(screen.getByRole("link", { name: /Approval chain/i })).toHaveAttribute("href", "#chain");

    // Check mobile chain trigger button
    expect(
      screen.getByRole("button", { name: /View approval chain \(4 steps\)/i }),
    ).toBeInTheDocument();
  });

  it("opens reject confirmation dialog with destructive style and requires a reason (G-09, G-10)", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    renderWithQuery(queryClient);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Reject" })).toBeInTheDocument();
    });

    const rejectButton = screen.getByRole("button", { name: "Reject" });
    fireEvent.click(rejectButton);

    // Dialog title
    await waitFor(() => {
      expect(screen.getByText("Reject RQ-1042?")).toBeInTheDocument();
    });

    const confirmRejectBtn = screen.getByRole("button", { name: "Reject" });
    // Check destructive variant styling
    expect(confirmRejectBtn).toHaveClass("bg-destructive");

    // Attempting to confirm without reason triggers error
    fireEvent.click(confirmRejectBtn);

    await waitFor(() => {
      expect(
        screen.getByText("Please add a comment so the requester knows what to fix."),
      ).toBeInTheDocument();
      expect(screen.getByLabelText("Reason (required)")).toHaveAttribute("aria-invalid", "true");
      expect(screen.getByLabelText("Reason (required)")).toHaveAttribute(
        "aria-describedby",
        "reason-err",
      );
    });
  });
});
