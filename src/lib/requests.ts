export type RequestStatus =
  "draft" | "submitted" | "in_review" | "approved" | "rejected" | "returned";
export type Tone = "success" | "warning" | "info" | "danger" | "neutral";

export const STATUS_META: Record<RequestStatus, { label: string; tone: Tone }> = {
  draft: { label: "Draft", tone: "neutral" },
  submitted: { label: "Submitted", tone: "info" },
  in_review: { label: "In review", tone: "warning" },
  approved: { label: "Approved", tone: "success" },
  rejected: { label: "Rejected", tone: "danger" },
  returned: { label: "Changes requested", tone: "warning" },
};

export const STATUS_ORDER: RequestStatus[] = [
  "in_review",
  "returned",
  "submitted",
  "draft",
  "approved",
  "rejected",
];

export type ApprovalStep = {
  name: string;
  role: string;
  state: "done" | "current" | "waiting" | "rejected";
  at?: string;
};

export type Request = {
  id: string;
  title: string;
  type: string;
  requester: string;
  amount: number;
  currency: string;
  approver: string;
  status: RequestStatus;
  updated: string;
  updatedRank: number;
  dueInHours?: number;
  needsMe?: boolean;
  summary: string;
  lines: { item: string; qty: number; price: number }[];
  chain: ApprovalStep[];
  activity?: ActivityEntry[];
};

// Demo data only.
export const REQUESTS: Request[] = [
  {
    id: "RQ-1042",
    title: "Laptops for new finance hires",
    type: "Purchase",
    requester: "Sokha Chan",
    amount: 4200,
    currency: "USD",
    approver: "You",
    status: "in_review",
    updated: "2h ago",
    updatedRank: 1,
    dueInHours: -3,
    needsMe: true,
    summary: "Three laptops for the finance team starting next month.",
    lines: [
      { item: 'Laptop 14"', qty: 3, price: 1250 },
      { item: "Docking station", qty: 3, price: 150 },
    ],
    chain: [
      { name: "Sokha Chan", role: "Requester", state: "done", at: "Oct 16, 09:12" },
      { name: "Dara Kim", role: "Team lead", state: "done", at: "Oct 17, 14:40" },
      { name: "You", role: "Finance", state: "current" },
      { name: "Vanna Sok", role: "CFO", state: "waiting" },
    ],
  },
  {
    id: "RQ-1039",
    title: "Office rent — November",
    type: "Payment",
    requester: "Rithy Ly",
    amount: 2800,
    currency: "USD",
    approver: "You",
    status: "in_review",
    updated: "5h ago",
    updatedRank: 2,
    dueInHours: 20,
    needsMe: true,
    summary: "Monthly rent for the Phnom Penh office.",
    lines: [{ item: "Rent, November", qty: 1, price: 2800 }],
    chain: [
      { name: "Rithy Ly", role: "Requester", state: "done", at: "Oct 18, 08:00" },
      { name: "You", role: "Finance", state: "current" },
    ],
  },
  {
    id: "RQ-1035",
    title: "Marketing event booth",
    type: "Purchase",
    requester: "You",
    amount: 1500,
    currency: "USD",
    approver: "You",
    status: "returned",
    updated: "1d ago",
    updatedRank: 3,
    summary: "Booth rental for the November trade fair. Returned: please attach a quote.",
    lines: [
      { item: "Booth rental", qty: 1, price: 1200 },
      { item: "Printed banners", qty: 2, price: 150 },
    ],
    chain: [
      { name: "You", role: "Requester", state: "done", at: "Oct 15, 10:00" },
      { name: "Dara Kim", role: "Team lead", state: "rejected", at: "Oct 17, 11:20" },
    ],
  },
  {
    id: "RQ-1031",
    title: "Software subscriptions renewal",
    type: "Purchase",
    requester: "Mony Heng",
    amount: 960,
    currency: "USD",
    approver: "Vanna Sok",
    status: "submitted",
    updated: "2d ago",
    updatedRank: 4,
    summary: "Annual renewal of design tools.",
    lines: [{ item: "Design tool seat", qty: 8, price: 120 }],
    chain: [
      { name: "Mony Heng", role: "Requester", state: "done", at: "Oct 16, 16:05" },
      { name: "Vanna Sok", role: "CFO", state: "current" },
    ],
  },
  {
    id: "RQ-1028",
    title: "Team offsite transport",
    type: "Expense",
    requester: "Dara Kim",
    amount: 640,
    currency: "USD",
    approver: "—",
    status: "approved",
    updated: "3d ago",
    updatedRank: 5,
    summary: "Bus rental for the Kampot offsite.",
    lines: [{ item: "Bus, 2 days", qty: 1, price: 640 }],
    chain: [
      { name: "Dara Kim", role: "Requester", state: "done", at: "Oct 12, 09:00" },
      { name: "Vanna Sok", role: "CFO", state: "done", at: "Oct 14, 13:30" },
    ],
  },
  {
    id: "RQ-1024",
    title: "Standing desks",
    type: "Purchase",
    requester: "Sokha Chan",
    amount: 3100,
    currency: "USD",
    approver: "—",
    status: "rejected",
    updated: "5d ago",
    updatedRank: 6,
    summary: "Ten standing desks for the open office.",
    lines: [{ item: "Standing desk", qty: 10, price: 310 }],
    chain: [
      { name: "Sokha Chan", role: "Requester", state: "done", at: "Oct 10, 11:00" },
      { name: "Vanna Sok", role: "CFO", state: "rejected", at: "Oct 13, 15:10" },
    ],
  },
  {
    id: "RQ-1020",
    title: "Printer toner",
    type: "Purchase",
    requester: "You",
    amount: 180,
    currency: "USD",
    approver: "—",
    status: "draft",
    updated: "6d ago",
    updatedRank: 7,
    summary: "Toner for the second-floor printer.",
    lines: [{ item: "Toner cartridge", qty: 2, price: 90 }],
    chain: [{ name: "You", role: "Requester", state: "waiting" }],
  },
];

export const formatMoney = (n: number, c = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: c,
    maximumFractionDigits: 0,
  }).format(n);

export const getRequest = (id: string) => REQUESTS.find((r) => r.id === id);

export type Decision = "approve" | "reject" | "changes";
export type ActivityEntry = { who: string; text: string; at: string };

/** Approve: comment optional. Reject / request changes: comment required, at least 3 characters. */
export function decisionCommentError(decision: Decision, comment: string): string | null {
  if (decision === "approve") return null;
  const c = comment.trim();
  if (!c) return "Please add a comment so the requester knows what to fix.";
  if (c.length < 3) return "Comment must be at least 3 characters.";
  return null;
}
