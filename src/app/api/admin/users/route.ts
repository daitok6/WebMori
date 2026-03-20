import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const plan = searchParams.get("plan");
  const stack = searchParams.get("stack");
  const search = searchParams.get("search");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const pageSize = 20;

  const where = {
    ...(search && {
      OR: [
        { email: { contains: search, mode: "insensitive" as const } },
        { name: { contains: search, mode: "insensitive" as const } },
      ],
    }),
    ...(plan || stack
      ? {
          organization: {
            ...(plan && {
              subscription: { plan: plan as "STARTER" | "GROWTH" | "PRO" },
            }),
          },
        }
      : {}),
  };

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      include: {
        organization: {
          include: {
            subscription: true,
            repos: { where: { isActive: true }, select: { stack: true } },
            _count: { select: { audits: true, messages: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: pageSize,
      skip: (page - 1) * pageSize,
    }),
  ]);

  return NextResponse.json({
    page,
    totalPages: Math.ceil(total / pageSize),
    total,
    users: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      bio: u.bio,
      createdAt: u.createdAt.toISOString(),
      org: u.organization
        ? {
            id: u.organization.id,
            name: u.organization.name,
            website: u.organization.website,
            plan: u.organization.subscription?.plan ?? null,
            status: u.organization.subscription?.status ?? null,
            repoCount: u.organization.repos.length,
            auditCount: u.organization._count.audits,
            messageCount: u.organization._count.messages,
            stacks: [
              ...new Set(u.organization.repos.map((r) => r.stack)),
            ],
          }
        : null,
    })),
  });
}
