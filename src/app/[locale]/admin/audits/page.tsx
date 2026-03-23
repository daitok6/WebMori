import { AuditCalendar } from "@/components/admin/audit-calendar";

export default function AdminAuditsPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-ink">Audit Calendar</h1>
      <p className="mt-1 mb-6 text-sm text-ink-muted">
        Monthly audit pipeline — click an audit to review, approve, or reject.
      </p>
      <AuditCalendar />
    </>
  );
}
