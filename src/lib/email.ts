import { Resend } from "resend";

// ---------------------------------------------------------------------------
// HTML escaping — prevents HTML injection in email templates
// ---------------------------------------------------------------------------
export function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ---------------------------------------------------------------------------
// Shared Resend singleton (returns null when API key is not configured)
// ---------------------------------------------------------------------------
let _resend: Resend | null | undefined;

export function getResend(): Resend | null {
  if (_resend === undefined) {
    _resend = process.env.RESEND_API_KEY
      ? new Resend(process.env.RESEND_API_KEY)
      : null;
  }
  return _resend;
}

// ---------------------------------------------------------------------------
// Shared sender address
// ---------------------------------------------------------------------------
export const EMAIL_FROM =
  process.env.EMAIL_FROM ?? "WebMori <noreply@webmori.jp>";
