import { createHmac, timingSafeEqual } from "crypto";
import { env } from "./env";

// ─── LINE Messaging API client ────────────────────────────────────────────────
// Thin wrapper around the LINE Messaging API REST interface.
// All functions are non-fatal — they catch errors and return void, matching
// the pattern used by email.ts / getResend().

const LINE_API_BASE = "https://api.line.me/v2/bot";

interface LineTextMessage {
  type: "text";
  text: string;
}

interface LineFlexContainer {
  type: "bubble" | "carousel";
  [key: string]: unknown;
}

interface LineFlexMessage {
  type: "flex";
  altText: string;
  contents: LineFlexContainer;
}

type LineMessage = LineTextMessage | LineFlexMessage;

/**
 * Returns the LINE channel access token, or null if not configured.
 * Matches the getResend() pattern — call before every LINE operation.
 */
export function getLineToken(): string | null {
  return env.LINE_CHANNEL_ACCESS_TOKEN ?? null;
}

/**
 * Verify LINE webhook signature (X-Line-Signature header).
 * Must be called before processing any webhook event.
 */
export function verifyLineSignature(rawBody: string, signature: string): boolean {
  const secret = env.LINE_CHANNEL_SECRET;
  if (!secret) return false;
  const hmac = createHmac("sha256", secret)
    .update(rawBody)
    .digest("base64");
  try {
    return timingSafeEqual(Buffer.from(hmac), Buffer.from(signature));
  } catch {
    return false;
  }
}

/**
 * Send a plain text push message to a LINE user.
 * Silently returns on error — never throws.
 */
export async function sendLinePush(lineUserId: string, text: string): Promise<void> {
  const token = getLineToken();
  if (!token) return;

  const message: LineTextMessage = { type: "text", text };
  await pushMessages(token, lineUserId, [message]);
}

/**
 * Send a Flex Message (rich card) to a LINE user.
 * Silently returns on error — never throws.
 */
export async function sendLineFlexMessage(
  lineUserId: string,
  altText: string,
  contents: LineFlexContainer,
): Promise<void> {
  const token = getLineToken();
  if (!token) return;

  const message: LineFlexMessage = { type: "flex", altText, contents };
  await pushMessages(token, lineUserId, [message]);
}

/**
 * Reply to a LINE webhook event with a text message.
 * Used in the webhook handler to respond to account linking messages.
 */
export async function replyLineMessage(replyToken: string, text: string): Promise<void> {
  const token = getLineToken();
  if (!token) return;

  await fetch(`${LINE_API_BASE}/message/reply`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      replyToken,
      messages: [{ type: "text", text }],
    }),
  }).catch(() => {});
}

// ─── Flex Message builders ────────────────────────────────────────────────────

/**
 * Build an audit-complete notification card.
 */
export function buildAuditCompleteCard(params: {
  orgName: string;
  repoName: string;
  healthScore?: number | null;
  findingsCount: number;
  reportUrl: string;
}): LineFlexContainer {
  const { orgName, repoName, findingsCount, reportUrl } = params;

  return {
    type: "bubble",
    header: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "text",
          text: "WebMori",
          color: "#D97706",
          size: "sm",
          weight: "bold",
        },
        {
          type: "text",
          text: "監査レポートが完成しました",
          color: "#FFFFFF",
          size: "md",
          weight: "bold",
          margin: "sm",
        },
      ],
      backgroundColor: "#1C1917",
      paddingAll: "20px",
    },
    body: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "text",
          text: orgName,
          weight: "bold",
          size: "md",
          color: "#1C1917",
        },
        {
          type: "text",
          text: repoName,
          size: "sm",
          color: "#78716C",
          margin: "sm",
        },
        {
          type: "separator",
          margin: "md",
        },
        {
          type: "text",
          text: `${findingsCount}件の問題が検出されました`,
          size: "sm",
          color: "#1C1917",
          margin: "md",
        },
        {
          type: "text",
          text: "詳細はダッシュボードでご確認ください。",
          size: "sm",
          color: "#78716C",
          margin: "sm",
          wrap: true,
        },
      ],
      paddingAll: "20px",
    },
    footer: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "button",
          action: {
            type: "uri",
            label: "レポートを確認する",
            uri: reportUrl,
          },
          style: "primary",
          color: "#D97706",
        },
      ],
      paddingAll: "12px",
    },
  };
}

/**
 * Build an audit-scheduled notification card.
 */
export function buildAuditScheduledCard(params: {
  orgName: string;
  auditDateLabel: string;
}): LineFlexContainer {
  return {
    type: "bubble",
    body: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "text",
          text: "WebMori",
          color: "#D97706",
          size: "sm",
          weight: "bold",
        },
        {
          type: "text",
          text: "次回の監査スケジュール",
          weight: "bold",
          size: "md",
          color: "#1C1917",
          margin: "sm",
        },
        {
          type: "separator",
          margin: "md",
        },
        {
          type: "text",
          text: params.orgName,
          size: "sm",
          color: "#78716C",
          margin: "md",
        },
        {
          type: "text",
          text: `📅 ${params.auditDateLabel}`,
          size: "md",
          weight: "bold",
          color: "#1C1917",
          margin: "sm",
        },
      ],
      paddingAll: "20px",
    },
  };
}

// ─── Internal ─────────────────────────────────────────────────────────────────

async function pushMessages(
  token: string,
  lineUserId: string,
  messages: LineMessage[],
): Promise<void> {
  await fetch(`${LINE_API_BASE}/message/push`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ to: lineUserId, messages }),
  }).catch(() => {});
}
