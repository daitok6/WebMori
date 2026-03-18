"use client";

import { Link } from "@/i18n/navigation";
import { ClipboardList, LogOut, Menu, MessageSquare, Users, X } from "lucide-react";
import { useState } from "react";
import { AdminUnreadBadge } from "./admin-unread-badge";
import Image from "next/image";

const navItems = [
  { href: "/admin", label: "Free Evals", icon: ClipboardList, badge: false },
  { href: "/admin/users", label: "Users", icon: Users, badge: false },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare, badge: true },
];

export function AdminNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navContent = (
    <>
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          >
            <item.icon className="h-4 w-4" />
            {item.label}
            {item.badge && <AdminUnreadBadge />}
          </Link>
        ))}
      </nav>
      <div className="px-3 py-4 border-t border-white/10">
        <a
          href="/api/auth/signout"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-white/50 hover:text-white transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </a>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 shrink-0 bg-navy-dark text-white flex-col">
        <div className="px-6 py-5 border-b border-white/10">
          <Link href="/" className="block">
            <Image src="/logo-on-dark.png" alt="WebMori" width={150} height={40} className="h-10 w-auto" />
          </Link>
          <span className="text-xs text-white/40">Admin Panel</span>
        </div>
        {navContent}
      </aside>

      {/* Mobile header */}
      <div className="flex md:hidden w-full h-14 items-center justify-between bg-navy-dark text-white px-4 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo-on-dark.png" alt="WebMori" width={130} height={36} className="h-9 w-auto" />
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
        <div className="flex md:hidden flex-col bg-navy-dark text-white border-b border-white/10">
          {navContent}
        </div>
      )}
    </>
  );
}
