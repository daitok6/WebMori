import { prisma } from "./prisma";

/**
 * Generate a sequential report code in format WM-YYYYMM-XXX.
 * Must be called inside a Prisma transaction to avoid race conditions.
 */
export async function generateReportCode(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
): Promise<string> {
  const now = new Date();
  const prefix = `WM-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;

  const latest = await tx.audit.findFirst({
    where: { reportCode: { startsWith: prefix } },
    orderBy: { reportCode: "desc" },
    select: { reportCode: true },
  });

  const seq = latest?.reportCode
    ? parseInt(latest.reportCode.split("-")[2], 10) + 1
    : 1;

  return `${prefix}-${String(seq).padStart(3, "0")}`;
}
