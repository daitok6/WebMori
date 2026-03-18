import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { UnreadCountProvider } from "@/contexts/unread-count-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UnreadCountProvider>
      <div className="flex flex-col md:flex-row min-h-screen bg-bg-cream">
        <DashboardNav />
        <div className="flex-1 overflow-x-hidden">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-8">{children}</div>
        </div>
      </div>
    </UnreadCountProvider>
  );
}
