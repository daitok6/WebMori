import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const patchSchema = z.object({
  repoChangesAllowed: z.number().int().min(0).max(100),
});

/**
 * PATCH /api/admin/organizations/[id]/repo-changes
 *
 * Admin endpoint to adjust the number of allowed repo changes for an organization.
 * Use this to grant more changes when a client has a valid reason.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: orgId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = patchSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid input", details: result.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const org = await prisma.organization.update({
    where: { id: orgId },
    data: { repoChangesAllowed: result.data.repoChangesAllowed },
    select: {
      id: true,
      name: true,
      repoChangesUsed: true,
      repoChangesAllowed: true,
    },
  });

  return NextResponse.json(org);
}

/**
 * GET /api/admin/organizations/[id]/repo-changes
 *
 * View repo change status for an organization.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: orgId } = await params;

  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: {
      id: true,
      name: true,
      repoChangesUsed: true,
      repoChangesAllowed: true,
      repoChangeLogs: {
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          action: true,
          isInitialSetup: true,
          createdAt: true,
          repoId: true,
        },
      },
    },
  });

  if (!org) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  return NextResponse.json(org);
}
