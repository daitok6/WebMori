import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ShieldOff } from "lucide-react";

export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center bg-surface-raised px-6 text-center">
      <ShieldOff className="h-16 w-16 text-ink-muted/40" />
      <h1 className="mt-6 text-4xl font-bold text-ink">404</h1>
      <p className="mt-2 text-lg text-ink-muted">{t("title")}</p>
      <p className="mt-1 text-sm text-ink-muted">{t("description")}</p>
      <Link href="/" className="mt-8">
        <Button>{t("backHome")}</Button>
      </Link>
    </main>
  );
}
