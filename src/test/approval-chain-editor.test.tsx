import { useState } from "react";
import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ApprovalChainEditor } from "@/components/approval-chain-editor";
import { PRESETS, type ApprovalStep } from "@/lib/authoring";

afterEach(cleanup);
function Editor() {
  const [steps, setSteps] = useState<ApprovalStep[]>(structuredClone(PRESETS[0]?.steps ?? []));
  return <ApprovalChainEditor steps={steps} onChange={setSteps} />;
}
describe("Approval chain editing", () => {
  it("updates a selected approver and duplicates the configured step", () => {
    render(<Editor />);
    fireEvent.click(screen.getByRole("button", { name: /Manager approval Department manager/ }));
    fireEvent.change(screen.getByLabelText("Approver"), { target: { value: "Test manager" } });
    fireEvent.click(screen.getByRole("button", { name: "Duplicate step" }));
    expect(screen.getAllByText("Test manager")).toHaveLength(2);
    fireEvent.click(screen.getByRole("button", { name: "Delete step" }));
    expect(screen.getAllByText("Test manager")).toHaveLength(1);
  });
  it("reorders steps and tests the resulting conditional route", () => {
    render(<Editor />);
    fireEvent.click(screen.getByRole("button", { name: "Move Finance review up" }));
    const buttons = screen.getAllByRole("button", { name: /approval Department manager|review Finance team/ });
    expect(buttons[0]?.textContent).toContain("Finance review");
    fireEvent.click(screen.getByRole("button", { name: "Test the route" }));
    expect(screen.getAllByText("Skipped")).toHaveLength(1);
    expect(screen.getAllByText("Included in route")).toHaveLength(1);
  });
});