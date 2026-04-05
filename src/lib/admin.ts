import { type NextRequest } from "next/server";
import { auth } from "./auth";
import { prisma } from "./prisma";

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
  if (authHeader && authHeader === `Bearer ${process.env.CRON_SECRET}`) {
    return true;
  }
  return isAdmin();
}
