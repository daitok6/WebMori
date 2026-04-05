"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { ClipboardList, LogOut, Menu, MessageSquare, Users, X, BarChart3, CreditCard, ClipboardCheck } from "lucide-react";
import { useState } from "react";
import { AdminUnreadBadge } from "./admin-unread-badge";
import { AdminReviewBadge } from "./admin-review-badge";
import { cn } from "@/lib/utils";
import Image from "next/image";

const navItems = [
  { href: "/admin", label: "Free Evals", icon: ClipboardList, badge: null, exact: true },
  { href: "/admin/users", label: "Users", icon: Users, badge: null },
  { href: "/admin/audits", label: "Audits", icon: BarChart3, badge: null },
  { href: "/admin/reviews", label: "Reviews", icon: ClipboardCheck, badge: "review" as const },
  { href: "/admin/billing", label: "Billing", icon: CreditCard, badge: null },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare, badge: "unread" as const },
];

export function AdminNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  const navContent = (
    <>
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-white/15 text-white font-medium"
                  : "text-white/70 hover:bg-white/10 hover:text-white",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
              {item.badge === "unread" && <AdminUnreadBadge />}
              {item.badge === "review" && <AdminReviewBadge />}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={() => { window.location.href = "/api/auth/signout"; }}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-white/50 hover:text-white transition-colors cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 shrink-0 bg-stone-800 text-white flex-col">
        <div className="px-6 py-5 border-b border-white/10">
          <Link href="/" className="block">
            <Image src="/logo-on-dark.png" alt="WebMori" width={110} height={44} className="h-[44px] w-auto" />
          </Link>
          <span className="text-xs text-white/40">Admin Panel</span>
        </div>
        {navContent}
      </aside>

      {/* Mobile header */}
      <div className="flex md:hidden w-full h-14 items-center justify-between bg-stone-800 text-white px-4 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo-on-dark.png" alt="WebMori" width={110} height={44} className="h-[44px] w-auto" />
          <span className="text-xs text-white/40 ml-1">Admin</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-white/70"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="flex md:hidden flex-col bg-stone-800 text-white border-b border-white/10">
          {navContent}
        </div>
      )}
    </>
  );
}
