import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { downloadFileAsText } from "@/lib/r2";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const audit = await prisma.audit.findUnique({
    where: { id },
    select: { reportMdKey: true },
  });

  if (!audit) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!audit.reportMdKey) {
    return NextResponse.json({ error: "No markdown available" }, { status: 404 });
  }

  const text = await downloadFileAsText(audit.reportMdKey);
  return new Response(text, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
