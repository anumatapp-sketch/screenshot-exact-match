import { describe, expect, it, vi } from "vitest";
import { confirmDiscard } from "@/hooks/use-unsaved-changes-guard";

describe("Unsaved changes guard (T-FORM-03, G-09)", () => {
  it("confirmDiscard allows proceeding without prompt when not dirty", () => {
    const confirmSpy = vi.spyOn(window, "confirm");
    const allowed = confirmDiscard(false);
    expect(allowed).toBe(true);
    expect(confirmSpy).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  it("confirmDiscard prompts user when dirty and respects acceptance", () => {
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    const allowed = confirmDiscard(true);
    expect(confirmSpy).toHaveBeenCalledWith("Discard what you typed?");
    expect(allowed).toBe(true);
    confirmSpy.mockRestore();
  });

  it("confirmDiscard prompts user when dirty and respects cancellation", () => {
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);
    const allowed = confirmDiscard(true);
    expect(confirmSpy).toHaveBeenCalledWith("Discard what you typed?");
    expect(allowed).toBe(false);
    confirmSpy.mockRestore();
  });
});
