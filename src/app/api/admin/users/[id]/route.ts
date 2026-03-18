import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      organization: {
        include: {
          subscription: true,
          repos: { where: { isActive: true } },
          audits: {
            orderBy: { createdAt: "desc" },
            take: 5,
            include: { findings: true },
          },
          _count: { select: { messages: true } },
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    bio: user.bio,
    createdAt: user.createdAt.toISOString(),
    org: user.organization
      ? {
          id: user.organization.id,
          name: user.organization.name,
          website: user.organization.website,
          phone: user.organization.phone,
          plan: user.organization.subscription?.plan ?? null,
          status: user.organization.subscription?.status ?? null,
          currentPeriodEnd:
            user.organization.subscription?.currentPeriodEnd?.toISOString() ??
            null,
          repos: user.organization.repos.map((r) => ({
            id: r.id,
            name: r.name,
            url: r.url,
            stack: r.stack,
          })),
          recentAudits: user.organization.audits.map((a) => ({
            id: a.id,
            status: a.status,
            date: a.createdAt.toISOString(),
            findingsCount: a.findings.length,
          })),
          messageCount: user.organization._count.messages,
        }
      : null,
  });
}
