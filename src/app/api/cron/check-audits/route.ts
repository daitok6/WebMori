import { NextRequest, NextResponse } from "next/server";
import { scheduleMonthlyAudits } from "@/lib/audit-scheduler";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const scheduled = await scheduleMonthlyAudits();

  return NextResponse.json({
    scheduled: scheduled.length,
    audits: scheduled,
    timestamp: new Date().toISOString(),
  });
}
