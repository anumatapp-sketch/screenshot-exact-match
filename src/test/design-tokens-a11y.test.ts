import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Design System & A11y Tokens (A-02, A-08, G-11)", () => {
  const css = readFileSync(resolve(__dirname, "../styles.css"), "utf-8");

  it("contains high-contrast focus ring definitions for :focus-visible (A-02)", () => {
    expect(css).toContain(":focus-visible");
    expect(css).toContain("outline: 2px solid var(--ring)");
    expect(css).toContain("outline-offset: 2px");
  });

  it("contains prefers-reduced-motion media query fallback (A-08)", () => {
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toContain("animation-duration: 0.01ms !important");
    expect(css).toContain("transition-duration: 0.01ms !important");
  });

  it("defines all semantic status color tokens in :root and .dark (G-11)", () => {
    const statuses = ["success", "warning", "info", "danger", "neutral"];
    for (const s of statuses) {
      expect(css).toContain(`--status-${s}:`);
      expect(css).toContain(`--status-${s}-soft:`);
    }

    // Ensure dark mode overrides exist
    const darkIndex = css.indexOf(".dark {");
    expect(darkIndex).toBeGreaterThan(0);
    const darkSlice = css.slice(darkIndex);

    for (const s of statuses) {
      expect(darkSlice).toContain(`--status-${s}:`);
      expect(darkSlice).toContain(`--status-${s}-soft:`);
    }
  });

  it("applies the canonical Anumat web theme (Clarity) tokens", () => {
    // Light mode primary corresponds to #304bef (cobalt action)
    expect(css).toContain("--primary: oklch(0.511 0.244 268.1);");
    expect(css).toContain("--primary-soft: oklch(0.96 0.019 276.3);");
    expect(css).toContain("--ring: oklch(0.511 0.244 268.1);");

    // Dark mode primary corresponds to #a4b2ff
    const darkSlice = css.slice(css.indexOf(".dark {"));
    expect(darkSlice).toContain("--primary: oklch(0.782 0.111 275.6);");
    expect(darkSlice).toContain("--primary-soft: oklch(0.328 0.061 268.9);");
    expect(darkSlice).toContain("--ring: oklch(0.835 0.082 276.1);");
  });
});
