import { Link } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/feedback";
import { STATUS_META, STATUS_ORDER, formatMoney, type Request } from "@/lib/requests";
import { cn } from "@/lib/utils";

export type SortKey = "id" | "title" | "amount" | "updatedRank";
export type Sort = { key: SortKey; dir: "asc" | "desc" };

const COLS: {
  key: keyof Request | "updatedRank";
  label: string;
  sortable?: boolean;
  right?: boolean;
}[] = [
  { key: "id", label: "ID", sortable: true },
  { key: "title", label: "Title", sortable: true },
  { key: "requester", label: "Requester" },
  { key: "amount", label: "Amount", sortable: true, right: true },
  { key: "approver", label: "Approver" },
  { key: "status", label: "Status" },
  { key: "updatedRank", label: "Updated", sortable: true },
];

export function ResponsiveDataView({
  rows,
  sort,
  onSort,
}: {
  rows: Request[];
  sort: Sort;
  onSort: (key: SortKey) => void;
}) {
  return (
    <>
      {/* Desktop (lg+): semantic table, sticky identity column */}
      <div className="hidden overflow-hidden rounded-2xl border bg-card shadow-card lg:block">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow className="hover:bg-transparent">
              {COLS.map((c) => {
                const active = sort.key === c.key;
                const ariaSort = !c.sortable
                  ? undefined
                  : active
                    ? sort.dir === "asc"
                      ? "ascending"
                      : "descending"
                    : "none";
                const Icon = !active ? ArrowUpDown : sort.dir === "asc" ? ArrowUp : ArrowDown;
                return (
                  <TableHead
                    key={c.key}
                    scope="col"
                    aria-sort={ariaSort}
                    className={cn(
                      "h-11 text-xs font-semibold uppercase tracking-wide",
                      c.right && "text-right",
                      c.key === "id" && "sticky left-0 bg-muted",
                    )}
                  >
                    {c.sortable ? (
                      <button
                        type="button"
                        onClick={() => onSort(c.key as SortKey)}
                        className={cn(
                          "inline-flex min-h-9 items-center gap-1 rounded hover:text-foreground",
                          c.right && "flex-row-reverse",
                        )}
                      >
                        {c.label}
                        <Icon className="size-3.5" aria-hidden />
                      </button>
                    ) : (
                      c.label
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="sticky left-0 bg-card text-muted-foreground">
                  {r.id}
                </TableCell>
                <TableCell className="font-medium">
                  <Link
                    to="/requests/$id"
                    params={{ id: r.id }}
                    className="inline-flex min-h-9 items-center hover:underline"
                  >
                    {r.title}
                  </Link>
                </TableCell>
                <TableCell>{r.requester}</TableCell>
                <TableCell className="text-right tabular-nums">{formatMoney(r.amount)}</TableCell>
                <TableCell>{r.approver}</TableCell>
                <TableCell>
                  <StatusBadge status={r.status} />
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {r.updated}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Compact (<lg): grouped by status, no horizontal scroll */}
      <div className="space-y-6 lg:hidden">
        {STATUS_ORDER.map((s) => {
          const group = rows.filter((r) => r.status === s);
          if (!group.length) return null;
          return (
            <section key={s} aria-labelledby={`grp-${s}`}>
              <h2 id={`grp-${s}`} className="mb-2 text-sm font-semibold">
                {STATUS_META[s].label}{" "}
                <span className="text-muted-foreground">({group.length})</span>
              </h2>
              <ul className="divide-y overflow-hidden rounded-2xl border bg-card">
                {group.map((r) => (
                  <li key={r.id}>
                    <Link
                      to="/requests/$id"
                      params={{ id: r.id }}
                      className="flex min-h-16 items-center gap-3 p-4 hover:bg-muted/60"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{r.title}</p>
                        <p className="truncate text-sm text-muted-foreground">
                          {r.id} · {formatMoney(r.amount)} · {r.updated}
                        </p>
                      </div>
                      <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </>
  );
}
