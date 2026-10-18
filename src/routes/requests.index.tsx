import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { EmptyState, ListSkeleton } from "@/components/feedback";
import { ResponsiveDataView, type Sort, type SortKey } from "@/components/responsive-data-view";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { requestsQuery } from "@/lib/mock-api";

export const Route = createFileRoute("/requests/")({
  head: () => ({
    meta: [
      { title: "Requests — Anumat" },
      {
        name: "description",
        content: "Browse every request by status, requester, amount and current approver.",
      },
      { property: "og:title", content: "Requests — Anumat" },
      { property: "og:description", content: "All requests, grouped by status." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Requests,
});

function Requests() {
  const { data, isPending, isError, refetch, isFetching } = useQuery(requestsQuery);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<Sort>({ key: "updatedRank", dir: "asc" });

  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    const list = (data ?? []).filter(
      (r) => !t || `${r.id} ${r.title} ${r.requester}`.toLowerCase().includes(t),
    );
    const m = sort.dir === "asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      const x = a[sort.key],
        y = b[sort.key];
      return (typeof x === "number" ? x - (y as number) : String(x).localeCompare(String(y))) * m;
    });
  }, [data, q, sort]);

  const onSort = (key: SortKey) =>
    setSort((s) => ({ key, dir: s.key === key && s.dir === "asc" ? "desc" : "asc" }));

  let body;
  if (isPending)
    body = (
      <>
        <ListSkeleton variant="table" rows={6} />
      </>
    );
  else if (isError)
    body = (
      <EmptyState
        variant="error"
        title="Requests didn't load"
        description="Check your connection, then try again."
        action={
          <Button
            variant="outline"
            className="h-11"
            disabled={isFetching}
            onClick={() => refetch()}
          >
            {isFetching ? "Retrying…" : "Retry"}
          </Button>
        }
      />
    );
  else if (data.length === 0)
    body = (
      <EmptyState
        title="No requests yet"
        description="When someone asks for an approval, it shows up here."
      />
    );
  else if (rows.length === 0)
    body = (
      <EmptyState
        variant="no-results"
        title="No matching requests"
        description={`Nothing matches “${q}”.`}
        action={
          <Button variant="outline" className="h-11" onClick={() => setQ("")}>
            Clear search
          </Button>
        }
      />
    );
  else body = <ResponsiveDataView rows={rows} sort={sort} onSort={onSort} />;

  return (
    <AppShell>
      <h1 className="font-display text-4xl font-semibold tracking-tight">Requests</h1>
      <div className="relative mt-6 max-w-md">
        <Search
          className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          aria-label="Search requests"
          placeholder="Search by ID, title or person"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="h-11 rounded-xl bg-card pl-9"
        />
      </div>
      <p className="mt-3 text-sm text-muted-foreground" role="status" aria-live="polite">
        {data ? `${rows.length} of ${data.length} requests` : "\u00a0"}
      </p>
      <div className="mt-4">{body}</div>
    </AppShell>
  );
}
