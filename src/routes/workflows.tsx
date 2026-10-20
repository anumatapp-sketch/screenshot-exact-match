import { createFileRoute } from "@tanstack/react-router";
import { AuthoringWorkspace, AuthoringError, AuthoringPending } from "@/components/authoring-workspace";
import { authoringQuery } from "@/lib/mock-api";

export const Route = createFileRoute("/workflows")({
  head: () => ({ meta: [
    { title: "Workflows — Anumat" },
    { name: "description", content: "Edit and test Anumat approval chains with mock request amounts." },
    { property: "og:title", content: "Workflows — Anumat" },
    { property: "og:description", content: "Configure approvers and preview conditional approval steps." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(authoringQuery),
  component: WorkflowsPage,
  pendingComponent: AuthoringPending,
  errorComponent: AuthoringError,
});
function WorkflowsPage() { return <AuthoringWorkspace mode="workflows" />; }