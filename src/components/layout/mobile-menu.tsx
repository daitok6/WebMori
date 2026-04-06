"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "./language-toggle";
import { X } from "lucide-react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { navLinks } from "@/lib/nav-links";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const t = useTranslations("nav");

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/40 md:hidden"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 z-50 h-full w-72 bg-surface shadow-xl md:hidden"
          >
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <Image
                src="/logo-on-light.png"
                alt="WebMori"
                width={110}
                height={44}
                className="h-[44px] w-auto"
              />
              <button onClick={onClose} className="p-2 text-ink-muted" aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col gap-1 p-4">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.key}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.06 }}
                >
                  <Link
                    href={link.href}
                    onClick={onClose}
                    className="block rounded-lg px-4 py-3 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-raised hover:text-ink"
                  >
                    {t(link.key)}
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="border-t border-border p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <LanguageToggle />
              </div>
              <Link href="/auth/signin" onClick={onClose}>
                <Button variant="secondary" className="w-full">
                  {t("login")}
                </Button>
              </Link>
              <Link href="/auth/signin?callbackUrl=/dashboard/free-eval" onClick={onClose}>
                <Button className="w-full">{t("getStarted")}</Button>
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
