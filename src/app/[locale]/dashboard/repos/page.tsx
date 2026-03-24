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
  Globe,
  Plus,
  Trash2,
  ExternalLink,
  Loader2,
  Play,
  Check,
  AlertTriangle,
} from "lucide-react";

interface Repo {
  id: string;
  name: string;
  url: string;
  stack: string;
  isActive: boolean;
  isRepoless: boolean;
  lastAudit: {
    date: string;
    status: string;
    findingsCount: number;
  } | null;
}

interface Limits {
  maxRepos: number;
  activeRepos: number;
  repoChangesUsed: number;
  repoChangesAllowed: number;
  changesRemaining: number;
  locked: boolean;
}

interface ReposResponse {
  repos: Repo[];
  limits: Limits;
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
  const { data, loading, error, retry, mutate } = useDashboardData<ReposResponse>("/api/dashboard/repos");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", url: "", stack: "OTHER" });
  const [submitting, setSubmitting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [requestingId, setRequestingId] = useState<string | null>(null);
  const [requestedIds, setRequestedIds] = useState<Set<string>>(new Set());
  const tConfirm = useTranslations("dashboard.confirm");

  const repos = data?.repos ?? [];
  const limits = data?.limits;

  const canAddRepo = limits ? limits.activeRepos < limits.maxRepos && !limits.locked : false;
  const canRemoveRepo = limits ? !limits.locked : false;

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
        retry();
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
        <Loader2 className="h-6 w-6 animate-spin text-ink-muted" />
      </div>
    );
  }

  if (error || !data) return <DashboardError message={error ?? "Unknown error"} onRetry={retry} />;

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">{t("title")}</h1>
          {limits && (
            <div className="mt-1 flex items-center gap-3 text-sm text-ink-muted">
              <span>{t("repoCount", { active: limits.activeRepos, max: limits.maxRepos })}</span>
              <span className="text-border">|</span>
              <span>{t("changesUsed", { used: limits.repoChangesUsed, allowed: limits.repoChangesAllowed })}</span>
            </div>
          )}
        </div>
        {canAddRepo && (
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus className="mr-1.5 h-4 w-4" />
            {t("addRepo")}
          </Button>
        )}
      </div>

      {/* Locked banner */}
      {limits?.locked && (
        <Card className="mt-4 border-amber-200 bg-amber-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="text-sm text-amber-800">{t("changesLocked")}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Add repo form */}
      {showForm && (
        <Card className="mt-4">
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">
                {t("name")}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t("namePlaceholder")}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">
                {t("url")}
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder={t("urlPlaceholder")}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">
                {t("stack")}
              </label>
              <select
                value={formData.stack}
                onChange={(e) => setFormData({ ...formData, stack: e.target.value })}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
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
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface-raised">
            <GitBranch className="h-7 w-7 text-ink-muted" />
          </div>
          <p className="font-medium text-ink">{t("noRepos")}</p>
          <p className="mt-1 text-sm text-ink-muted">{t("noReposDesc")}</p>
        </Card>
      ) : (
        <div className="mt-6 space-y-4">
          {repos.map((repo) => (
            <Card key={repo.id}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    {repo.isRepoless ? (
                      <Globe className="h-4 w-4 text-ink-muted" />
                    ) : (
                      <GitBranch className="h-4 w-4 text-ink-muted" />
                    )}
                    <h3 className="font-semibold text-ink">{repo.name}</h3>
                    <Badge>{stackLabels[repo.stack] ?? repo.stack}</Badge>
                    {repo.isRepoless && (
                      <Badge className="border border-border bg-white text-ink-muted">{t("surfaceOnly")}</Badge>
                    )}
                  </div>
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-xs text-ink-muted hover:text-ink-muted transition-colors"
                  >
                    {repo.url}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <div className="mt-2 text-xs text-ink-muted">
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
                    className="text-ink-muted hover:text-primary"
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
                  {canRemoveRepo && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setConfirmDelete(repo.id)}
                      disabled={removingId === repo.id}
                      className="text-ink-muted hover:text-severity-critical"
                    >
                      {removingId === repo.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  )}
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
