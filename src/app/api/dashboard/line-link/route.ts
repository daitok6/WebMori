import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

const LINK_TOKEN_TTL_MINUTES = 15;

function generateLinkToken(): string {
  // 6-character alphanumeric (uppercase), easy to type
  return randomBytes(4).toString("hex").toUpperCase().slice(0, 6);
}

async function getOrg(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      organizationId: true,
      organization: {
        select: {
          id: true,
          name: true,
          lineUserId: true,
          lineLinkToken: true,
          lineLinkTokenExpiry: true,
          lineNotifications: true,
        },
      },
    },
  });
  return user?.organization ?? null;
}

/**
 * GET /api/dashboard/line-link
 * Returns current LINE link status for the authenticated org.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const org = await getOrg(session.user.id);
  if (!org) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  return NextResponse.json({
    linked: !!org.lineUserId,
    notifications: org.lineNotifications,
    // Include active token if not expired (so UI can display it without re-generating)
    activeToken:
      org.lineLinkToken && org.lineLinkTokenExpiry && org.lineLinkTokenExpiry > new Date()
        ? org.lineLinkToken
        : null,
    tokenExpiry: org.lineLinkTokenExpiry?.toISOString() ?? null,
  });
}

/**
 * POST /api/dashboard/line-link
 * Generate a new 6-char link token with 15-minute expiry.
 * The user sends this code to the LINE Official Account to link their account.
 */
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const org = await getOrg(session.user.id);
  if (!org) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  const token = generateLinkToken();
  const expiry = new Date(Date.now() + LINK_TOKEN_TTL_MINUTES * 60 * 1000);

  await prisma.organization.update({
    where: { id: org.id },
    data: { lineLinkToken: token, lineLinkTokenExpiry: expiry },
  });

  return NextResponse.json({
    token,
    expiresAt: expiry.toISOString(),
    expiresInMinutes: LINK_TOKEN_TTL_MINUTES,
  });
}

/**
 * DELETE /api/dashboard/line-link
 * Unlink the org's LINE account.
 */
export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const org = await getOrg(session.user.id);
  if (!org) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  await prisma.organization.update({
    where: { id: org.id },
    data: { lineUserId: null, lineLinkToken: null, lineLinkTokenExpiry: null },
  });

  return NextResponse.json({ ok: true });
}

/**
 * PATCH /api/dashboard/line-link
 * Update LINE notification preference.
 */
export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { notifications?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const org = await getOrg(session.user.id);
  if (!org) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  if (typeof body.notifications === "boolean") {
    await prisma.organization.update({
      where: { id: org.id },
      data: { lineNotifications: body.notifications },
    });
  }

  return NextResponse.json({ ok: true });
}
