/**
 * Compute a 0–100 health score for an organization based on:
 * - Current open findings (severity-weighted deductions)
 * - Fix rate bonus (if >80% of findings were auto-fixed)
 * - Monitor bonus (if all daily checks are passing)
 *
 * Returns the numeric score and a letter grade.
 */
import { prisma } from "./prisma";

export interface HealthScore {
  score: number;
  grade: "A" | "B" | "C" | "D" | "F";
  label: string;         // Japanese label
  labelEn: string;       // English label
  totalFindings: number;
  fixedFindings: number;
  fixRate: number;       // 0–100
  allChecksOk: boolean;
}

const GRADE_THRESHOLDS = [
  { min: 90, grade: "A" as const, label: "優秀", labelEn: "Excellent" },
  { min: 75, grade: "B" as const, label: "良好", labelEn: "Good" },
  { min: 55, grade: "C" as const, label: "改善余地あり", labelEn: "Needs improvement" },
  { min: 35, grade: "D" as const, label: "要注意", labelEn: "At risk" },
  { min: 0,  grade: "F" as const, label: "危険", labelEn: "Critical" },
];

export async function computeHealthScore(organizationId: string): Promise<HealthScore> {
  // Latest delivered/completed audit findings (most recent audit per org)
  const latestAudit = await prisma.audit.findFirst({
    where: {
      organizationId,
      status: { in: ["DELIVERED", "COMPLETED"] },
    },
    orderBy: { createdAt: "desc" },
    select: {
      findings: {
        select: { severity: true, prUrl: true },
      },
    },
  });

  const findings = latestAudit?.findings ?? [];
  const totalFindings = findings.length;
  const fixedFindings = findings.filter((f) => f.prUrl).length;
  const fixRate = totalFindings > 0 ? Math.round((fixedFindings / totalFindings) * 100) : 100;

  // Severity deductions
  let score = 100;
  for (const f of findings) {
    if (f.prUrl) continue; // Already fixed — don't penalize
    if (f.severity === "CRITICAL") score -= 20;
    else if (f.severity === "HIGH") score -= 10;
    else if (f.severity === "MEDIUM") score -= 5;
    else score -= 2;
  }

  // Fix rate bonus
  if (fixRate >= 80) score += 20;
  else if (fixRate >= 50) score += 10;

  // Monitor bonus — check if the latest checks for this org are all OK
  const latestChecks = await prisma.monitorCheck.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    distinct: ["repoId", "checkType"],
    select: { status: true },
  });
  const allChecksOk = latestChecks.length > 0 && latestChecks.every((c) => c.status === "OK");
  if (allChecksOk) score += 10;

  const finalScore = Math.max(0, Math.min(100, score));

  const { grade, label, labelEn } =
    GRADE_THRESHOLDS.find((t) => finalScore >= t.min) ?? GRADE_THRESHOLDS[GRADE_THRESHOLDS.length - 1];

  return { score: finalScore, grade, label, labelEn, totalFindings, fixedFindings, fixRate, allChecksOk };
}
