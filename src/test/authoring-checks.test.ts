import { describe, expect, it } from "vitest";
import { PRESETS, cloneType } from "@/lib/authoring";
import { authoringIssues, boundaryAmounts, decisionPreview, routeIds } from "@/lib/authoring-checks";

function expense() {
  const preset = PRESETS[0];
  if (!preset) throw new Error("Missing expense preset");
  return cloneType(preset);
}
describe("Draft route checks", () => {
  it("checks both sides of an inclusive 1000 amount rule", () => {
    const value = expense();
    expect(boundaryAmounts(value.steps)).toEqual([999.99, 1000]);
    expect(routeIds(value.steps, 999.99)).toEqual(["manager"]);
    expect(routeIds(value.steps, 1000)).toEqual(["manager", "finance"]);
  });
  it("uses an unsaved threshold change rather than the preset", () => {
    const value = expense();
    const step = value.steps[1];
    if (!step) throw new Error("Missing Finance step");
    step.threshold = 2000;
    expect(boundaryAmounts(value.steps)).toEqual([1999.99, 2000]);
    expect(routeIds(value.steps, 1500)).toEqual(["manager"]);
    expect(routeIds(PRESETS[0]?.steps ?? [], 1500)).toEqual(["manager", "finance"]);
  });
  it("targets a missing approver by step identity", () => {
    const value = expense();
    const step = value.steps[1];
    if (!step) throw new Error("Missing Finance step");
    step.assignee = "";
    expect(authoringIssues(value).find(issue => issue.code === "approver")).toMatchObject({ stepId: "finance", target: "step-approver" });
  });
  it("requires a numeric Amount for amount routing", () => {
    const value = expense();
    value.fields = value.fields.filter(field => field.type !== "number");
    expect(authoringIssues(value).map(issue => issue.code)).toContain("amount-field");
    value.fields.push({ id: "new-amount", label: "Amount", type: "number" });
    expect(authoringIssues(value)).toEqual([]);
  });
  it("does not claim both outcomes for a zero minimum", () => {
    expect(boundaryAmounts([{ id: "zero", name: "Owner", assignee: "Owner", threshold: 0 }])).toEqual([0]);
  });
  it("previews rejection as ending the request", () => {
    expect(decisionPreview("reject")).toBe("The request ends as Rejected. Later approvers do not review it.");
  });
  it("previews requested changes as returning and restarting review", () => {
    expect(decisionPreview("changes")).toBe("The request returns to the requester for changes. Review restarts when they resubmit.");
  });
});