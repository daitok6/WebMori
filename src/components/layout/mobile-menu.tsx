"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "./language-toggle";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

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
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/40 transition-opacity duration-300 md:hidden",
          open ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          "fixed top-0 right-0 z-50 h-full w-72 bg-white shadow-xl transition-transform duration-300 md:hidden",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-border-light px-6 py-4">
          <Image
            src="/logo-dark.svg"
            alt="WebMori"
            width={148}
            height={40}
            className="h-7 w-auto"
          />
          <button onClick={onClose} className="p-2 text-text-muted" aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col gap-1 p-4">
          {navLinks.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              onClick={onClose}
              className="rounded-lg px-4 py-3 text-sm font-medium text-text-muted transition-colors hover:bg-bg-cream hover:text-text-body"
            >
              {t(link.key)}
            </Link>
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
      </div>
    </>
  );
}
