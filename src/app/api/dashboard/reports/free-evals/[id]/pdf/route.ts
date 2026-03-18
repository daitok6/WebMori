import { NextRequest, NextResponse } from "next/server";
import { getCurrentOrg } from "@/lib/dashboard";
import { prisma } from "@/lib/prisma";
import { getSignedDownloadUrl } from "@/lib/r2";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const org = await getCurrentOrg();
  if (!org) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const report = await prisma.freeEvalReport.findUnique({ where: { id } });
  if (!report || report.organizationId !== org.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const url = await getSignedDownloadUrl(report.pdfKey);
  return NextResponse.redirect(url);
}
