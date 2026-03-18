import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import { Link } from "@/i18n/navigation";
import { MessageSquare, Users, LogOut } from "lucide-react";

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
      {/* Sidebar */}
      <aside className="w-56 bg-navy-dark text-white flex flex-col">
        <div className="px-6 py-5 border-b border-white/10">
          <span className="text-lg font-bold">
            Web<span className="text-gold">Mori</span>
          </span>
          <span className="ml-2 text-xs text-white/40">Admin</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          <Link
            href="/admin"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          >
            <Users className="h-4 w-4" />
            Contact Requests
          </Link>
          <Link
            href="/admin/messages"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
            Messages
          </Link>
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

      {/* Content */}
      <main className="flex-1 overflow-x-hidden">
        <div className="mx-auto max-w-5xl px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
