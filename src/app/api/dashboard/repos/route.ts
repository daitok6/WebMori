import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentOrg } from "@/lib/dashboard";
import { Stack } from "@/generated/prisma/client";

export async function GET() {
  const org = await getCurrentOrg();
  if (!org) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const repos = await prisma.repo.findMany({
    where: { organizationId: org.id },
    include: {
      audits: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { findings: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    repos.map((r) => ({
      id: r.id,
      name: r.name,
      url: r.url,
      stack: r.stack,
      isActive: r.isActive,
      lastAudit: r.audits[0]
        ? {
            date: r.audits[0].createdAt.toISOString(),
            status: r.audits[0].status,
            findingsCount: r.audits[0].findings.length,
          }
        : null,
    })),
  );
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const org = await getCurrentOrg();
  if (!org) {
    return NextResponse.json({ error: "No organization" }, { status: 400 });
  }

  // Check repo limit based on plan
  const limits: Record<string, number> = { STARTER: 1, GROWTH: 2, PRO: 3 };
  const maxRepos = limits[org.subscription?.plan ?? "STARTER"] ?? 1;
  const activeRepos = org.repos.filter((r) => r.isActive).length;

  if (activeRepos >= maxRepos) {
    return NextResponse.json(
      { error: "Repo limit reached for your plan" },
      { status: 403 },
    );
  }

  const body = await request.json();
  const { name, url, stack } = body as { name: string; url: string; stack?: string };

  if (!name || !url) {
    return NextResponse.json({ error: "Name and URL required" }, { status: 400 });
  }

  const stackValue = (stack?.toUpperCase() as Stack) ?? "OTHER";

  const repo = await prisma.repo.create({
    data: {
      organizationId: org.id,
      name,
      url,
      stack: Object.values(Stack).includes(stackValue) ? stackValue : "OTHER",
    },
  });

  return NextResponse.json(repo, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const org = await getCurrentOrg();
  if (!org) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const repoId = searchParams.get("id");
  if (!repoId) {
    return NextResponse.json({ error: "Missing repo id" }, { status: 400 });
  }

  // Verify repo belongs to org
  const repo = await prisma.repo.findFirst({
    where: { id: repoId, organizationId: org.id },
  });

  if (!repo) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.repo.update({
    where: { id: repoId },
    data: { isActive: false },
  });

  return NextResponse.json({ success: true });
}
