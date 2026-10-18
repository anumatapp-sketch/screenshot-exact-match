// Mock data layer. Swap these functions for real API calls later; UI only depends on their shapes.
import { queryOptions } from "@tanstack/react-query";
import { REQUESTS, type Request, type RequestStatus } from "./requests";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const db: Request[] = REQUESTS.map((r) => ({ ...r, chain: r.chain.map((s) => ({ ...s })) }));

/** Add ?fail=1 to any URL to preview the error state. */
const shouldFail = () =>
  typeof window !== "undefined" && new URLSearchParams(window.location.search).has("fail");

export async function fetchRequests(): Promise<Request[]> {
  await wait(600);
  if (shouldFail()) throw new Error("Mock network error");
  return db.map((r) => ({ ...r }));
}

export async function fetchRequest(id: string): Promise<Request | null> {
  await wait(300);
  return db.find((r) => r.id === id) ?? null;
}

export async function decideRequest(id: string, decision: "approve" | "reject", reason?: string) {
  await wait(700);
  const r = db.find((x) => x.id === id);
  if (!r) throw new Error("Not found");
  const status: RequestStatus = decision === "approve" ? "approved" : "rejected";
  r.status = status;
  r.needsMe = false;
  r.updated = "just now";
  const step = r.chain.find((s) => s.state === "current");
  if (step) {
    step.state = decision === "approve" ? "done" : "rejected";
    step.at = "Just now";
  }
  if (reason) r.summary = `${r.summary} Rejection reason: ${reason}`;
  return r;
}

export type Profile = { name: string; email: string; digest: "instant" | "daily" };
let profile: Profile = { name: "Chanthy Pich", email: "chanthy@anumat.example", digest: "instant" };

export async function fetchProfile() {
  await wait(300);
  return { ...profile };
}
export async function saveProfile(p: Profile) {
  await wait(800);
  profile = { ...p };
  return profile;
}

export const requestsQuery = queryOptions({
  queryKey: ["requests"],
  queryFn: fetchRequests,
  retry: false,
});
export const requestQuery = (id: string) =>
  queryOptions({ queryKey: ["requests", id], queryFn: () => fetchRequest(id) });
export const profileQuery = queryOptions({ queryKey: ["profile"], queryFn: fetchProfile });
