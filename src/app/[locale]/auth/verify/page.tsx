import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { MailCheck } from "lucide-react";

function VerifyContent() {
  const t = useTranslations("auth");

  return (
    <section className="flex min-h-[80vh] items-center justify-center bg-bg-cream px-6 pt-20">
      <ScrollReveal>
        <Card className="w-full max-w-md text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-severity-good/10">
            <MailCheck className="h-7 w-7 text-severity-good" />
          </div>
          <h1 className="text-2xl font-bold text-navy-dark">{t("verifyTitle")}</h1>
          <p className="mt-2 text-text-muted">{t("verifyDescription")}</p>
          <p className="mt-4 text-sm text-text-muted">{t("verifyNote")}</p>
        </Card>
      </ScrollReveal>
    </section>
  );
}

export default function VerifyPage() {
  return <VerifyContent />;
}
