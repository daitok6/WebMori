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
    if (!userId) continue;

    if (event.type === "follow") {
      // User added the Official Account as a friend.
      // Nothing to do yet — they still need to send their link code.
      await replyLineMessage(
        (event as LineFollowEvent).replyToken,
        "WebMoriをご利用いただきありがとうございます！\n\nこのアカウントは通知専用です。監査レポートの完成やアラートをお知らせします。\n\nアカウントを連携するには、ダッシュボードの設定画面から連携コードを確認し、こちらに送信してください。",
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
        // Not a link code — this is a notification-only account
        await replyLineMessage(
          msgEvent.replyToken,
          "このアカウントは通知専用です。\n\nご質問・お問い合わせはダッシュボードのメッセージ機能からお送りください。\nhttps://webmori.jp/ja/dashboard/messages",
        );
      }
    }
  }

  return NextResponse.json({ ok: true });
}
