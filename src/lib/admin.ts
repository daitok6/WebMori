import { auth } from "./auth";
import { prisma } from "./prisma";

export async function isAdmin(): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) return false;

  // Check env-based admin email (backwards compatible)
  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail && session.user.email === adminEmail) return true;

  // Check database role
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  return user?.role === "ADMIN";
}
