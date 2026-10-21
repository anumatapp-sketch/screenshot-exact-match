// Mock data layer. Swap these functions for real API calls later; UI only depends on their shapes.
import { queryOptions } from "@tanstack/react-query";
import { REQUESTS, type Decision, type Request, type RequestStatus } from "./requests";
import { PRESETS, cloneType, simulateRoute, type RequestType } from "./authoring";

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

export async function decideRequest(id: string, decision: Decision, comment?: string) {
  await wait(700);
  const r = db.find((x) => x.id === id);
  if (!r) throw new Error("Not found");
  const status: RequestStatus =
    decision === "approve" ? "approved" : decision === "reject" ? "rejected" : "returned";
  r.status = status;
  r.needsMe = false;
  r.updated = "just now";
  const step = r.chain.find((s) => s.state === "current");
  if (step) {
    step.state = decision === "approve" ? "done" : decision === "reject" ? "rejected" : "waiting";
    step.at = decision === "changes" ? undefined : "Just now";
  }
  const verb = { approve: "Approved", reject: "Rejected", changes: "Asked for changes" }[decision];
  r.activity = [
    ...(r.activity ?? []),
    { who: "You", text: comment ? `${verb}: “${comment}”` : verb, at: "Just now" },
  ];
  return r;
}

/** Demo-only: creates an in-memory request from a request type. */
export async function createRequest(input: {
  type: RequestType;
  title: string;
  amount: number;
  values: Record<string, string>;
}) {
  await wait(600);
  if (shouldFail()) throw new Error("Mock network error");
  const steps = simulateRoute(input.type.steps, input.amount).filter((s) => s.included);
  const id = `RQ-${1100 + db.length}`;
  const req: Request = {
    id,
    title: input.title,
    type: input.type.name,
    requester: "You",
    amount: input.amount,
    currency: "USD",
    approver: steps[0]?.assignee ?? "—",
    status: "in_review",
    updated: "just now",
    updatedRank: 0,
    summary: Object.entries(input.values)
      .filter(([, v]) => v.trim())
      .map(([k, v]) => `${k}: ${v}`)
      .join(" · ") || input.title,
    lines: input.amount ? [{ item: input.title, qty: 1, price: input.amount }] : [],
    chain: [
      { name: "You", role: "Requester", state: "done", at: "Just now" },
      ...steps.map((s, i) => ({
        name: s.assignee,
        role: s.name,
        state: (i === 0 ? "current" : "waiting") as "current" | "waiting",
      })),
    ],
    activity: [{ who: "You", text: "Submitted the request", at: "Just now" }],
  };
  db.unshift(req);
  return req;
}

export type Profile = { name: string; email: string; digest: "instant" | "daily" };
let profile: Profile = { name: "Chanthy Pich", email: "chanthy@anumat.example", digest: "instant" };

export async function fetchProfile() {
  await wait(300);
  if (shouldFail()) throw new Error("Mock network error");
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
export const profileQuery = queryOptions({ queryKey: ["profile"], queryFn: fetchProfile, retry: false });

let requestTypes = PRESETS.map(cloneType);
export const authoringQuery = queryOptions({
  queryKey: ["request-types"],
  queryFn: async () => {
    await wait(300);
    if (shouldFail()) throw new Error("Mock network error");
    return requestTypes.map(cloneType);
  },
  retry: false,
});
export async function saveRequestType(value: RequestType) {
  await wait(400);
  if (shouldFail()) throw new Error("Mock network error");
  const copy = cloneType(value);
  requestTypes = requestTypes.some(item => item.id === copy.id)
    ? requestTypes.map(item => item.id === copy.id ? copy : item)
    : [...requestTypes, copy];
  return requestTypes.map(cloneType);
}
