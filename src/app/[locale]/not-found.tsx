import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ShieldOff } from "lucide-react";

export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center bg-bg-cream px-6 text-center">
      <ShieldOff className="h-16 w-16 text-text-muted/40" />
      <h1 className="mt-6 text-4xl font-bold text-navy-dark">404</h1>
      <p className="mt-2 text-lg text-text-muted">{t("title")}</p>
      <p className="mt-1 text-sm text-text-muted">{t("description")}</p>
      <Link href="/" className="mt-8">
        <Button>{t("backHome")}</Button>
      </Link>
    </main>
  );
}
