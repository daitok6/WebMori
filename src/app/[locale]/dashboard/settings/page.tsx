"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Globe, Bell, Check, Loader2 } from "lucide-react";

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

      {/* Notifications */}
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
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>

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
