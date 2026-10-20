import { describe, expect, it } from "vitest";
import { PRESETS, cloneType, simulateRoute, validateType } from "@/lib/authoring";
import { authoringQuery, saveRequestType } from "@/lib/mock-api";

describe("Mock authoring", () => {
  it("includes Finance at the configured 1000 minimum, but skips it below", () => {
    const preset = PRESETS[0];
    if (!preset) throw new Error("Missing expense preset");
    expect(simulateRoute(preset.steps, 999).map(step => step.included)).toEqual([true, false]);
    expect(simulateRoute(preset.steps, 1000).map(step => step.included)).toEqual([true, true]);
  });
  it("requires a numeric Amount field for conditional steps", () => {
    const preset = PRESETS[0];
    if (!preset) throw new Error("Missing expense preset");
    const value = cloneType(preset);
    value.fields = value.fields.filter(field => field.type !== "number");
    expect(validateType(value)).toContain("Add a numeric Amount field for conditional approvals.");
    value.fields.push({ id: "amount", label: "Amount", type: "number" });
    expect(validateType(value)).toEqual([]);
  });
  it("isolates draft changes until explicitly saved and reads them back", async () => {
    const queryFn = authoringQuery.queryFn;
    if (!queryFn) throw new Error("Missing query function");
    const preset = PRESETS[0];
    if (!preset) throw new Error("Missing preset");
    const value = cloneType(preset);
    value.id = "test-draft";
    value.name = "Mock draft";
    value.status = "Draft";
    const saved = await saveRequestType(value);
    value.name = "Unsaved change";
    expect(saved.find(item => item.id === "test-draft")?.name).toBe("Mock draft");
    // The same API serves all three workspaces.
    const read = await queryFn({} as Parameters<typeof queryFn>[0]);
    expect(read.find(item => item.id === "test-draft")?.name).toBe("Mock draft");
  });
});