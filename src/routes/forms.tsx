import { createFileRoute } from "@tanstack/react-router";
import { AuthoringWorkspace, AuthoringError, AuthoringPending } from "@/components/authoring-workspace";
import { authoringQuery } from "@/lib/mock-api";

export const Route = createFileRoute("/forms")({
  head: () => ({ meta: [
    { title: "Forms — Anumat" },
    { name: "description", content: "Edit request form fields and preview Anumat forms." },
    { property: "og:title", content: "Forms — Anumat" },
    { property: "og:description", content: "Manage and preview the fields on request forms." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(authoringQuery),
  component: FormsPage,
  pendingComponent: AuthoringPending,
  errorComponent: AuthoringError,
});
function FormsPage() { return <AuthoringWorkspace mode="forms" />; }