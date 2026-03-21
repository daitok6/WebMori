"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export function LanguageToggle() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(newLocale: "ja" | "en") {
    router.replace(pathname, { locale: newLocale });
  }

  return (
    <div className="flex items-center rounded-lg border border-border-light text-sm">
      <button
        onClick={() => switchLocale("ja")}
        className={cn(
          "px-3 py-2 rounded-l-lg transition-colors cursor-pointer min-h-[44px]",
          locale === "ja"
            ? "bg-navy-dark text-white"
            : "text-text-muted hover:text-text-body",
        )}
      >
        JP
      </button>
      <button
        onClick={() => switchLocale("en")}
        className={cn(
          "px-3 py-2 rounded-r-lg transition-colors cursor-pointer min-h-[44px]",
          locale === "en"
            ? "bg-navy-dark text-white"
            : "text-text-muted hover:text-text-body",
        )}
      >
        EN
      </button>
    </div>
  );
}
