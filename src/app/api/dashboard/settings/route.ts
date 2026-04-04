import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";

const settingsSchema = z.object({
  emailNotifications: z.boolean().optional(),
  notifyAuditComplete: z.boolean().optional(),
  notifyAlerts: z.boolean().optional(),
  notifyQuarterly: z.boolean().optional(),
  notifyFollowUp: z.boolean().optional(),
  notifyMarketing: z.boolean().optional(),
  notifyLine: z.boolean().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      emailNotifications: true,
      notifyAuditComplete: true,
      notifyAlerts: true,
      notifyQuarterly: true,
      notifyFollowUp: true,
      notifyMarketing: true,
      notifyLine: true,
    },
  });

  return NextResponse.json(user ?? {
    emailNotifications: true,
    notifyAuditComplete: true,
    notifyAlerts: true,
    notifyQuarterly: true,
    notifyFollowUp: true,
    notifyMarketing: true,
    notifyLine: true,
  });
}

export async function PATCH(request: NextRequest) {
  const rateLimited = await checkRateLimit(request);
  if (rateLimited) return rateLimited;

  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const result = settingsSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Invalid input", details: result.error.flatten().fieldErrors }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: result.data,
  });

  return NextResponse.json({ ok: true });
}
