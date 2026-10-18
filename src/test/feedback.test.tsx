import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  EmptyState,
  InlineError,
  ListSkeleton,
  StatusBadge,
  ToneBadge,
} from "@/components/feedback";

describe("Feedback pieces (G-03, G-04, A-06)", () => {
  describe("StatusBadge and ToneBadge", () => {
    it("renders with dot indicator marked aria-hidden and descriptive text", () => {
      const { container } = render(<StatusBadge status="rejected" />);
      const text = screen.getByText("Rejected");
      expect(text).toBeInTheDocument();

      // Dot has aria-hidden="true"
      const dot = container.querySelector('[aria-hidden="true"]');
      expect(dot).toBeInTheDocument();
      expect(dot?.className).toContain("bg-status-danger");
    });

    it("uses semantic tone variants for badges", () => {
      const { container, rerender } = render(<StatusBadge status="approved" />);
      expect(screen.getByText("Approved")).toBeInTheDocument();
      expect(container.firstChild).toHaveClass("bg-status-success-soft");
      expect(container.firstChild).toHaveClass("text-status-success");

      rerender(<StatusBadge status="draft" />);
      expect(screen.getByText("Draft")).toBeInTheDocument();
      expect(container.firstChild).toHaveClass("bg-status-neutral-soft");
      expect(container.firstChild).toHaveClass("text-status-neutral");

      rerender(<StatusBadge status="in_review" />);
      expect(screen.getByText("In review")).toBeInTheDocument();
      expect(container.firstChild).toHaveClass("bg-status-warning-soft");
      expect(container.firstChild).toHaveClass("text-status-warning");
    });

    it("renders custom children in ToneBadge", () => {
      render(<ToneBadge tone="info">Custom Info</ToneBadge>);
      expect(screen.getByText("Custom Info")).toBeInTheDocument();
    });
  });

  describe("EmptyState", () => {
    it("renders default empty variant with title and description", () => {
      render(
        <EmptyState
          title="No items found"
          description="Try creating one to get started."
          action={<button>Create Item</button>}
        />,
      );
      expect(screen.getByText("No items found")).toBeInTheDocument();
      expect(screen.getByText("Try creating one to get started.")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Create Item" })).toBeInTheDocument();
    });

    it("renders error variant with role=alert", () => {
      render(
        <EmptyState
          variant="error"
          title="Failed to load"
          description="Server returned an error."
        />,
      );
      const alert = screen.getByRole("alert");
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveTextContent("Failed to load");
    });
  });

  describe("InlineError", () => {
    it("renders error with id for aria-describedby linkage", () => {
      render(<InlineError id="email-error">Invalid email address</InlineError>);
      const err = screen.getByText("Invalid email address");
      expect(err).toBeInTheDocument();
      expect(err.closest("p")).toHaveAttribute("id", "email-error");
    });
  });

  describe("ListSkeleton", () => {
    it("renders list variant skeletons with loading status for screen readers", () => {
      render(<ListSkeleton rows={3} variant="list" />);
      expect(screen.getByRole("status")).toHaveTextContent("Loading…");
    });

    it("renders table variant skeletons", () => {
      const { container } = render(<ListSkeleton rows={4} variant="table" />);
      expect(screen.getByRole("status")).toHaveTextContent("Loading…");
      const skeletons = container.querySelectorAll(".h-11");
      expect(skeletons.length).toBe(4);
    });
  });
});
