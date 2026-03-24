"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  User,
  GitBranch,
  CalendarCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  company: string;
  website: string;
}

interface WizardResult {
  auditWeek: number;
  auditDayOfWeek: number;
  nextAuditDate: string;
  plan: string;
}

const STACK_OPTIONS = [
  { value: "SHOPIFY", label: "Shopify" },
  { value: "WORDPRESS", label: "WordPress" },
  { value: "NEXTJS", label: "Next.js / React" },
  { value: "LINE_MINI_APP", label: "LINE Mini App" },
  { value: "OTHER", label: "Other" },
];

const DAY_NAMES_JA = ["", "月", "火", "水", "木", "金"];
const DAY_NAMES_EN = ["", "Mon", "Tue", "Wed", "Thu", "Fri"];

export function OnboardingWizard() {
  const t = useTranslations("dashboard.wizard");
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<WizardResult | null>(null);
  const [locale, setLocale] = useState("ja");

  // Step 1: Profile
  const [profile, setProfile] = useState<ProfileData>({
    name: "",
    email: "",
    phone: "",
    company: "",
    website: "",
  });

  // Step 2: Repo
  const [noRepo, setNoRepo] = useState(false);
  const [repo, setRepo] = useState({
    name: "",
    url: "",
    stack: "OTHER",
  });

  useEffect(() => {
    // Detect locale from URL
    const pathLocale = window.location.pathname.split("/")[1];
    if (pathLocale === "en") setLocale("en");

    // Load existing profile data
    fetch("/api/dashboard/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) {
          setProfile({
            name: d.name || "",
            email: d.email || "",
            phone: d.phone || "",
            company: d.company || "",
            website: d.website || "",
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const steps = [
    { key: "profile", icon: User },
    { key: "repo", icon: GitBranch },
    { key: "confirm", icon: CalendarCheck },
  ];

  function isStep1Valid() {
    return profile.name.trim() && profile.company.trim() && profile.website.trim();
  }

  function isStep2Valid() {
    if (noRepo) return true;
    return repo.name.trim() && repo.url.trim();
  }

  async function handleNext() {
    if (step === 0 && !isStep1Valid()) return;
    if (step === 1 && !isStep2Valid()) return;

    if (step === 1) {
      // Submit everything on step 2 completion
      setSaving(true);
      try {
        // Save profile
        await fetch("/api/dashboard/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(profile),
        });

        // Save repo (or create URL-only entry if no repo)
        if (noRepo) {
          const domain = profile.website.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
          await fetch("/api/dashboard/repos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: domain,
              url: profile.website,
              stack: "OTHER",
              isRepoless: true,
            }),
          });
        } else {
          await fetch("/api/dashboard/repos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(repo),
          });
        }

        // Complete onboarding
        const res = await fetch("/api/dashboard/onboarding/complete", {
          method: "POST",
        });
        if (res.ok) {
          const data = await res.json();
          setResult(data);
        }

        setStep(2);
      } finally {
        setSaving(false);
      }
      return;
    }

    setStep((s) => Math.min(s + 1, 2));
  }

  function handleBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  function handleGoToDashboard() {
    router.push(`/${locale}/dashboard`);
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const dayNames = locale === "ja" ? DAY_NAMES_JA : DAY_NAMES_EN;

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-ink">{t("title")}</h1>
        <p className="mt-2 text-ink-muted">{t("subtitle")}</p>
      </div>

      {/* Step indicator */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center gap-2">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                i < step
                  ? "border-primary bg-primary text-white"
                  : i === step
                    ? "border-primary bg-white text-primary"
                    : "border-border bg-surface text-ink-muted"
              }`}
            >
              {i < step ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <s.icon className="h-5 w-5" />
              )}
            </div>
            {i < steps.length - 1 && (
              <div
                className={`h-0.5 w-12 transition-colors ${
                  i < step ? "bg-primary" : "bg-border"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Profile */}
      {step === 0 && (
        <Card>
          <h2 className="text-lg font-semibold text-ink mb-1">{t("profileTitle")}</h2>
          <p className="text-sm text-ink-muted mb-6">{t("profileDesc")}</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">{t("name")} *</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                placeholder={t("namePlaceholder")}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-1">{t("phone")}</label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                placeholder="090-0000-0000"
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-1">{t("company")} *</label>
              <input
                type="text"
                value={profile.company}
                onChange={(e) => setProfile((p) => ({ ...p, company: e.target.value }))}
                placeholder={t("companyPlaceholder")}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-1">{t("website")} *</label>
              <input
                type="url"
                value={profile.website}
                onChange={(e) => setProfile((p) => ({ ...p, website: e.target.value }))}
                placeholder="https://example.com"
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleNext} disabled={!isStep1Valid()}>
              {t("next")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 2: Repository */}
      {step === 1 && (
        <Card>
          <h2 className="text-lg font-semibold text-ink mb-1">{t("repoTitle")}</h2>
          <p className="text-sm text-ink-muted mb-6">{t("repoDesc")}</p>

          {/* No-repo toggle */}
          <button
            type="button"
            onClick={() => setNoRepo((v) => !v)}
            className="mb-6 text-sm text-primary hover:text-primary/80 underline underline-offset-2"
          >
            {noRepo ? t("hasRepo") : t("noRepo")}
          </button>

          {noRepo ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-surface-raised p-4">
                <p className="text-sm text-ink-muted mb-3">{t("noRepoDesc")}</p>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">{t("noRepoSiteUrl")}</label>
                  <input
                    type="url"
                    value={profile.website}
                    readOnly
                    className="w-full rounded-lg border border-border bg-white/50 px-3 py-2 text-sm text-ink-muted cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1">{t("repoName")} *</label>
                <input
                  type="text"
                  value={repo.name}
                  onChange={(e) => setRepo((r) => ({ ...r, name: e.target.value }))}
                  placeholder={t("repoNamePlaceholder")}
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-1">{t("repoUrl")} *</label>
                <input
                  type="url"
                  value={repo.url}
                  onChange={(e) => setRepo((r) => ({ ...r, url: e.target.value }))}
                  placeholder="https://github.com/your-org/your-repo"
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-1">{t("stack")}</label>
                <select
                  value={repo.stack}
                  onChange={(e) => setRepo((r) => ({ ...r, stack: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {STACK_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-between">
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("back")}
            </Button>
            <Button onClick={handleNext} loading={saving} disabled={!isStep2Valid()}>
              {t("complete")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Confirmation */}
      {step === 2 && (
        <Card className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>

          <h2 className="text-xl font-semibold text-ink">{t("successTitle")}</h2>
          <p className="mt-2 text-ink-muted">{t("successDesc")}</p>

          {result && (
            <div className="mt-6 rounded-lg border border-border bg-surface-raised p-4 text-left">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-ink-muted">{t("yourPlan")}</span>
                  <span className="font-medium text-ink">{result.plan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">{t("auditSchedule")}</span>
                  <span className="font-medium text-ink">
                    {t("weekPrefix")}{result.auditWeek}{t("weekSuffix")} {dayNames[result.auditDayOfWeek]}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">{t("nextAudit")}</span>
                  <span className="font-medium text-ink">{result.nextAuditDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">{t("welcomeAudit")}</span>
                  <span className="font-medium text-primary">{t("welcomeAuditRunning")}</span>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6">
            <p className="text-xs text-ink-muted mb-4">{t("auditCycleNote")}</p>
            <Button onClick={handleGoToDashboard}>
              {t("goToDashboard")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
