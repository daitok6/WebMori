import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { mockPrisma, mockStripe } from "./setup";
import { POST } from "@/app/api/stripe/webhook/route";

function makeRequest(body: string, signature = "valid_sig"): NextRequest {
  return new NextRequest("http://localhost:3000/api/stripe/webhook", {
    method: "POST",
    body,
    headers: { "stripe-signature": signature },
  });
}

// Helper to build a Stripe-like event object
function makeEvent(type: string, data: Record<string, unknown>, id = "evt_test_123") {
  return { id, type, data: { object: data } };
}

describe("Stripe Webhook Handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: idempotency check passes (event is new)
    mockPrisma.stripeEvent.create.mockResolvedValue({ id: "evt_test_123" });
  });

  // ─── Signature Validation ───────────────────────────────────────────

  it("returns 400 when stripe-signature header is missing", async () => {
    const req = new NextRequest("http://localhost:3000/api/stripe/webhook", {
      method: "POST",
      body: "{}",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Missing signature" });
  });

  it("returns 400 when signature is invalid", async () => {
    mockStripe.webhooks.constructEvent.mockImplementation(() => {
      throw new Error("Invalid signature");
    });
    const res = await POST(makeRequest("{}"));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Invalid signature" });
  });

  // ─── Idempotency ───────────────────────────────────────────────────

  it("skips duplicate events gracefully", async () => {
    const event = makeEvent("checkout.session.completed", {});
    mockStripe.webhooks.constructEvent.mockReturnValue(event);

    // Simulate P2002 unique constraint violation
    const { Prisma } = await import("@/generated/prisma/client");
    mockPrisma.stripeEvent.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Unique constraint", { code: "P2002" }),
    );

    const res = await POST(makeRequest("{}"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.duplicate).toBe(true);
  });

  it("re-throws non-duplicate Prisma errors", async () => {
    const event = makeEvent("checkout.session.completed", {});
    mockStripe.webhooks.constructEvent.mockReturnValue(event);
    mockPrisma.stripeEvent.create.mockRejectedValue(new Error("DB down"));

    await expect(POST(makeRequest("{}"))).rejects.toThrow("DB down");
  });

  // ─── checkout.session.completed ─────────────────────────────────────

  describe("checkout.session.completed", () => {
    it("creates subscription for user with existing org", async () => {
      const session = {
        metadata: {
          userId: "user_1",
          organizationId: "org_1",
          plan: "STARTER",
          billingCycle: "MONTHLY",
        },
        customer: "cus_123",
        subscription: "sub_123",
      };
      const event = makeEvent("checkout.session.completed", session);
      mockStripe.webhooks.constructEvent.mockReturnValue(event);
      mockPrisma.subscription.upsert.mockResolvedValue({});

      const res = await POST(makeRequest("{}"));
      expect(res.status).toBe(200);
      expect(mockPrisma.subscription.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { organizationId: "org_1" },
          create: expect.objectContaining({
            plan: "STARTER",
            billingCycle: "MONTHLY",
            status: "ACTIVE",
            stripeCustomerId: "cus_123",
            stripeSubscriptionId: "sub_123",
          }),
        }),
      );
    });

    it("creates org when organizationId is missing", async () => {
      const session = {
        metadata: { userId: "user_1", organizationId: "", plan: "GROWTH", billingCycle: "ANNUAL" },
        customer: "cus_456",
        subscription: "sub_456",
      };
      const event = makeEvent("checkout.session.completed", session);
      mockStripe.webhooks.constructEvent.mockReturnValue(event);
      mockPrisma.user.findUnique.mockResolvedValue({ id: "user_1", name: "Test", email: "t@t.com" });
      mockPrisma.organization.create.mockResolvedValue({ id: "org_new" });
      mockPrisma.user.update.mockResolvedValue({});
      mockPrisma.subscription.upsert.mockResolvedValue({});

      const res = await POST(makeRequest("{}"));
      expect(res.status).toBe(200);
      expect(mockPrisma.organization.create).toHaveBeenCalled();
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "user_1" },
          data: { organizationId: "org_new" },
        }),
      );
    });

    it("ignores invalid plan values", async () => {
      const session = {
        metadata: { userId: "user_1", organizationId: "org_1", plan: "INVALID" },
        customer: "cus_789",
        subscription: "sub_789",
      };
      const event = makeEvent("checkout.session.completed", session);
      mockStripe.webhooks.constructEvent.mockReturnValue(event);

      const res = await POST(makeRequest("{}"));
      expect(res.status).toBe(200);
      expect(mockPrisma.subscription.upsert).not.toHaveBeenCalled();
    });

    it("ignores events with missing userId", async () => {
      const session = {
        metadata: { plan: "STARTER" },
        customer: "cus_000",
        subscription: "sub_000",
      };
      const event = makeEvent("checkout.session.completed", session);
      mockStripe.webhooks.constructEvent.mockReturnValue(event);

      const res = await POST(makeRequest("{}"));
      expect(res.status).toBe(200);
      expect(mockPrisma.subscription.upsert).not.toHaveBeenCalled();
    });
  });

  // ─── customer.subscription.updated ──────────────────────────────────

  describe("customer.subscription.updated", () => {
    it("updates subscription status and period dates", async () => {
      const subscription = {
        id: "sub_123",
        status: "active",
        items: {
          data: [
            {
              current_period_start: 1700000000,
              current_period_end: 1702592000,
            },
          ],
        },
      };
      const event = makeEvent("customer.subscription.updated", subscription);
      mockStripe.webhooks.constructEvent.mockReturnValue(event);
      mockPrisma.subscription.findUnique.mockResolvedValue({ id: "db_sub_1" });
      mockPrisma.subscription.update.mockResolvedValue({});

      const res = await POST(makeRequest("{}"));
      expect(res.status).toBe(200);
      expect(mockPrisma.subscription.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "db_sub_1" },
          data: expect.objectContaining({
            status: "ACTIVE",
            currentPeriodStart: new Date(1700000000 * 1000),
            currentPeriodEnd: new Date(1702592000 * 1000),
          }),
        }),
      );
    });

    it("maps past_due status correctly", async () => {
      const subscription = { id: "sub_123", status: "past_due", items: { data: [] } };
      const event = makeEvent("customer.subscription.updated", subscription);
      mockStripe.webhooks.constructEvent.mockReturnValue(event);
      mockPrisma.subscription.findUnique.mockResolvedValue({ id: "db_sub_1" });
      mockPrisma.subscription.update.mockResolvedValue({});

      await POST(makeRequest("{}"));
      expect(mockPrisma.subscription.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: "PAST_DUE" }),
        }),
      );
    });

    it("skips when subscription not found in DB", async () => {
      const subscription = { id: "sub_unknown", status: "active", items: { data: [] } };
      const event = makeEvent("customer.subscription.updated", subscription);
      mockStripe.webhooks.constructEvent.mockReturnValue(event);
      mockPrisma.subscription.findUnique.mockResolvedValue(null);

      const res = await POST(makeRequest("{}"));
      expect(res.status).toBe(200);
      expect(mockPrisma.subscription.update).not.toHaveBeenCalled();
    });
  });

  // ─── customer.subscription.deleted ──────────────────────────────────

  describe("customer.subscription.deleted", () => {
    it("marks subscription as CANCELED", async () => {
      const subscription = { id: "sub_123" };
      const event = makeEvent("customer.subscription.deleted", subscription);
      mockStripe.webhooks.constructEvent.mockReturnValue(event);
      mockPrisma.subscription.updateMany.mockResolvedValue({ count: 1 });

      const res = await POST(makeRequest("{}"));
      expect(res.status).toBe(200);
      expect(mockPrisma.subscription.updateMany).toHaveBeenCalledWith({
        where: { stripeSubscriptionId: "sub_123" },
        data: { status: "CANCELED" },
      });
    });
  });

  // ─── invoice.payment_succeeded ──────────────────────────────────────

  describe("invoice.payment_succeeded", () => {
    it("creates a payment record", async () => {
      const invoice = {
        id: "inv_123",
        amount_paid: 19800,
        currency: "jpy",
        parent: {
          subscription_details: { subscription: "sub_123" },
        },
      };
      const event = makeEvent("invoice.payment_succeeded", invoice);
      mockStripe.webhooks.constructEvent.mockReturnValue(event);
      mockPrisma.subscription.findUnique.mockResolvedValue({ id: "db_sub_1" });
      mockPrisma.payment.create.mockResolvedValue({});

      const res = await POST(makeRequest("{}"));
      expect(res.status).toBe(200);
      expect(mockPrisma.payment.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          subscriptionId: "db_sub_1",
          amount: 19800,
          currency: "jpy",
          status: "succeeded",
          stripeInvoiceId: "inv_123",
        }),
      });
    });

    it("handles duplicate payment gracefully (P2002)", async () => {
      const invoice = {
        id: "inv_dup",
        amount_paid: 19800,
        currency: "jpy",
        parent: { subscription_details: { subscription: "sub_123" } },
      };
      const event = makeEvent("invoice.payment_succeeded", invoice);
      mockStripe.webhooks.constructEvent.mockReturnValue(event);
      mockPrisma.subscription.findUnique.mockResolvedValue({ id: "db_sub_1" });

      const { Prisma } = await import("@/generated/prisma/client");
      mockPrisma.payment.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError("Unique constraint", { code: "P2002" }),
      );

      const res = await POST(makeRequest("{}"));
      expect(res.status).toBe(200);
    });

    it("skips when no subscription ID in invoice", async () => {
      const invoice = { id: "inv_no_sub", amount_paid: 0, currency: "jpy", parent: null };
      const event = makeEvent("invoice.payment_succeeded", invoice);
      mockStripe.webhooks.constructEvent.mockReturnValue(event);

      const res = await POST(makeRequest("{}"));
      expect(res.status).toBe(200);
      expect(mockPrisma.payment.create).not.toHaveBeenCalled();
    });
  });

  // ─── invoice.payment_failed ─────────────────────────────────────────

  describe("invoice.payment_failed", () => {
    it("creates a failed payment record and marks subscription PAST_DUE", async () => {
      const invoice = {
        id: "inv_fail",
        amount_due: 39800,
        currency: "jpy",
        parent: { subscription_details: { subscription: "sub_123" } },
      };
      const event = makeEvent("invoice.payment_failed", invoice);
      mockStripe.webhooks.constructEvent.mockReturnValue(event);
      mockPrisma.subscription.findUnique.mockResolvedValue({ id: "db_sub_1" });
      mockPrisma.payment.create.mockResolvedValue({});
      mockPrisma.subscription.update.mockResolvedValue({});

      const res = await POST(makeRequest("{}"));
      expect(res.status).toBe(200);
      expect(mockPrisma.payment.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: "failed",
          amount: 39800,
        }),
      });
      expect(mockPrisma.subscription.update).toHaveBeenCalledWith({
        where: { id: "db_sub_1" },
        data: { status: "PAST_DUE" },
      });
    });
  });

  // ─── Unknown event types ────────────────────────────────────────────

  it("returns 200 for unknown event types", async () => {
    const event = makeEvent("some.unknown.event", {});
    mockStripe.webhooks.constructEvent.mockReturnValue(event);

    const res = await POST(makeRequest("{}"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ received: true });
  });
});
