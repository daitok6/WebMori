import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { organization: { include: { subscription: true } } },
  });

  const customerId = user?.organization?.subscription?.stripeCustomerId;
  if (!customerId) {
    return NextResponse.json(
      { error: "No active subscription" },
      { status: 400 },
    );
  }

  const locale = request.headers.get("accept-language")?.startsWith("en")
    ? "en"
    : "ja";

  const portalSession = await getStripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: `${request.nextUrl.origin}/${locale}/dashboard/billing`,
  });

  return NextResponse.json({ url: portalSession.url });
}
