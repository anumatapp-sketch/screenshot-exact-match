import { describe, expect, it } from "vitest";
import { decisionCommentError } from "@/lib/requests";

describe("decision comment rules", () => {
  it("approve needs no comment", () => {
    expect(decisionCommentError("approve", "")).toBeNull();
  });
  it("reject requires a comment", () => {
    expect(decisionCommentError("reject", "  ")).not.toBeNull();
  });
  it("request changes requires at least 3 characters", () => {
    expect(decisionCommentError("changes", "ok")).not.toBeNull();
    expect(decisionCommentError("changes", "Add receipt")).toBeNull();
  });
});
