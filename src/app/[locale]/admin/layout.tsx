import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import { AdminNav } from "@/components/admin/admin-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isAdmin())) {
    redirect("/");
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-bg-cream">
      <AdminNav />
      <main className="flex-1 overflow-x-hidden">
        <div className="mx-auto max-w-5xl px-4 sm:px-8 py-6 sm:py-8">{children}</div>
      </main>
    </div>
  );
}
