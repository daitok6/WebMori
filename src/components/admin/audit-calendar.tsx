"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AuditDetailModal } from "./audit-detail-modal";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  Send,
  AlertTriangle,
  XCircle,
} from "lucide-react";

export interface AuditRow {
  id: string;
  repoName: string;
  repoUrl: string;
  orgName: string;
  status: string;
  findingsCount: number;
  isWelcome: boolean;
  auditDepth: string | null;
  reportCode: string | null;
  reportPdfUrl: string | null;
  findingsPdfUrl: string | null;
  prLinks: string[];
  scheduledAt: string | null;
  createdAt: string;
  deliveredAt: string | null;
  failureReason: string | null;
}

interface CalendarData {
  audits: AuditRow[];
  stats: {
    total: number;
    scheduled: number;
    inProgress: number;
    review: number;
    delivered: number;
    completed: number;
    failed: number;
  };
  month: string;
}

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: "bg-stone-100 border-stone-300 text-stone-700",
  IN_PROGRESS: "bg-blue-50 border-blue-300 text-blue-700",
  REVIEW: "bg-amber-50 border-amber-300 text-amber-700",
  DELIVERED: "bg-green-50 border-green-300 text-green-700",
  COMPLETED: "bg-emerald-50 border-emerald-300 text-emerald-700",
  FAILED: "bg-red-50 border-red-300 text-red-700",
};

const STATUS_DOTS: Record<string, string> = {
  SCHEDULED: "bg-stone-400",
  IN_PROGRESS: "bg-blue-500",
  REVIEW: "bg-amber-500",
  DELIVERED: "bg-green-500",
  COMPLETED: "bg-emerald-500",
  FAILED: "bg-red-500",
};

const STAT_ICONS: Record<string, typeof Clock> = {
  scheduled: Clock,
  inProgress: Loader2,
  review: Eye,
  delivered: Send,
  completed: CheckCircle2,
  failed: XCircle,
};

export function AuditCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [data, setData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAudit, setSelectedAudit] = useState<AuditRow | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/audits?month=${monthKey}`);
      if (res.ok) {
        setData(await res.json());
      }
    } finally {
      setLoading(false);
    }
  }, [monthKey]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }

  function goToToday() {
    setCurrentDate(new Date());
  }

  // Build calendar grid
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startDay = firstDayOfMonth.getDay(); // 0=Sun
  const daysInMonth = lastDayOfMonth.getDate();

  // Group audits by day
  const auditsByDay = new Map<number, AuditRow[]>();
  if (data) {
    for (const audit of data.audits) {
      const dateStr = audit.scheduledAt ?? audit.createdAt;
      const d = new Date(dateStr);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        if (!auditsByDay.has(day)) auditsByDay.set(day, []);
        auditsByDay.get(day)!.push(audit);
      }
    }
  }

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  const monthLabel = new Date(year, month).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
  });

  function handleAuditStatusChange() {
    fetchData();
    setSelectedAudit(null);
  }

  return (
    <>
      {/* Stats bar */}
      {data && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6 mb-6">
          {(["scheduled", "inProgress", "review", "delivered", "completed", "failed"] as const).map(
            (key) => {
              const Icon = STAT_ICONS[key];
              const count = data.stats[key];
              return (
                <Card key={key} className="!p-3">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${key === "failed" ? "text-red-500" : "text-ink-muted"}`} />
                    <div>
                      <p className="text-xs text-ink-muted capitalize">{key.replace(/([A-Z])/g, " $1")}</p>
                      <p className="text-lg font-bold text-ink">{count}</p>
                    </div>
                  </div>
                </Card>
              );
            },
          )}
        </div>
      )}

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold text-ink min-w-[140px] text-center">
            {monthLabel}
          </h2>
          <Button variant="outline" size="sm" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="ghost" size="sm" onClick={goToToday}>
          Today
        </Button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-ink-muted" />
        </div>
      ) : (
        <Card className="!p-0 overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-border bg-surface-raised">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="px-2 py-2 text-center text-xs font-medium text-ink-muted"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7">
            {/* Empty cells before first day */}
            {Array.from({ length: startDay }, (_, i) => (
              <div key={`empty-${i}`} className="min-h-[100px] border-b border-r border-border bg-surface-raised/50" />
            ))}

            {/* Day cells */}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const dayAudits = auditsByDay.get(day) ?? [];
              const isToday = isCurrentMonth && today.getDate() === day;
              const isWeekend = new Date(year, month, day).getDay() % 6 === 0;

              return (
                <div
                  key={day}
                  className={`min-h-[100px] border-b border-r border-border p-1 ${
                    isWeekend ? "bg-surface-raised/30" : "bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                        isToday
                          ? "bg-primary text-white"
                          : "text-ink-muted"
                      }`}
                    >
                      {day}
                    </span>
                    {dayAudits.length > 0 && (
                      <span className="text-[10px] text-ink-muted">{dayAudits.length}</span>
                    )}
                  </div>

                  <div className="space-y-1">
                    {dayAudits.slice(0, 3).map((audit) => (
                      <button
                        key={audit.id}
                        onClick={() => setSelectedAudit(audit)}
                        className={`w-full rounded border px-1.5 py-0.5 text-left text-[11px] leading-tight transition-opacity hover:opacity-80 ${STATUS_COLORS[audit.status] ?? STATUS_COLORS.SCHEDULED}`}
                      >
                        <div className="flex items-center gap-1">
                          <span className={`inline-block h-1.5 w-1.5 rounded-full ${STATUS_DOTS[audit.status] ?? STATUS_DOTS.SCHEDULED}`} />
                          <span className="truncate font-medium">{audit.orgName}</span>
                        </div>
                        <span className="truncate text-[10px] opacity-70">{audit.repoName}</span>
                      </button>
                    ))}
                    {dayAudits.length > 3 && (
                      <p className="text-[10px] text-ink-muted text-center">
                        +{dayAudits.length - 3} more
                      </p>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Empty cells after last day */}
            {Array.from(
              { length: (7 - ((startDay + daysInMonth) % 7)) % 7 },
              (_, i) => (
                <div key={`end-${i}`} className="min-h-[100px] border-b border-r border-border bg-surface-raised/50" />
              ),
            )}
          </div>
        </Card>
      )}

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3 text-xs">
        {Object.entries(STATUS_DOTS).map(([status, color]) => (
          <div key={status} className="flex items-center gap-1.5">
            <span className={`inline-block h-2 w-2 rounded-full ${color}`} />
            <span className="text-ink-muted">{status.replace("_", " ")}</span>
          </div>
        ))}
      </div>

      {/* Detail modal */}
      {selectedAudit && (
        <AuditDetailModal
          audit={selectedAudit}
          onClose={() => setSelectedAudit(null)}
          onStatusChange={handleAuditStatusChange}
        />
      )}
    </>
  );
}
