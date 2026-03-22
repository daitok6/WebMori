"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { Loader2, Search, User, GitBranch, FileText, MessageSquare } from "lucide-react";

interface UserSummary {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  createdAt: string;
  org: {
    id: string;
    name: string;
    plan: string | null;
    status: string | null;
    repoCount: number;
    auditCount: number;
    stacks: string[];
  } | null;
}

const planVariant: Record<string, "pro" | "growth" | "starter" | "default"> = {
  PRO: "pro", GROWTH: "growth", STARTER: "starter",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (planFilter !== "ALL") params.set("plan", planFilter);
    params.set("page", String(page));

    const timeout = setTimeout(() => {
      setLoading(true);
      fetch(`/api/admin/users?${params}`)
        .then((r) => (r.ok ? r.json() : { users: [], page: 1, totalPages: 1, total: 0 }))
        .then((data) => {
          setUsers(data.users ?? data);
          setTotalPages(data.totalPages ?? 1);
          setTotal(data.total ?? data.users?.length ?? 0);
        })
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timeout);
  }, [search, planFilter, page]);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [search, planFilter]);

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">Users</h1>
        <span className="text-sm text-ink-muted">{total} users</span>
      </div>

      {/* Filters */}
      <div className="mt-4 flex gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full rounded-lg border border-border bg-white pl-9 pr-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          className="rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
        >
          <option value="ALL">All Plans</option>
          <option value="STARTER">Starter</option>
          <option value="GROWTH">Growth</option>
          <option value="PRO">Pro</option>
        </select>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-ink-muted" />
        </div>
      ) : users.length === 0 ? (
        <Card className="mt-6 py-12 text-center">
          <User className="mx-auto mb-3 h-8 w-8 text-ink-muted" />
          <p className="text-ink-muted">No users found</p>
        </Card>
      ) : (
        <div className="mt-6 space-y-3">
          {users.map((u) => (
            <div key={u.id} className="relative">
            <Link href={`/admin/users/${u.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer pr-12">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-900/10 text-ink font-semibold text-sm">
                      {(u.name ?? u.email)[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-ink truncate">
                        {u.name ?? "—"}
                      </p>
                      <p className="text-xs text-ink-muted truncate">{u.email}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-sm text-ink-muted pl-13 sm:pl-0">
                    {u.org?.plan ? (
                      <Badge variant={planVariant[u.org.plan] ?? "default"}>
                        {u.org.plan}
                      </Badge>
                    ) : (
                      <span className="text-xs text-ink-muted">No plan</span>
                    )}
                    <span className="flex items-center gap-1">
                      <GitBranch className="h-3.5 w-3.5" />
                      {u.org?.repoCount ?? 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5" />
                      {u.org?.auditCount ?? 0}
                    </span>
                    <span className="text-xs">
                      {new Date(u.createdAt).toLocaleDateString("ja-JP")}
                    </span>
                  </div>
                </div>

                {u.org && (
                  <div className="mt-2 ml-13 pl-13">
                    <p className="text-xs text-ink-muted ml-[52px]">
                      {u.org.name}
                      {u.org.stacks.length > 0 && (
                        <> · {u.org.stacks.join(", ")}</>
                      )}
                    </p>
                  </div>
                )}
              </Card>
            </Link>
            {u.org && (
              <Link
                href={`/admin/messages?orgId=${u.org.id}`}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-raised hover:text-ink transition-colors"
                title="Open chat"
                onClick={(e) => e.stopPropagation()}
              >
                <MessageSquare className="h-4 w-4" />
              </Link>
            )}
            </div>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </>
  );
}
