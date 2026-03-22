"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Check, Clock, CheckCircle2, Send } from "lucide-react";

interface ExistingRequest {
  id: string;
  status: "PENDING" | "REVIEWING" | "COMPLETED" | "REJECTED";
  url: string | null;
  createdAt: string;
}

interface ProfileData {
  name: string;
  email: string;
  website: string;
}

const STACK_OPTIONS = [
  { value: "", label: "選択してください（任意）" },
  { value: "NEXTJS", label: "Next.js / React" },
  { value: "SHOPIFY", label: "Shopify" },
  { value: "WORDPRESS", label: "WordPress" },
  { value: "LINE_MINI_APP", label: "LINE ミニアプリ" },
  { value: "OTHER", label: "その他" },
];

export default function FreeEvalPage() {
  const [existing, setExisting] = useState<ExistingRequest | null | undefined>(undefined);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [form, setForm] = useState({ name: "", website: "", stack: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/dashboard/free-eval").then((r) => r.json()),
      fetch("/api/dashboard/profile").then((r) => (r.ok ? r.json() : null)),
    ]).then(([evalData, profileData]) => {
      setExisting(evalData ?? null);
      if (profileData) {
        setProfile(profileData);
        setForm((f) => ({
          ...f,
          name: profileData.name || "",
          website: profileData.website || "",
        }));
      }
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/dashboard/free-eval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const data = await res.json();
        setExisting(data);
        setSubmitted(true);
      } else {
        const body = await res.json().catch(() => ({}));
        if (body.error === "already_submitted") {
          setError("すでに申し込み済みです。審査が完了するまでお待ちください。");
        } else {
          setError(body.error ?? "送信に失敗しました。もう一度お試しください。");
        }
      }
    } finally {
      setSubmitting(false);
    }
  }

  // Loading
  if (existing === undefined) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-ink-muted" />
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-ink">無料診断を申し込む</h1>
      <p className="mt-1 text-sm text-ink-muted">
        サイトのセキュリティ・パフォーマンスを無料で診断します。結果はPDFレポートでお届けします。
      </p>

      {/* Already submitted */}
      {existing && !submitted && (
        <Card className="mt-6 border-l-4 border-l-primary">
          {existing.status === "COMPLETED" ? (
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-ink">診断が完了しました</p>
                <p className="mt-0.5 text-sm text-ink-muted">
                  レポートは「レポート」ページからダウンロードできます。
                </p>
                {existing.url && (
                  <p className="mt-1 text-xs text-ink-muted">対象サイト: {existing.url}</p>
                )}
              </div>
            </div>
          ) : existing.status === "REJECTED" ? (
            <div className="flex items-start gap-3">
              <div>
                <p className="font-semibold text-ink">申し込みを受け付けられませんでした</p>
                <p className="mt-0.5 text-sm text-ink-muted">
                  詳細についてはメッセージよりお問い合わせください。
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-ink">
                  {existing.status === "REVIEWING" ? "診断中です" : "申し込みを受け付けました"}
                </p>
                <p className="mt-0.5 text-sm text-ink-muted">
                  {existing.status === "REVIEWING"
                    ? "現在サイトの診断を進めています。完了次第レポートをお送りします。"
                    : "順番が来次第、診断を開始します。しばらくお待ちください。"}
                </p>
                {existing.url && (
                  <p className="mt-1 text-xs text-ink-muted">対象サイト: {existing.url}</p>
                )}
                <p className="mt-1 text-xs text-ink-muted">
                  申し込み日: {new Date(existing.createdAt).toLocaleDateString("ja-JP")}
                </p>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Success message after submit */}
      {submitted && (
        <Card className="mt-6 border-l-4 border-l-green-500">
          <div className="flex items-start gap-3">
            <Check className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-ink">申し込みを受け付けました！</p>
              <p className="mt-0.5 text-sm text-ink-muted">
                診断が完了しましたらメールとレポートページにてお知らせします。
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Form — only show if no active/completed request */}
      {!existing && !submitted && (
        <form onSubmit={handleSubmit} className="mt-6 max-w-2xl space-y-4">
          <Card>
            <h2 className="text-sm font-semibold text-ink mb-4">申し込み情報</h2>
            <div className="space-y-4">

              {/* Email — read-only */}
              <div>
                <label className="block text-sm font-medium text-ink mb-1">
                  メールアドレス
                </label>
                <input
                  type="email"
                  value={profile?.email ?? ""}
                  disabled
                  className="w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-ink-muted cursor-not-allowed"
                />
              </div>

              {/* Name — required */}
              <div>
                <label className="block text-sm font-medium text-ink mb-1">
                  お名前 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  placeholder="山田 太郎"
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Website — required */}
              <div>
                <label className="block text-sm font-medium text-ink mb-1">
                  診断を希望するサイトURL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={form.website}
                  onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                  required
                  placeholder="https://example.com"
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Stack — optional */}
              <div>
                <label className="block text-sm font-medium text-ink mb-1">
                  使用技術 <span className="text-xs text-ink-muted font-normal">（任意）</span>
                </label>
                <select
                  value={form.stack}
                  onChange={(e) => setForm((f) => ({ ...f, stack: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
                >
                  {STACK_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              {/* Message — optional */}
              <div>
                <label className="block text-sm font-medium text-ink mb-1">
                  気になっていること <span className="text-xs text-ink-muted font-normal">（任意）</span>
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  placeholder="サイトについて気になっていることがあれば教えてください..."
                  rows={3}
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>
            </div>
          </Card>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            診断を申し込む
          </Button>
        </form>
      )}
    </>
  );
}
