import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { getSignedDownloadUrl } from "@/lib/r2";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const audit = await prisma.audit.findUnique({
    where: { id },
    select: { reportPdfUrl: true, findingsPdfUrl: true },
  });

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

  const key = pdfUrl.startsWith("http")
    ? new URL(pdfUrl).pathname.slice(1)
    : pdfUrl;

  const signedUrl = await getSignedDownloadUrl(key);
  return NextResponse.redirect(signedUrl);
}
