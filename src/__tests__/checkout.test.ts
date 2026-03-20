import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { mockPrisma, mockStripe, mockAuth } from "./setup";
import { POST } from "@/app/api/stripe/checkout/route";

function makeRequest(body: unknown, locale = "ja"): NextRequest {
  return new NextRequest("http://localhost:3000/api/stripe/checkout", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "content-type": "application/json",
      "accept-language": locale === "en" ? "en-US,en;q=0.9" : "ja,en;q=0.9",
    },
  });
}

describe("Checkout Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await POST(makeRequest({ plan: "STARTER", billingCycle: "MONTHLY" }));
    expect(res.status).toBe(401);
  });

  it("returns 400 for invalid request body", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_1" } });
    const res = await POST(makeRequest({ plan: "INVALID" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for non-JSON body", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_1" } });
    const req = new NextRequest("http://localhost:3000/api/stripe/checkout", {
      method: "POST",
      body: "not json",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 404 when user not found in DB", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_1" } });
    mockPrisma.user.findUnique.mockResolvedValue(null);

    const res = await POST(makeRequest({ plan: "STARTER", billingCycle: "MONTHLY" }));
    expect(res.status).toBe(404);
  });

  it("creates a Stripe checkout session for STARTER plan", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_1" } });
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "user_1",
      email: "test@example.com",
      organizationId: "org_1",
      organization: { subscription: null },
    });
    mockStripe.checkout.sessions.create.mockResolvedValue({
      url: "https://checkout.stripe.com/session_123",
    });

    const res = await POST(makeRequest({ plan: "STARTER", billingCycle: "MONTHLY" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.url).toBe("https://checkout.stripe.com/session_123");

    // STARTER should have no onboarding fee
    const createCall = mockStripe.checkout.sessions.create.mock.calls[0][0];
    expect(createCall.line_items).toHaveLength(1);
    expect(createCall.line_items[0].price).toBe("price_starter_m");
    expect(createCall.metadata.plan).toBe("STARTER");
  });

  it("adds onboarding fee for GROWTH plan", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_1" } });
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "user_1",
      email: "test@example.com",
      organizationId: "org_1",
      organization: { subscription: null },
    });
    mockStripe.checkout.sessions.create.mockResolvedValue({ url: "https://checkout.stripe.com/x" });

    await POST(makeRequest({ plan: "GROWTH", billingCycle: "ANNUAL" }));

    const createCall = mockStripe.checkout.sessions.create.mock.calls[0][0];
    expect(createCall.line_items).toHaveLength(2);
    expect(createCall.line_items[0].price).toBe("price_growth_a");
    expect(createCall.line_items[1].price).toBe("price_onboard_growth");
  });

  it("adds onboarding fee for PRO plan", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_1" } });
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "user_1",
      email: "test@example.com",
      organizationId: "org_1",
      organization: { subscription: null },
    });
    mockStripe.checkout.sessions.create.mockResolvedValue({ url: "https://checkout.stripe.com/x" });

    await POST(makeRequest({ plan: "PRO", billingCycle: "MONTHLY" }));

    const createCall = mockStripe.checkout.sessions.create.mock.calls[0][0];
    expect(createCall.line_items).toHaveLength(2);
    expect(createCall.line_items[1].price).toBe("price_onboard_pro");
  });

  it("uses en locale when accept-language is English", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_1" } });
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "user_1",
      email: "test@example.com",
      organizationId: "org_1",
      organization: { subscription: null },
    });
    mockStripe.checkout.sessions.create.mockResolvedValue({ url: "https://checkout.stripe.com/x" });

    await POST(makeRequest({ plan: "STARTER", billingCycle: "MONTHLY" }, "en"));

    const createCall = mockStripe.checkout.sessions.create.mock.calls[0][0];
    expect(createCall.locale).toBe("en");
    expect(createCall.success_url).toContain("/en/dashboard");
  });
});
