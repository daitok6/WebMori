import { auth } from "./auth";

export async function isAdmin(): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.email) return false;
  const adminEmail = process.env.ADMIN_EMAIL ?? "daito.k631@gmail.com";
  return session.user.email === adminEmail;
}
