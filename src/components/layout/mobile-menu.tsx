"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "./language-toggle";
import { X } from "lucide-react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

const navLinks = [
  { href: "/features", key: "features" },
  { href: "/pricing", key: "pricing" },
  { href: "/about", key: "about" },
  { href: "/contact", key: "contact" },
] as const;

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const t = useTranslations("nav");

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
            className="fixed top-0 right-0 z-50 h-full w-72 bg-white shadow-xl md:hidden"
          >
            <div className="flex items-center justify-between border-b border-border-light px-6 py-4">
              <Image
                src="/logo-on-light.png"
                alt="WebMori"
                width={220}
                height={60}
                className="h-14 w-auto"
              />
              <button onClick={onClose} className="p-2 text-text-muted" aria-label="Close menu">
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
                    className="block rounded-lg px-4 py-3 text-sm font-medium text-text-muted transition-colors hover:bg-bg-cream hover:text-text-body"
                  >
                    {t(link.key)}
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="border-t border-border-light p-4 flex flex-col gap-3">
              <LanguageToggle />
              <Link href="/auth/signin" onClick={onClose}>
                <Button variant="secondary" className="w-full">
                  {t("login")}
                </Button>
              </Link>
              <Link href="/contact" onClick={onClose}>
                <Button className="w-full">{t("getStarted")}</Button>
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
