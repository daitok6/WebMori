import { esc } from "./email";

const WARM_DARK = "#1C1917";
const AMBER = "#D97706";
const CREAM = "#FAFAF9";
const BORDER = "#E7E5E4";
const TEXT = "#1C1917";
const TEXT_MUTED = "#78716C";

/**
 * Build a branded WebMori email.
 *
 * @param body  Inner HTML content (already escaped where needed)
 */
export function buildEmail(body: string): string {
  return `<body style="background:${CREAM};font-family:-apple-system,sans-serif;margin:0;padding:20px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:auto;">
    <tr>
      <td style="background:${WARM_DARK};padding:24px 32px;border-radius:8px 8px 0 0;">
        <span style="color:${AMBER};font-size:20px;font-weight:bold;">Web<span style="color:white;">Mori</span></span>
      </td>
    </tr>
    <tr>
      <td style="background:white;padding:32px;border:1px solid ${BORDER};border-top:none;border-radius:0 0 8px 8px;">
        ${body}
      </td>
    </tr>
  </table>
</body>`;
}

/**
 * Build an HTML key-value table for notifications.
 */
export function buildKVTable(rows: [string, string][]): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
    ${rows
      .map(
        ([label, value]) =>
          `<tr>
            <td style="padding:10px 0;border-bottom:1px solid ${BORDER};color:${TEXT_MUTED};font-size:13px;width:140px;vertical-align:top;">${label}</td>
            <td style="padding:10px 0;border-bottom:1px solid ${BORDER};color:${TEXT};font-size:13px;">${value}</td>
          </tr>`,
      )
      .join("")}
  </table>`;
}

/**
 * Build a paragraph-style email body.
 */
export function buildParagraph(greeting: string, content: string): string {
  return `<p style="margin:0 0 16px;color:${WARM_DARK};font-size:16px;">${esc(greeting)}</p>
  <p style="margin:0 0 16px;color:${TEXT};font-size:14px;line-height:1.7;">${content}</p>
  <p style="margin:24px 0 0;color:${TEXT_MUTED};font-size:13px;">
    WebMori（ウェブ守り）<br>
    <a href="https://webmori.jp" style="color:${AMBER};">webmori.jp</a>
  </p>`;
}
