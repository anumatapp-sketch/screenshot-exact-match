import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import type { ComponentProps, ComponentType, ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route } from "@/routes/requests.index";

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

describe("Requests list page (T-LIST-01, T-LIST-02, T-LIST-03)", () => {
  const routeObj = Route as unknown as { component: ComponentType };
  const RequestsComponent = routeObj.component;

  const renderWithQuery = (client: QueryClient) => {
    return render(
      <QueryClientProvider client={client}>
        <RequestsComponent />
      </QueryClientProvider>,
    );
  };

  it("filters requests by title, ID or requester and announces count politely (T-LIST-01)", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    renderWithQuery(queryClient);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent(/requests/i);
    });

    const searchInput = screen.getByRole("searchbox", { name: "Search requests" });
    fireEvent.change(searchInput, { target: { value: "Laptops" } });

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("1 of 7 requests");
    });
  });

  it("shows no-results recovery when search yields no matches, and clicking Clear restores list (T-LIST-02)", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    renderWithQuery(queryClient);

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent(/requests/i);
    });

    const searchInput = screen.getByRole("searchbox", { name: "Search requests" });
    fireEvent.change(searchInput, { target: { value: "zzqx-nonexistent" } });

    await waitFor(() => {
      expect(screen.getByText("No matching requests")).toBeInTheDocument();
      expect(screen.getByText(/Nothing matches “zzqx-nonexistent”/)).toBeInTheDocument();
    });

    const clearButton = screen.getByRole("button", { name: "Clear search" });
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(screen.queryByText("No matching requests")).not.toBeInTheDocument();
      expect(screen.getByRole("status")).toHaveTextContent("7 of 7 requests");
    });
  });

  it("shows error state with retry action when query fails (T-LIST-03)", async () => {
    const originalSearch = window.location.search;
    Object.defineProperty(window, "location", {
      writable: true,
      value: new URL("http://localhost:8080/requests?fail=1"),
    });

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    renderWithQuery(queryClient);

    await waitFor(() => {
      expect(screen.getByText("Requests didn't load")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
    });

    Object.defineProperty(window, "location", {
      writable: true,
      value: new URL(`http://localhost:8080/requests${originalSearch}`),
    });
  });
});
