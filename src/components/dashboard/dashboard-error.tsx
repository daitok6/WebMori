"use client";

import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

export function DashboardError({ message, onRetry }: { message: string; onRetry: () => void }) {
  const t = useTranslations("dashboard.error");

  return (
    <Card className="mt-6 py-12 text-center">
      <AlertCircle className="mx-auto mb-3 h-8 w-8 text-severity-high" />
      <p className="font-medium text-ink">{t("title")}</p>
      <p className="mt-1 text-sm text-ink-muted">{message}</p>
      <Button variant="secondary" size="sm" onClick={onRetry} className="mt-4">
        <RefreshCw className="mr-1.5 h-4 w-4" />
        {t("retry")}
      </Button>
    </Card>
  );
}
