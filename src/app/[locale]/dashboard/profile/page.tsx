"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Check } from "lucide-react";

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  bio: string;
  company: string;
  website: string;
  orgPhone: string;
}

export default function DashboardProfilePage() {
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<Omit<ProfileData, "email">>({
    name: "",
    phone: "",
    bio: "",
    company: "",
    website: "",
    orgPhone: "",
  });

  useEffect(() => {
    fetch("/api/dashboard/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: ProfileData | null) => {
        if (d) {
          setData(d);
          setForm({
            name: d.name,
            phone: d.phone,
            bio: d.bio,
            company: d.company,
            website: d.website,
            orgPhone: d.orgPhone,
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch("/api/dashboard/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  function handleChange(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-ink-muted" />
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-ink">プロフィール</h1>
      <p className="mt-1 text-sm text-ink-muted">
        あなたのアカウント情報と組織情報を管理します。
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 max-w-2xl">
        {/* Personal Info */}
        <Card>
          <h2 className="text-sm font-semibold text-ink mb-4">個人情報</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">
                メールアドレス
              </label>
              <input
                type="email"
                value={data?.email ?? ""}
                disabled
                className="w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-ink-muted cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-ink-muted">
                メールアドレスは変更できません。
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-1">
                お名前
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="山田 太郎"
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-1">
                電話番号
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="090-0000-0000"
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-1">
                自己紹介
              </label>
              <textarea
                value={form.bio}
                onChange={(e) => handleChange("bio", e.target.value)}
                placeholder="簡単な自己紹介を入力してください..."
                rows={3}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
            </div>
          </div>
        </Card>

        {/* Organization Info */}
        <Card>
          <h2 className="text-sm font-semibold text-ink mb-4">組織情報</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">
                会社名 / 屋号
              </label>
              <input
                type="text"
                value={form.company}
                onChange={(e) => handleChange("company", e.target.value)}
                placeholder="株式会社〇〇"
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-1">
                ウェブサイト
              </label>
              <input
                type="url"
                value={form.website}
                onChange={(e) => handleChange("website", e.target.value)}
                placeholder="https://example.com"
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-1">
                組織の電話番号
              </label>
              <input
                type="tel"
                value={form.orgPhone}
                onChange={(e) => handleChange("orgPhone", e.target.value)}
                placeholder="03-0000-0000"
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </Card>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            保存する
          </Button>
          {saved && (
            <span className="flex items-center gap-1 text-sm text-green-600">
              <Check className="h-4 w-4" />
              保存しました
            </span>
          )}
        </div>
      </form>
    </>
  );
}
