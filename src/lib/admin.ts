import { type NextRequest } from "next/server";
import crypto from "crypto";
import { auth } from "./auth";
import { prisma } from "./prisma";

/**
 * Constant-time comparison to prevent timing attacks on CRON_SECRET.
 * Uses crypto.timingSafeEqual to ensure the comparison time does not
 * vary based on where the strings first differ.
 */
function verifyCronSecret(provided: string): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;
  try {
    const a = Buffer.from(provided);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function isAdmin(): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) return false;

  // Check env-based admin email list (comma-separated)
  const adminEmails = process.env.ADMIN_EMAIL?.split(",").map((e) => e.trim().toLowerCase()) ?? [];
  if (session.user.email && adminEmails.includes(session.user.email.toLowerCase())) return true;

  // Check database role
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  return user?.role === "ADMIN";
}

/**
 * Accepts either:
 *  - A valid admin session (web UI), or
 *  - Bearer {CRON_SECRET} header (Claude Code audit pipeline)
 */
export async function isCronOrAdmin(request: NextRequest): Promise<boolean> {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    if (verifyCronSecret(token)) return true;
  }
  return isAdmin();
}
