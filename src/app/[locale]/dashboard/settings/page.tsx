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
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [loadingPrefs, setLoadingPrefs] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d) setEmailNotifications(d.emailNotifications); })
      .finally(() => setLoadingPrefs(false));
  }, []);

  function switchLocale(locale: "ja" | "en") {
    router.replace(pathname, { locale });
  }

  async function handleSave() {
    setSaving(true);
    await fetch("/api/dashboard/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailNotifications }),
    }).catch(() => {});
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-navy-dark">{t("title")}</h1>

      {/* Language */}
      <Card className="mt-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-bg-cream">
            <Globe className="h-5 w-5 text-navy-light" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-navy-dark">{t("locale")}</h2>
            <p className="mt-0.5 text-sm text-text-muted">{t("localeDesc")}</p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => switchLocale("ja")}
                className="rounded-lg border border-border px-4 py-2 text-sm hover:border-gold hover:text-gold transition-colors focus:outline-none focus:ring-2 focus:ring-gold"
              >
                {t("japanese")}
              </button>
              <button
                onClick={() => switchLocale("en")}
                className="rounded-lg border border-border px-4 py-2 text-sm hover:border-gold hover:text-gold transition-colors focus:outline-none focus:ring-2 focus:ring-gold"
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
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-bg-cream">
            <Bell className="h-5 w-5 text-navy-light" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-navy-dark">
              {t("notifications")}
            </h2>
            <p className="mt-0.5 text-sm text-text-muted">
              {t("notificationsDesc")}
            </p>
            {loadingPrefs ? (
              <Loader2 className="mt-3 h-4 w-4 animate-spin text-text-muted" />
            ) : (
              <div className="mt-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="h-4 w-4 rounded border-border text-gold focus:ring-gold"
                  />
                  <div>
                    <span className="text-sm text-navy-dark">
                      {t("emailNotifications")}
                    </span>
                    <p className="text-xs text-text-muted">
                      {t("emailNotificationsDesc")}
                    </p>
                  </div>
                </label>
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
