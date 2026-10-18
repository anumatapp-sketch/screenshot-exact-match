import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import type { ComponentProps, ComponentType, ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route } from "@/routes/settings";

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

describe("Settings form (T-FORM-01, T-FORM-02, A-05)", () => {
  const routeObj = Route as unknown as { component: ComponentType };
  const SettingsComponent = routeObj.component;

  const renderWithQuery = (client: QueryClient) => {
    return render(
      <QueryClientProvider client={client}>
        <SettingsComponent />
      </QueryClientProvider>,
    );
  };

  it("keeps Save disabled until dirty, and enables Save on modification (T-FORM-01)", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    renderWithQuery(queryClient);

    await waitFor(() => {
      expect(screen.getByLabelText("Full name")).toBeInTheDocument();
    });

    const saveButton = screen.getByRole("button", { name: "Save" });
    const statusText = screen.getByText("All changes saved");
    expect(saveButton).toBeDisabled();
    expect(statusText).toBeInTheDocument();

    const nameInput = screen.getByLabelText("Full name");
    fireEvent.change(nameInput, { target: { value: "New Name" } });

    await waitFor(() => {
      expect(saveButton).toBeEnabled();
      expect(screen.getByText("Unsaved changes")).toBeInTheDocument();
    });
  });

  it("validates required fields, links errors via aria-describedby and sets aria-invalid (T-FORM-02, A-05)", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    renderWithQuery(queryClient);

    await waitFor(() => {
      expect(screen.getByLabelText("Full name")).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText("Full name");
    fireEvent.change(nameInput, { target: { value: "" } });
    fireEvent.blur(nameInput);

    await waitFor(() => {
      expect(nameInput).toHaveAttribute("aria-invalid", "true");
      expect(nameInput).toHaveAttribute("aria-describedby", "name-err");
      expect(screen.getByText("Enter your name.")).toBeInTheDocument();
    });
  });

  it("cancel button resets the form and dirty state", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    renderWithQuery(queryClient);

    await waitFor(() => {
      expect(screen.getByLabelText("Full name")).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText("Full name");
    const originalValue = (nameInput as HTMLInputElement).value;
    fireEvent.change(nameInput, { target: { value: "Temporary Edit" } });

    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    expect(cancelButton).toBeEnabled();
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect((nameInput as HTMLInputElement).value).toBe(originalValue);
      expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
      expect(screen.getByText("All changes saved")).toBeInTheDocument();
    });
  });
});
