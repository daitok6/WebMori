import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { UnreadCountProvider } from "@/contexts/unread-count-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UnreadCountProvider>
      <div className="flex min-h-screen bg-bg-cream pt-0">
        <DashboardNav />
        <div className="flex-1 overflow-x-hidden">
          <div className="mx-auto max-w-6xl px-6 py-8">{children}</div>
        </div>
      </div>
    </UnreadCountProvider>
  );
}
