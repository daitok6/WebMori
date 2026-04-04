"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Globe, Bell, Check, Loader2, MessageCircle, Copy, RefreshCw, Unlink } from "lucide-react";

// ─── LINE card state ──────────────────────────────────────

interface LineLinkStatus {
  linked: boolean;
  notifications: boolean;
  activeToken: string | null;
  tokenExpiry: string | null;
}

function LineLinkCard() {
  const t = useTranslations("dashboard.settings");
  const [status, setStatus] = useState<LineLinkStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [copied, setCopied] = useState(false);

  const lineFriendUrl = process.env.NEXT_PUBLIC_LINE_FRIEND_URL ?? "";

  const fetchStatus = useCallback(async () => {
    const res = await fetch("/api/dashboard/line-link").catch(() => null);
    if (res?.ok) {
      const data = await res.json() as LineLinkStatus;
      setStatus(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => { void fetchStatus(); }, [fetchStatus]);

  async function generateToken() {
    setGenerating(true);
    const res = await fetch("/api/dashboard/line-link", { method: "POST" }).catch(() => null);
    if (res?.ok) await fetchStatus();
    setGenerating(false);
  }

  async function disconnect() {
    setDisconnecting(true);
    await fetch("/api/dashboard/line-link", { method: "DELETE" }).catch(() => null);
    await fetchStatus();
    setDisconnecting(false);
  }

  async function toggleNotifications(enabled: boolean) {
    await fetch("/api/dashboard/line-link", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notifications: enabled }),
    }).catch(() => null);
    setStatus((s) => s ? { ...s, notifications: enabled } : s);
  }

  function copyToken(token: string) {
    void navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function minutesLeft(expiry: string): number {
    return Math.max(0, Math.round((new Date(expiry).getTime() - Date.now()) / 60000));
  }

  if (loading) {
    return (
      <Card className="mt-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-raised">
            <MessageCircle className="h-5 w-5 text-ink-muted" />
          </div>
          <div className="flex-1 pt-1">
            <Loader2 className="h-4 w-4 animate-spin text-ink-muted" />
          </div>
        </div>
      </Card>
    );
  }

  const isExpired = status?.tokenExpiry ? minutesLeft(status.tokenExpiry) <= 0 : true;
  const mins = status?.tokenExpiry && !isExpired ? minutesLeft(status.tokenExpiry) : 0;

  return (
    <Card className="mt-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#06C755]/10">
          <MessageCircle className="h-5 w-5 text-[#06C755]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-ink">{t("line")}</h2>
            {status?.linked ? (
              <span className="rounded-full bg-[#06C755]/10 px-2 py-0.5 text-xs font-medium text-[#06C755]">
                {t("lineLinked")}
              </span>
            ) : (
              <span className="rounded-full bg-surface-raised px-2 py-0.5 text-xs text-ink-muted">
                {t("lineNotLinked")}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-ink-muted">{t("lineDesc")}</p>

          {status?.linked ? (
            /* ── Linked state ── */
            <div className="mt-4 space-y-3">
              {/* Notification toggle */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={status.notifications}
                  onChange={(e) => void toggleNotifications(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-[#06C755] focus:ring-[#06C755]"
                />
                <div>
                  <span className="text-sm font-medium text-ink">{t("lineNotificationsEnabled")}</span>
                </div>
              </label>
              {/* Disconnect */}
              <button
                onClick={() => void disconnect()}
                disabled={disconnecting}
                className="flex items-center gap-1.5 text-sm text-ink-muted hover:text-red-500 transition-colors disabled:opacity-50"
              >
                {disconnecting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Unlink className="h-3.5 w-3.5" />
                )}
                {disconnecting ? t("lineDisconnecting") : t("lineDisconnect")}
              </button>
            </div>
          ) : (
            /* ── Not linked state ── */
            <div className="mt-4 space-y-4">
              <div className="rounded-lg bg-surface-raised p-4 space-y-2">
                <p className="text-sm text-ink">{t("lineStep1")}</p>
                {lineFriendUrl && (
                  <a
                    href={lineFriendUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-[#06C755] px-4 py-2 text-sm font-semibold text-white hover:bg-[#05a847] transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                    {t("lineAddFriend")}
                  </a>
                )}
              </div>

              <div className="rounded-lg bg-surface-raised p-4 space-y-3">
                <p className="text-sm text-ink">{t("lineStep2")}</p>

                {status?.activeToken && !isExpired ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 rounded-lg border border-border bg-white px-4 py-2.5 font-mono text-2xl font-bold tracking-[0.3em] text-ink text-center">
                        {status.activeToken}
                      </div>
                      <button
                        onClick={() => copyToken(status.activeToken!)}
                        className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2.5 text-sm text-ink-muted hover:border-primary hover:text-primary transition-colors"
                        title="コピー"
                      >
                        {copied ? <Check className="h-4 w-4 text-[#06C755]" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-ink-muted">
                      {t("lineCodeExpiry", { minutes: mins })}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-ink-muted italic">{status?.activeToken ? t("lineCodeExpired") : ""}</p>
                )}

                <button
                  onClick={() => void generateToken()}
                  disabled={generating}
                  className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
                >
                  {generating ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3.5 w-3.5" />
                  )}
                  {generating ? t("lineGenerating") : (status?.activeToken && !isExpired ? t("lineRefreshCode") : t("lineConnect"))}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

// ─── Main settings page ───────────────────────────────────

export default function SettingsPage() {
  const t = useTranslations("dashboard.settings");
  const router = useRouter();
  const pathname = usePathname();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingPrefs, setLoadingPrefs] = useState(true);
  const [prefs, setPrefs] = useState({
    emailNotifications: true,
    notifyAuditComplete: true,
    notifyAlerts: true,
    notifyQuarterly: true,
    notifyFollowUp: true,
    notifyMarketing: true,
    notifyLine: true,
  });

  useEffect(() => {
    fetch("/api/dashboard/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d) setPrefs((p) => ({ ...p, ...d })); })
      .finally(() => setLoadingPrefs(false));
  }, []);

  function switchLocale(locale: "ja" | "en") {
    router.replace(pathname, { locale });
  }

  function setPref(key: keyof typeof prefs, value: boolean) {
    setPrefs((p) => ({ ...p, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    await fetch("/api/dashboard/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prefs),
    }).catch(() => {});
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-ink">{t("title")}</h1>

      {/* Language */}
      <Card className="mt-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-raised">
            <Globe className="h-5 w-5 text-ink-muted" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-ink">{t("locale")}</h2>
            <p className="mt-0.5 text-sm text-ink-muted">{t("localeDesc")}</p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => switchLocale("ja")}
                className="rounded-lg border border-border px-4 py-2 text-sm hover:border-primary hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {t("japanese")}
              </button>
              <button
                onClick={() => switchLocale("en")}
                className="rounded-lg border border-border px-4 py-2 text-sm hover:border-primary hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {t("english")}
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Email Notifications */}
      <Card className="mt-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-raised">
            <Bell className="h-5 w-5 text-ink-muted" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-ink">{t("notifications")}</h2>
            <p className="mt-0.5 text-sm text-ink-muted">{t("notificationsDesc")}</p>

            {loadingPrefs ? (
              <Loader2 className="mt-3 h-4 w-4 animate-spin text-ink-muted" />
            ) : (
              <div className="mt-4 space-y-4">
                {/* Master switch */}
                <label className="flex items-center gap-3 cursor-pointer pb-4 border-b border-border">
                  <input
                    type="checkbox"
                    checked={prefs.emailNotifications}
                    onChange={(e) => setPref("emailNotifications", e.target.checked)}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <div>
                    <span className="text-sm font-medium text-ink">{t("emailNotifications")}</span>
                    <p className="text-xs text-ink-muted">{t("emailNotificationsDesc")}</p>
                  </div>
                </label>

                {/* Category toggles */}
                {prefs.emailNotifications && (
                  <div className="space-y-3 pl-1">
                    {(
                      [
                        ["notifyAuditComplete", "notifyAuditCompleteLabel", "notifyAuditCompleteDesc"],
                        ["notifyAlerts",        "notifyAlertsLabel",        "notifyAlertsDesc"],
                        ["notifyQuarterly",     "notifyQuarterlyLabel",     "notifyQuarterlyDesc"],
                        ["notifyFollowUp",      "notifyFollowUpLabel",      "notifyFollowUpDesc"],
                        ["notifyMarketing",     "notifyMarketingLabel",     "notifyMarketingDesc"],
                      ] as const
                    ).map(([key, labelKey, descKey]) => (
                      <label key={key} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={prefs[key]}
                          onChange={(e) => setPref(key, e.target.checked)}
                          className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                        />
                        <div>
                          <span className="text-sm text-ink">{t(labelKey)}</span>
                          <p className="text-xs text-ink-muted">{t(descKey)}</p>
                        </div>
                      </label>
                    ))}

                    {/* LINE toggle (inside email section — controls the notifyLine user pref) */}
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={prefs.notifyLine}
                        onChange={(e) => setPref("notifyLine", e.target.checked)}
                        className="h-4 w-4 rounded border-border text-[#06C755] focus:ring-[#06C755]"
                      />
                      <div>
                        <span className="text-sm text-ink">{t("notifyLineLabel")}</span>
                        <p className="text-xs text-ink-muted">{t("notifyLineDesc")}</p>
                      </div>
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* LINE Integration */}
      <LineLinkCard />

      {/* Save */}
      <div className="mt-6">
        <Button onClick={handleSave} disabled={saving || loadingPrefs}>
          {saved ? (
            <>
              <Check className="mr-1.5 h-4 w-4" />
              {t("saved")}
            </>
          ) : saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            t("save")
          )}
        </Button>
      </div>
    </>
  );
}
