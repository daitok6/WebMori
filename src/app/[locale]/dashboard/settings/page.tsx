"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Globe, Bell, Check } from "lucide-react";

export default function SettingsPage() {
  const t = useTranslations("dashboard.settings");
  const router = useRouter();
  const pathname = usePathname();
  const [saved, setSaved] = useState(false);

  function switchLocale(locale: "ja" | "en") {
    router.replace(pathname, { locale });
  }

  function handleSave() {
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
            <div className="mt-3 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 rounded border-border text-gold focus:ring-gold"
                />
                <span className="text-sm text-navy-dark">
                  {t("auditComplete")}
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 rounded border-border text-gold focus:ring-gold"
                />
                <span className="text-sm text-navy-dark">
                  {t("newMessage")}
                </span>
              </label>
            </div>
          </div>
        </div>
      </Card>

      {/* Save */}
      <div className="mt-6">
        <Button onClick={handleSave}>
          {saved ? (
            <>
              <Check className="mr-1.5 h-4 w-4" />
              {t("saved")}
            </>
          ) : (
            t("save")
          )}
        </Button>
      </div>
    </>
  );
}
