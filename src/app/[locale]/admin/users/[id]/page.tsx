"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AuditStatusBadge } from "@/components/dashboard/audit-status-badge";
import {
  ArrowLeft, Loader2, Mail, Phone, Globe,
  GitBranch, FileText, MessageSquare,
} from "lucide-react";

interface UserDetail {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  bio: string | null;
  createdAt: string;
  org: {
    id: string;
    name: string;
    website: string | null;
    phone: string | null;
    plan: string | null;
    status: string | null;
    currentPeriodEnd: string | null;
    repos: { id: string; name: string; url: string; stack: string }[];
    recentAudits: { id: string; status: string; date: string; findingsCount: number }[];
    messageCount: number;
  } | null;
}

const planVariant: Record<string, "pro" | "growth" | "starter"> = {
  PRO: "pro", GROWTH: "growth", STARTER: "starter",
};

export default function AdminUserDetailPage() {
  const params = useParams();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadSiteUrl, setUploadSiteUrl] = useState("");
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleUpload() {
    if (!user?.org?.id || !uploadFile) return;
    setUploadLoading(true);
    setUploadError(null);
    try {
      const form = new FormData();
      form.append("orgId", user.org.id);
      form.append("siteUrl", uploadSiteUrl);
      form.append("file", uploadFile);
      const res = await fetch("/api/admin/free-evals/upload", {
        method: "POST",
        body: form,
      });
      if (res.ok) {
        setUploadSuccess(true);
        setUploadFile(null);
        setUploadSiteUrl("");
        setTimeout(() => setUploadSuccess(false), 4000);
      } else {
        const body = await res.json().catch(() => ({}));
        setUploadError(body.error ?? `エラー (${res.status})`);
      }
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "ネットワークエラー");
    } finally {
      setUploadLoading(false);
    }
  }

  useEffect(() => {
    fetch(`/api/admin/users/${params.id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setUser)
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
      </div>
    );
  }

  if (!user) {
    return <p className="text-text-muted">User not found.</p>;
  }

  return (
    <>
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-navy-dark"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to users
      </Link>

      <div className="mt-4 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-navy-dark text-white text-xl font-bold">
          {(user.name ?? user.email)[0].toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-navy-dark">
            {user.name ?? user.email}
          </h1>
          <p className="text-sm text-text-muted">{user.org?.name ?? "No organization"}</p>
        </div>
        {user.org?.plan && (
          <Badge variant={planVariant[user.org.plan] ?? "default"}>
            {user.org.plan}
          </Badge>
        )}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {/* Contact info */}
        <Card>
          <h2 className="text-sm font-semibold text-navy-dark mb-3">Contact</h2>
          <div className="space-y-2 text-sm text-text-muted">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <a href={`mailto:${user.email}`} className="hover:text-gold">{user.email}</a>
            </div>
            {user.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />{user.phone}
              </div>
            )}
            {user.org?.website && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <a href={user.org.website} target="_blank" rel="noopener noreferrer" className="hover:text-gold">
                  {user.org.website}
                </a>
              </div>
            )}
          </div>
          {user.bio && (
            <p className="mt-3 text-sm text-text-body bg-bg-cream rounded p-2">{user.bio}</p>
          )}
          <p className="mt-3 text-xs text-text-muted">
            Joined {new Date(user.createdAt).toLocaleDateString("ja-JP")}
          </p>
        </Card>

        {/* Subscription */}
        <Card>
          <h2 className="text-sm font-semibold text-navy-dark mb-3">Subscription</h2>
          {user.org?.plan ? (
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">Plan</span>
                <span className="font-medium text-navy-dark">{user.org.plan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Status</span>
                <span className="font-medium text-navy-dark">{user.org.status}</span>
              </div>
              {user.org.currentPeriodEnd && (
                <div className="flex justify-between">
                  <span className="text-text-muted">Renews</span>
                  <span className="text-navy-dark">
                    {new Date(user.org.currentPeriodEnd).toLocaleDateString("ja-JP")}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-text-muted">No active subscription</p>
          )}
          <div className="mt-3 pt-3 border-t border-border flex gap-4 text-xs text-text-muted">
            <Link href="/admin/messages" className="flex items-center gap-1 hover:text-gold">
              <MessageSquare className="h-3.5 w-3.5" /> {user.org?.messageCount ?? 0} messages
            </Link>
          </div>
        </Card>
      </div>

      {/* Repos */}
      {user.org?.repos && user.org.repos.length > 0 && (
        <Card className="mt-4">
          <h2 className="text-sm font-semibold text-navy-dark mb-3">Repositories</h2>
          <div className="space-y-2">
            {user.org.repos.map((r) => (
              <div key={r.id} className="flex items-center gap-2 text-sm">
                <GitBranch className="h-4 w-4 text-text-muted" />
                <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-navy-light hover:text-gold">
                  {r.name}
                </a>
                <span className="text-xs text-text-muted">{r.stack}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent audits */}
      {user.org?.recentAudits && user.org.recentAudits.length > 0 && (
        <Card className="mt-4">
          <h2 className="text-sm font-semibold text-navy-dark mb-3">Recent Audits</h2>
          <div className="space-y-2">
            {user.org.recentAudits.map((a) => (
              <div key={a.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-text-muted" />
                  <span className="text-navy-dark">
                    {new Date(a.date).toLocaleDateString("ja-JP")}
                  </span>
                  <span className="text-xs text-text-muted">{a.findingsCount} findings</span>
                </div>
                <AuditStatusBadge status={a.status} />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Send Free Eval PDF */}
      {user.org && (
        <Card className="mt-4">
          <h2 className="text-sm font-semibold text-navy-dark mb-3">無料診断レポートを送信</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-text-muted mb-1">サイトURL（任意）</label>
              <input
                type="url"
                value={uploadSiteUrl}
                onChange={(e) => setUploadSiteUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-gold focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1">PDFファイル</label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                className="block text-sm text-text-muted file:mr-3 file:rounded file:border-0 file:bg-gold/10 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-navy-dark hover:file:bg-gold/20"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleUpload}
                disabled={!uploadFile || uploadLoading}
                className="rounded-lg bg-gold px-4 py-2 text-sm font-medium text-navy-dark hover:bg-gold/90 disabled:opacity-50 transition-colors"
              >
                {uploadLoading ? "送信中..." : "アップロード & 通知"}
              </button>
              {uploadSuccess && (
                <span className="text-sm text-green-600 flex items-center gap-1">
                  ✓ 送信しました
                </span>
              )}
              {uploadError && (
                <span className="text-sm text-red-600">
                  ✗ {uploadError}
                </span>
              )}
            </div>
          </div>
        </Card>
      )}
    </>
  );
}
