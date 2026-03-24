import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentOrg } from "@/lib/dashboard";
import { Stack } from "@/generated/prisma/client";
import { checkRateLimit } from "@/lib/rate-limit";

const repoSchema = z.object({
  name: z.string().min(1).max(200),
  url: z.string().url().max(500),
  stack: z.string().max(50).optional(),
  isRepoless: z.boolean().optional(),
});

const REPO_LIMITS: Record<string, number> = { STARTER: 1, GROWTH: 1, PRO: 2 };

function getRepoLimits(org: NonNullable<Awaited<ReturnType<typeof getCurrentOrg>>>) {
  const maxRepos = REPO_LIMITS[org.subscription?.plan ?? "STARTER"] ?? 1;
  const activeRepos = org.repos.filter((r) => r.isActive).length;
  const changesRemaining = Math.max(0, org.repoChangesAllowed - org.repoChangesUsed);
  return {
    maxRepos,
    activeRepos,
    repoChangesUsed: org.repoChangesUsed,
    repoChangesAllowed: org.repoChangesAllowed,
    changesRemaining,
    locked: changesRemaining === 0,
  };
}

function isInitialSetup(org: NonNullable<Awaited<ReturnType<typeof getCurrentOrg>>>) {
  const activeRepos = org.repos.filter((r) => r.isActive).length;
  return activeRepos === 0 && org.repoChangesUsed === 0;
}

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

  return NextResponse.json({
    repos: repos.map((r) => ({
      id: r.id,
      name: r.name,
      url: r.url,
      stack: r.stack,
      isActive: r.isActive,
      isRepoless: r.isRepoless,
      lastAudit: r.audits[0]
        ? {
            date: r.audits[0].createdAt.toISOString(),
            status: r.audits[0].status,
            findingsCount: r.audits[0].findings.length,
          }
        : null,
    })),
    limits: getRepoLimits(org),
  });
}

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

  const limits = getRepoLimits(org);

  // Check repo count limit
  if (limits.activeRepos >= limits.maxRepos) {
    return NextResponse.json(
      { error: "Repo limit reached for your plan" },
      { status: 403 },
    );
  }

  // Check repo change limit (initial setup is free)
  if (!isInitialSetup(org) && limits.locked) {
    return NextResponse.json(
      { error: "Repo changes exhausted. Contact support to request more changes." },
      { status: 403 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const result = repoSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Invalid input", details: result.error.flatten().fieldErrors }, { status: 400 });
  }
  const { name, url, stack, isRepoless } = result.data;

  const stackValue = (stack?.toUpperCase() as Stack) ?? "OTHER";
  const initial = isInitialSetup(org);

  const repo = await prisma.$transaction(async (tx) => {
    const created = await tx.repo.create({
      data: {
        organizationId: org.id,
        name,
        url,
        stack: Object.values(Stack).includes(stackValue) ? stackValue : "OTHER",
        isRepoless: isRepoless ?? false,
      },
    });

    // Log the change and increment counter (skip for initial setup)
    await tx.repoChangeLog.create({
      data: {
        organizationId: org.id,
        repoId: created.id,
        action: "ADD",
        isInitialSetup: initial,
      },
    });

    if (!initial) {
      await tx.organization.update({
        where: { id: org.id },
        data: { repoChangesUsed: { increment: 1 } },
      });
    }

    return created;
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

  // Check repo change limit
  const limits = getRepoLimits(org);
  if (limits.locked) {
    return NextResponse.json(
      { error: "Repo changes exhausted. Contact support to request more changes." },
      { status: 403 },
    );
  }

  const { searchParams } = new URL(request.url);
  const repoId = searchParams.get("id");
  if (!repoId) {
    return NextResponse.json({ error: "Missing repo id" }, { status: 400 });
  }

  // Verify repo belongs to org
  const repo = await prisma.repo.findFirst({
    where: { id: repoId, organizationId: org.id, isActive: true },
  });

  if (!repo) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.repo.update({
      where: { id: repoId },
      data: { isActive: false },
    });

    await tx.repoChangeLog.create({
      data: {
        organizationId: org.id,
        repoId,
        action: "REMOVE",
      },
    });

    await tx.organization.update({
      where: { id: org.id },
      data: { repoChangesUsed: { increment: 1 } },
    });
  });

  return NextResponse.json({ success: true });
}
