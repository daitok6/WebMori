import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyLineSignature, replyLineMessage } from "@/lib/line";

// LINE platform event types we handle
interface LineEventSource {
  type: string;
  userId?: string;
}

interface LineTextMessageEvent {
  type: "message";
  replyToken: string;
  source: LineEventSource;
  message: { type: "text"; text: string };
}

interface LineFollowEvent {
  type: "follow";
  replyToken: string;
  source: LineEventSource;
}

interface LineUnfollowEvent {
  type: "unfollow";
  source: LineEventSource;
}

type LineEvent = LineTextMessageEvent | LineFollowEvent | LineUnfollowEvent | { type: string; source: LineEventSource };

interface LineWebhookBody {
  events: LineEvent[];
}

export async function POST(request: NextRequest) {
  // LINE requires 200 for all webhook requests — return early on auth failure
  // to prevent LINE from retrying indefinitely
  const signature = request.headers.get("x-line-signature") ?? "";
  const rawBody = await request.text();

  if (!verifyLineSignature(rawBody, signature)) {
    // Still return 200 to prevent LINE retry storms
    return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 200 });
  }

  let body: LineWebhookBody;
  try {
    body = JSON.parse(rawBody) as LineWebhookBody;
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }

  // Process events in sequence (LINE guarantees delivery order)
  for (const event of body.events) {
    const userId = event.source?.userId;
    // Temporary: log userId to help operator find their OPERATOR_LINE_USER_ID
    console.log(`[LINE webhook] event=${event.type} userId=${userId ?? "none"}`);
    if (!userId) continue;

    if (event.type === "follow") {
      // User added the Official Account as a friend.
      // Nothing to do yet — they still need to send their link code.
      await replyLineMessage(
        (event as LineFollowEvent).replyToken,
        "WebMoriをご利用いただきありがとうございます！\n\nダッシュボードの設定画面からLINE連携コードを確認し、こちらに送信してください。",
      );
    } else if (event.type === "unfollow") {
      // User blocked or unfriended — clear their LINE link
      await prisma.organization.updateMany({
        where: { lineUserId: userId },
        data: { lineUserId: null },
      });
    } else if (event.type === "message") {
      const msgEvent = event as LineTextMessageEvent;
      if (msgEvent.message.type !== "text") continue;

      const text = msgEvent.message.text.trim().toUpperCase();

      // Check if this message matches an active link token
      const org = await prisma.organization.findFirst({
        where: {
          lineLinkToken: text,
          lineLinkTokenExpiry: { gt: new Date() },
        },
      });

      if (org) {
        // Link this LINE userId to the organization
        await prisma.organization.update({
          where: { id: org.id },
          data: {
            lineUserId: userId,
            lineLinkToken: null,
            lineLinkTokenExpiry: null,
          },
        });

        await replyLineMessage(
          msgEvent.replyToken,
          `${org.name} のLINE連携が完了しました！\n\n今後、監査レポートの完成や重要なお知らせをLINEでお届けします。`,
        );
      } else {
        // Unrecognized message or expired token
        await replyLineMessage(
          msgEvent.replyToken,
          "認識できないコードです。ダッシュボードの設定画面から最新の連携コードをご確認ください。\n\nコードの有効期限は15分です。",
        );
      }
    }
  }

  return NextResponse.json({ ok: true });
}
