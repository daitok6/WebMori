"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AuditStatusBadge } from "@/components/dashboard/audit-status-badge";
import { DashboardError } from "@/components/dashboard/dashboard-error";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useDashboardData } from "@/lib/use-dashboard-data";
import {
  GitBranch,
  Plus,
  Trash2,
  ExternalLink,
  Loader2,
  Play,
  Check,
} from "lucide-react";

interface Repo {
  id: string;
  name: string;
  url: string;
  stack: string;
  isActive: boolean;
  lastAudit: {
    date: string;
    status: string;
    findingsCount: number;
  } | null;
}

const stackLabels: Record<string, string> = {
  SHOPIFY: "Shopify",
  WORDPRESS: "WordPress",
  NEXTJS: "Next.js",
  LINE_MINI_APP: "LINE Mini App",
  OTHER: "Other",
};

export default function ReposPage() {
  const t = useTranslations("dashboard.repos");
  const { data: repos, loading, error, retry, mutate } = useDashboardData<Repo[]>("/api/dashboard/repos");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", url: "", stack: "OTHER" });
  const [submitting, setSubmitting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [requestingId, setRequestingId] = useState<string | null>(null);
  const [requestedIds, setRequestedIds] = useState<Set<string>>(new Set());
  const tConfirm = useTranslations("dashboard.confirm");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name || !formData.url) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/dashboard/repos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setFormData({ name: "", url: "", stack: "OTHER" });
        setShowForm(false);
        retry();
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove(id: string) {
    setRemovingId(id);
    setConfirmDelete(null);
    try {
      const res = await fetch(`/api/dashboard/repos?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        mutate((prev) => prev?.filter((r) => r.id !== id) ?? null);
      }
    } finally {
      setRemovingId(null);
    }
  }

  async function handleRequestAudit(id: string) {
    setRequestingId(id);
    try {
      const res = await fetch("/api/dashboard/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: `監査リクエスト: リポジトリ ${repos?.find((r) => r.id === id)?.name ?? id}` }),
      });
      if (res.ok) {
        setRequestedIds((prev) => new Set(prev).add(id));
      }
    } finally {
      setRequestingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
      </div>
    );
  }

  if (error || !repos) return <DashboardError message={error ?? "Unknown error"} onRetry={retry} />;

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy-dark">{t("title")}</h1>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-1.5 h-4 w-4" />
          {t("addRepo")}
        </Button>
      </div>

      {/* Add repo form */}
      {showForm && (
        <Card className="mt-4">
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-navy-dark mb-1">
                {t("name")}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t("namePlaceholder")}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-dark mb-1">
                {t("url")}
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder={t("urlPlaceholder")}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-dark mb-1">
                {t("stack")}
              </label>
              <select
                value={formData.stack}
                onChange={(e) => setFormData({ ...formData, stack: e.target.value })}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
              >
                {Object.entries(stackLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" disabled={submitting}>
              {submitting ? t("adding") : t("add")}
            </Button>
          </form>
        </Card>
      )}

      {/* Repo list */}
      {repos.length === 0 ? (
        <Card className="mt-6 text-center py-12">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-bg-cream">
            <GitBranch className="h-7 w-7 text-text-muted" />
          </div>
          <p className="font-medium text-navy-dark">{t("noRepos")}</p>
          <p className="mt-1 text-sm text-text-muted">{t("noReposDesc")}</p>
        </Card>
      ) : (
        <div className="mt-6 space-y-4">
          {repos.map((repo) => (
            <Card key={repo.id}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <GitBranch className="h-4 w-4 text-text-muted" />
                    <h3 className="font-semibold text-navy-dark">{repo.name}</h3>
                    <Badge>{stackLabels[repo.stack] ?? repo.stack}</Badge>
                  </div>
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-xs text-text-muted hover:text-navy-light transition-colors"
                  >
                    {repo.url}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <div className="mt-2 text-xs text-text-muted">
                    {repo.lastAudit ? (
                      <span className="flex items-center gap-2">
                        {t("lastAudit")}:{" "}
                        {new Date(repo.lastAudit.date).toLocaleDateString("ja-JP")}
                        {" · "}
                        {t("findingsCount", { count: repo.lastAudit.findingsCount })}
                        <AuditStatusBadge status={repo.lastAudit.status} />
                      </span>
                    ) : (
                      t("noAudits")
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {/* Request audit button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRequestAudit(repo.id)}
                    disabled={requestingId === repo.id || requestedIds.has(repo.id)}
                    className="text-text-muted hover:text-gold"
                    title={t("requestAudit")}
                  >
                    {requestedIds.has(repo.id) ? (
                      <Check className="h-4 w-4 text-severity-good" />
                    ) : requestingId === repo.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  {/* Delete button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmDelete(repo.id)}
                    disabled={removingId === repo.id}
                    className="text-text-muted hover:text-severity-critical"
                  >
                    {removingId === repo.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Confirm delete dialog */}
      <ConfirmDialog
        open={!!confirmDelete}
        title={tConfirm("deleteRepo")}
        description={tConfirm("deleteRepoDesc")}
        confirmLabel={tConfirm("confirm")}
        cancelLabel={tConfirm("cancel")}
        variant="danger"
        onConfirm={() => confirmDelete && handleRemove(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </>
  );
}
