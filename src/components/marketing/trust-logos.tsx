"use client";

import { useTranslations } from "next-intl";
import { ScrollReveal } from "@/components/motion/scroll-reveal";

/* Inline SVG logos for brand recognition */
function ShopifyLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 109 124" fill="currentColor" role="img" aria-label="Shopify">
      <path d="M95.6 28.2c-.1-.6-.6-1-1.1-1-.5 0-10.3-.8-10.3-.8s-6.8-6.7-7.5-7.5c-.7-.7-2.2-.5-2.7-.3 0 0-1.4.4-3.7 1.1-.4-1.3-1-2.8-1.8-4.4-2.6-5-6.5-7.7-11.1-7.7-.3 0-.7 0-1 .1-.2-.2-.3-.3-.5-.5-2-2.2-4.6-3.2-7.7-3.1-6 .2-12 4.5-16.8 12.2-3.4 5.4-6 12.2-6.7 17.5-6.9 2.1-11.7 3.6-11.8 3.7-3.5 1.1-3.6 1.2-4 4.5-.3 2.5-9.5 73-9.5 73l75.6 13.1 32.6-8.2S95.7 28.8 95.6 28.2zM67.3 21.6l-5.6 1.7c0-.3 0-.7 0-1.1 0-3.4-.5-6.1-1.2-8.2 3.1.4 5.1 3.9 6.8 7.6zM57.3 14.7c.8 2 1.4 4.9 1.4 8.9 0 .4 0 .8 0 1.1l-11.5 3.6c2.2-8.5 6.4-12.6 10.1-13.6zM48.7 8.5c.7 0 1.3.1 1.8.4-4.8 2.3-10 8.1-12.2 19.7l-9.1 2.8C31.4 22.7 38.8 8.7 48.7 8.5z"/>
      <path d="M94.5 27.2c-.5 0-10.3-.8-10.3-.8s-6.8-6.7-7.5-7.5c-.3-.3-.6-.4-1-.4l-4.5 91.7 32.6-8.2S95.7 28.8 95.6 28.2c-.1-.6-.6-1-1.1-1z" opacity=".5"/>
    </svg>
  );
}

function WordPressLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 122 122" fill="currentColor" role="img" aria-label="WordPress">
      <path d="M8.7 61C8.7 32.1 32.1 8.7 61 8.7S113.3 32.1 113.3 61 89.9 113.3 61 113.3 8.7 89.9 8.7 61zM61 3.3C29.1 3.3 3.3 29.1 3.3 61s25.8 57.7 57.7 57.7S118.7 92.9 118.7 61 92.9 3.3 61 3.3zM18.6 61c0-6.2 1.3-12.1 3.7-17.4L41 106.3C27.3 99.8 18.6 85.5 18.6 61zm42.4 7l14.9 40.9c.1.2.2.4.3.6-4.7 1.7-9.8 2.7-15.2 2.7-4.4 0-8.6-.6-12.6-1.8L61 73zm36-2.8c2.7-6.8 3.6-12.2 3.6-17 0-1.7-.1-3.4-.4-4.9 2.3 4.2 3.6 9 3.6 14.2 0 10.9-5.9 20.4-14.6 25.5l8.9-24.4-.1.1c1-.4-.4 2.2-1 6.6zM61 14c6.7 0 13 1.4 18.7 3.9-.4.6-.7 1.3-.9 2.2-1.7 6.6 1.2 13.3 3.8 18.5L69 73.2 55.3 32c2.4-.1 4.5-.4 4.5-.4 2.1-.2 1.9-3.4-.2-3.3 0 0-6.4.5-10.6.5-3.9 0-10.4-.5-10.4-.5-2.2-.1-2.4 3.2-.3 3.3 0 0 2 .2 4.1.3L56.7 73l-18-53.7C35.3 18.3 28.5 14 18.6 14.2 29.3 8.4 39.9 14 61 14z"/>
    </svg>
  );
}

function NextjsLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 180 180" fill="currentColor" role="img" aria-label="Next.js">
      <circle cx="90" cy="90" r="90" />
      <path fill="white" d="M149.508 157.52L69.142 54H54v71.97h12.114V69.384l73.885 95.461A90.304 90.304 0 00149.508 157.52z" />
      <rect x="115" y="54" width="12" height="72" fill="white" />
    </svg>
  );
}

function LineLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="currentColor" role="img" aria-label="LINE">
      {/* App icon background */}
      <rect x="1" y="1" width="46" height="46" rx="10" />
      {/* Speech bubble — white cutout */}
      <path
        fill="white"
        d="M24 8.5C14.3 8.5 6.5 15 6.5 23c0 7.2 6.4 13.2 15 14.7-.3 1.3-.8 3.3-.2 3.8.6.5 3.6-1.4 5.5-2.7.7.1 1.4.1 2.2.1 9.7 0 17.5-6.5 17.5-14.5S33.7 8.5 24 8.5z"
      />
      {/* LINE letters — currentColor (same as background circle, shows as filled) */}
      <path
        fill="currentColor"
        d="M16.5 21h1.8v5H21v1.5h-4.5V21zm5.5 0h1.8v6.5H22V21zm2.8 0h1.9l2.3 4V21H30v6.5h-1.8l-2.4-4.1v4.1H24V21zm6 0h4.7v1.5h-2.9v1h2.7v1.4h-2.7v1.1h3v1.5h-4.8V21z"
      />
    </svg>
  );
}

const platforms = [
  { name: "Shopify", Logo: ShopifyLogo },
  { name: "WordPress", Logo: WordPressLogo },
  { name: "Next.js", Logo: NextjsLogo },
  { name: "LINE", Logo: LineLogo },
];

export function TrustLogos() {
  const t = useTranslations("trust");

  return (
    <section className="border-y border-border bg-surface py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <ScrollReveal>
          <p className="text-center text-sm font-medium uppercase tracking-wider text-ink-muted">
            {t("title")}
          </p>
          <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-10 sm:gap-16">
            {platforms.map(({ name, Logo }) => (
              <div
                key={name}
                className="flex flex-col items-center gap-2 text-ink-subtle/40 transition-colors hover:text-primary group"
              >
                <Logo className="h-8 sm:h-10 w-auto" />
                <span className="text-xs font-medium tracking-wide opacity-60 group-hover:opacity-100 transition-opacity">
                  {name}
                </span>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
