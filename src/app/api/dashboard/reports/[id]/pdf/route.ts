import { NextRequest, NextResponse } from "next/server";
import { getCurrentOrg, getAuditById } from "@/lib/dashboard";
import { getSignedDownloadUrl } from "@/lib/r2";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const org = await getCurrentOrg();
  if (!org) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const audit = await getAuditById(id, org.id);

  if (!audit) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  const pdfUrl =
    type === "findings" ? audit.findingsPdfUrl : audit.reportPdfUrl;

  if (!pdfUrl) {
    return NextResponse.json({ error: "PDF not available" }, { status: 404 });
  }

  // Extract R2 key from stored URL
  const key = pdfUrl.startsWith("http")
    ? new URL(pdfUrl).pathname.slice(1)
    : pdfUrl;

  const signedUrl = await getSignedDownloadUrl(key);
  return NextResponse.redirect(signedUrl);
}
