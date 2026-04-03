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
    <div className="flex items-center rounded-lg border border-border text-sm">
      <button
        onClick={() => switchLocale("ja")}
        className={cn(
          "px-3 py-2 rounded-l-lg transition-colors cursor-pointer min-h-[44px]",
          locale === "ja"
            ? "bg-stone-800 text-white dark:bg-primary dark:text-stone-900"
            : "text-ink-muted hover:text-ink",
        )}
      >
        JP
      </button>
      <button
        onClick={() => switchLocale("en")}
        className={cn(
          "px-3 py-2 rounded-r-lg transition-colors cursor-pointer min-h-[44px]",
          locale === "en"
            ? "bg-stone-800 text-white dark:bg-primary dark:text-stone-900"
            : "text-ink-muted hover:text-ink",
        )}
      >
        EN
      </button>
    </div>
  );
}
