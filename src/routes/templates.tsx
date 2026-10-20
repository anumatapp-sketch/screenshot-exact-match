import { createFileRoute } from "@tanstack/react-router";
import { AuthoringWorkspace, AuthoringError, AuthoringPending } from "@/components/authoring-workspace";
import { authoringQuery } from "@/lib/mock-api";

export const Route = createFileRoute("/templates")({
  head: () => ({ meta: [
    { title: "Request types — Anumat" },
    { name: "description", content: "Compose Anumat request types with forms and approval steps." },
    { property: "og:title", content: "Request types — Anumat" },
    { property: "og:description", content: "Compose request types, starting with expense, onboarding, and contract templates." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(authoringQuery),
  component: TemplatesPage,
  pendingComponent: AuthoringPending,
  errorComponent: AuthoringError,
});
function TemplatesPage() { return <AuthoringWorkspace mode="templates" />; }