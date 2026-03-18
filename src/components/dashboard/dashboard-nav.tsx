"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  GitBranch,
  CreditCard,
  MessageSquare,
  Settings,
  User,
  Menu,
  X,
  Sparkles,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { useUnreadCount } from "@/contexts/unread-count-context";

const navItems = [
  { href: "/dashboard", key: "overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/reports", key: "reports", icon: FileText },
  { href: "/dashboard/repos", key: "repos", icon: GitBranch },
  { href: "/dashboard/billing", key: "billing", icon: CreditCard },
  { href: "/dashboard/messages", key: "messages", icon: MessageSquare },
  { href: "/dashboard/free-eval", key: "freeEval", icon: Sparkles },
  { href: "/dashboard/profile", key: "profile", icon: User },
  { href: "/dashboard/settings", key: "settings", icon: Settings },
] as const;

export function DashboardNav() {
  const t = useTranslations("dashboard.nav");
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { unreadCount } = useUnreadCount();

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  const navContent = (
    <ul className="space-y-1">
      {navItems.map((item) => {
        const active = isActive(item.href, "exact" in item ? item.exact : false);
        return (
          <li key={item.key}>
            <Link
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-gold/10 text-gold"
                  : "text-text-muted hover:bg-bg-cream hover:text-text-body",
              )}
            >
              <item.icon className="h-5 w-5" />
              {t(item.key)}
              {item.key === "messages" && unreadCount > 0 && (
                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-60 md:shrink-0 md:flex-col md:border-r md:border-border-light md:bg-white">
        <div className="flex h-16 items-center border-b border-border-light px-6">
          <Link href="/" className="text-lg font-bold text-navy-dark">
            Web<span className="text-gold">Mori</span>
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto p-4">{navContent}</nav>
        <div className="border-t border-border-light p-4">
          <button
            onClick={() => signOut({ callbackUrl: "/auth/signin" })}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text-muted hover:bg-bg-cream hover:text-text-body transition-colors"
          >
            <LogOut className="h-5 w-5" />
            ログアウト
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex h-14 items-center justify-between border-b border-border-light bg-white px-4 md:hidden">
        <Link href="/" className="text-lg font-bold text-navy-dark">
          Web<span className="text-gold">Mori</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-text-muted"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile nav dropdown */}
      {mobileOpen && (
        <div className="border-b border-border-light bg-white p-4 md:hidden">
          {navContent}
          <div className="mt-2 border-t border-border-light pt-2">
            <button
              onClick={() => signOut({ callbackUrl: "/auth/signin" })}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text-muted hover:bg-bg-cream transition-colors"
            >
              <LogOut className="h-5 w-5" />
              ログアウト
            </button>
          </div>
        </div>
      )}
    </>
  );
}
