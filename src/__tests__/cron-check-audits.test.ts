import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { mockPrisma } from "./setup";
import { GET } from "@/app/api/cron/check-audits/route";

// The cron route reads process.env.CRON_SECRET directly
vi.stubEnv("CRON_SECRET", "test-cron-secret");

function makeRequest(token?: string): NextRequest {
  const headers: Record<string, string> = {};
  if (token) {
    headers.authorization = `Bearer ${token}`;
  }
  return new NextRequest("http://localhost:3000/api/cron/check-audits", { headers });
}

describe("Cron: Check Audits", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-20T10:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 401 without authorization header", async () => {
    const res = await GET(makeRequest());
    expect(res.status).toBe(401);
  });

  it("returns 401 with wrong token", async () => {
    const res = await GET(makeRequest("wrong-token"));
    expect(res.status).toBe(401);
  });

  it("returns empty list when no active subscriptions", async () => {
    mockPrisma.subscription.findMany.mockResolvedValue([]);
    const res = await GET(makeRequest("test-cron-secret"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.scheduled).toBe(0);
    expect(body.audits).toEqual([]);
  });

  it("schedules audits for repos that are due (STARTER = 30 days)", async () => {
    mockPrisma.subscription.findMany.mockResolvedValue([
      {
        plan: "STARTER",
        organization: {
          id: "org_1",
          name: "Test Org",
          repos: [
            {
              id: "repo_1",
              name: "My Site",
              url: "https://example.com",
              isActive: true,
              audits: [
                { createdAt: new Date("2026-02-01T00:00:00Z") }, // 47 days ago
              ],
            },
          ],
        },
      },
    ]);
    mockPrisma.audit.create.mockResolvedValue({});

    const res = await GET(makeRequest("test-cron-secret"));
    const body = await res.json();
    expect(body.scheduled).toBe(1);
    expect(body.audits[0]).toEqual({
      orgName: "Test Org",
      repoName: "My Site",
      repoUrl: "https://example.com",
    });
    expect(mockPrisma.audit.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        organizationId: "org_1",
        repoId: "repo_1",
        status: "SCHEDULED",
      }),
    });
  });

  it("skips repos with recent audits (STARTER, 15 days ago < 30)", async () => {
    mockPrisma.subscription.findMany.mockResolvedValue([
      {
        plan: "STARTER",
        organization: {
          id: "org_1",
          name: "Test Org",
          repos: [
            {
              id: "repo_1",
              name: "My Site",
              url: "https://example.com",
              isActive: true,
              audits: [
                { createdAt: new Date("2026-03-05T00:00:00Z") }, // 15 days ago
              ],
            },
          ],
        },
      },
    ]);

    const res = await GET(makeRequest("test-cron-secret"));
    const body = await res.json();
    expect(body.scheduled).toBe(0);
    expect(mockPrisma.audit.create).not.toHaveBeenCalled();
  });

  it("uses 14-day interval for GROWTH plan", async () => {
    mockPrisma.subscription.findMany.mockResolvedValue([
      {
        plan: "GROWTH",
        organization: {
          id: "org_1",
          name: "Growth Org",
          repos: [
            {
              id: "repo_1",
              name: "Growth Site",
              url: "https://growth.com",
              isActive: true,
              audits: [
                { createdAt: new Date("2026-03-05T00:00:00Z") }, // 15 days ago
              ],
            },
          ],
        },
      },
    ]);
    mockPrisma.audit.create.mockResolvedValue({});

    const res = await GET(makeRequest("test-cron-secret"));
    const body = await res.json();
    expect(body.scheduled).toBe(1); // 15 >= 14
  });

  it("uses 7-day interval for PRO plan", async () => {
    mockPrisma.subscription.findMany.mockResolvedValue([
      {
        plan: "PRO",
        organization: {
          id: "org_1",
          name: "Pro Org",
          repos: [
            {
              id: "repo_1",
              name: "Pro Site",
              url: "https://pro.com",
              isActive: true,
              audits: [
                { createdAt: new Date("2026-03-12T00:00:00Z") }, // 8 days ago
              ],
            },
          ],
        },
      },
    ]);
    mockPrisma.audit.create.mockResolvedValue({});

    const res = await GET(makeRequest("test-cron-secret"));
    const body = await res.json();
    expect(body.scheduled).toBe(1); // 8 >= 7
  });

  it("schedules audit for repos with no prior audits", async () => {
    mockPrisma.subscription.findMany.mockResolvedValue([
      {
        plan: "STARTER",
        organization: {
          id: "org_1",
          name: "New Org",
          repos: [
            {
              id: "repo_new",
              name: "New Site",
              url: "https://new.com",
              isActive: true,
              audits: [], // No audits
            },
          ],
        },
      },
    ]);
    mockPrisma.audit.create.mockResolvedValue({});

    const res = await GET(makeRequest("test-cron-secret"));
    const body = await res.json();
    expect(body.scheduled).toBe(1);
  });

  it("skips orgs with no repos", async () => {
    mockPrisma.subscription.findMany.mockResolvedValue([
      {
        plan: "STARTER",
        organization: {
          id: "org_empty",
          name: "Empty Org",
          repos: [],
        },
      },
    ]);

    const res = await GET(makeRequest("test-cron-secret"));
    const body = await res.json();
    expect(body.scheduled).toBe(0);
  });
});
