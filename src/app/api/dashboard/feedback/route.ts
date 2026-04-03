import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentOrg } from "@/lib/dashboard";
import { checkRateLimit } from "@/lib/rate-limit";

const feedbackSchema = z.object({
  score: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
  auditId: z.string().cuid().optional(),
});

export async function POST(request: NextRequest) {
  const rateLimited = await checkRateLimit(request);
  if (rateLimited) return rateLimited;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const org = await getCurrentOrg();
  if (!org) {
    return NextResponse.json({ error: "No organization" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const result = feedbackSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Invalid input", details: result.error.flatten().fieldErrors }, { status: 400 });
  }

  const { score, comment, auditId } = result.data;

  // Validate auditId belongs to this org if provided
  if (auditId) {
    const audit = await prisma.audit.findFirst({
      where: { id: auditId, organizationId: org.id },
      select: { id: true },
    });
    if (!audit) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 });
    }
  }

  await prisma.satisfactionRating.create({
    data: {
      organizationId: org.id,
      auditId: auditId ?? null,
      score,
      comment: comment ?? null,
    },
  });

  return NextResponse.json({ ok: true });
}
