import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";

export function Footer() {
  const t = useTranslations();

  return (
    <footer className="bg-stone-900 text-white">
      <div className="h-1 bg-gradient-to-r from-primary to-primary-light" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-16">
        <div className="grid gap-8 sm:gap-12 sm:grid-cols-2 md:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-1">
            <Image
              src="/logo-on-dark.png"
              alt="WebMori"
              width={110}
              height={44}
              className="h-[44px] w-auto"
            />
            <p className="mt-3 text-sm text-white/60">
              {t("footer.description")}
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/40">
              {t("footer.product")}
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/features" className="text-sm text-white/60 hover:text-white transition-colors">
                  {t("nav.features")}
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-white/60 hover:text-white transition-colors">
                  {t("nav.pricing")}
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-white/60 hover:text-white transition-colors">
                  {t("nav.blog")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/40">
              {t("footer.company")}
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/about" className="text-sm text-white/60 hover:text-white transition-colors">
                  {t("nav.about")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-white/60 hover:text-white transition-colors">
                  {t("nav.contact")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/40">
              {t("footer.legal")}
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/legal/privacy" className="text-sm text-white/60 hover:text-white transition-colors">
                  {t("footer.privacy")}
                </Link>
              </li>
              <li>
                <Link href="/legal/terms" className="text-sm text-white/60 hover:text-white transition-colors">
                  {t("footer.terms")}
                </Link>
              </li>
              <li>
                <Link href="/legal/tokushoho" className="text-sm text-white/60 hover:text-white transition-colors">
                  {t("footer.tokushoho")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8 pb-[env(safe-area-inset-bottom)] text-center text-sm text-white/40">
          &copy; {new Date().getFullYear()} {t("footer.copyright")}
        </div>
      </div>
    </footer>
  );
}
