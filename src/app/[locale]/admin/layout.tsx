import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import { Link } from "@/i18n/navigation";
import { MessageSquare, Users, ClipboardList, LogOut } from "lucide-react";
import { AdminUnreadBadge } from "@/components/admin/admin-unread-badge";

const navItems = [
  { href: "/admin", label: "Free Evals", icon: ClipboardList, exact: true, badge: false },
  { href: "/admin/users", label: "Users", icon: Users, badge: false },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare, badge: true },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isAdmin())) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-bg-cream">
      <aside className="w-56 shrink-0 bg-navy-dark text-white flex flex-col">
        <div className="px-6 py-5 border-b border-white/10">
          <Link href="/" className="block">
            <span className="text-lg font-bold">
              Web<span className="text-gold">Mori</span>
            </span>
          </Link>
          <span className="text-xs text-white/40">Admin Panel</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
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
      </aside>

      <main className="flex-1 overflow-x-hidden">
        <div className="mx-auto max-w-5xl px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
