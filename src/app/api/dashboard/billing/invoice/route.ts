import { NextRequest, NextResponse } from "next/server";
import { getCurrentOrg } from "@/lib/dashboard";
import { getStripe } from "@/lib/stripe";

export async function GET(request: NextRequest) {
  const org = await getCurrentOrg();
  if (!org) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const invoiceId = request.nextUrl.searchParams.get("id");
  if (!invoiceId) {
    return NextResponse.json({ error: "Missing invoice ID" }, { status: 400 });
  }

  try {
    const stripe = getStripe();
    const invoice = await stripe.invoices.retrieve(invoiceId);

    // Verify this invoice belongs to the requesting org's Stripe customer
    if (invoice.customer !== org.subscription?.stripeCustomerId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const url = invoice.hosted_invoice_url ?? invoice.invoice_pdf;
    if (!url) {
      return NextResponse.json({ error: "Invoice not available" }, { status: 404 });
    }

    return NextResponse.redirect(url);
  } catch {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }
}
