/**
 * Lightweight daily health checks for client sites.
 * All checks are URL-based — no repo access required.
 * Designed to run inside a Vercel serverless function (Node.js runtime).
 */
import https from "https";

export type CheckStatus = "OK" | "WARNING" | "CRITICAL";

export interface CheckResult {
  status: CheckStatus;
  value: string;
  responseTimeMs?: number;
}

// ─── Uptime ──────────────────────────────────────────────

export async function checkUptime(url: string): Promise<CheckResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  const start = Date.now();
  try {
    const res = await fetch(url, { signal: controller.signal, method: "HEAD" });
    const ms = Date.now() - start;
    clearTimeout(timeout);
    if (res.status >= 500) return { status: "CRITICAL", value: `HTTP ${res.status}`, responseTimeMs: ms };
    if (res.status >= 400) return { status: "WARNING", value: `HTTP ${res.status}`, responseTimeMs: ms };
    if (ms > 5_000) return { status: "WARNING", value: `Slow response (${ms}ms)`, responseTimeMs: ms };
    return { status: "OK", value: `HTTP ${res.status} (${ms}ms)`, responseTimeMs: ms };
  } catch {
    clearTimeout(timeout);
    return { status: "CRITICAL", value: "Unreachable" };
  }
}

// ─── SSL Expiry ───────────────────────────────────────────

export function checkSSLExpiry(url: string): Promise<CheckResult> {
  try {
    const { hostname, protocol } = new URL(url);
    if (protocol !== "https:") {
      return Promise.resolve({ status: "CRITICAL", value: "Not using HTTPS" });
    }
    return new Promise((resolve) => {
      const req = https.request({ hostname, method: "HEAD", port: 443 }, (res) => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const cert = (res.socket as any).getPeerCertificate?.();
          if (!cert?.valid_to) {
            resolve({ status: "WARNING", value: "Could not read certificate" });
          } else {
            const days = Math.floor((new Date(cert.valid_to).getTime() - Date.now()) / 86_400_000);
            if (days < 14) resolve({ status: "CRITICAL", value: `Expires in ${days} days` });
            else if (days < 30) resolve({ status: "WARNING", value: `Expires in ${days} days` });
            else resolve({ status: "OK", value: `Expires in ${days} days` });
          }
        } catch {
          resolve({ status: "WARNING", value: "Certificate read error" });
        }
        req.destroy();
      });
      req.on("error", () => resolve({ status: "WARNING", value: "SSL check failed" }));
      req.setTimeout(8_000, () => { req.destroy(); resolve({ status: "WARNING", value: "SSL check timed out" }); });
      req.end();
    });
  } catch {
    return Promise.resolve({ status: "WARNING", value: "Invalid URL" });
  }
}

// ─── Security Headers ─────────────────────────────────────

export async function checkSecurityHeaders(url: string): Promise<CheckResult> {
  try {
    const res = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(10_000) });
    const h = res.headers;
    const missing: string[] = [];
    if (!h.get("strict-transport-security")) missing.push("HSTS");
    if (!h.get("x-frame-options") && !h.get("content-security-policy")) missing.push("Clickjacking protection");
    if (!h.get("x-content-type-options")) missing.push("X-Content-Type-Options");

    if (missing.length === 0) return { status: "OK", value: "All key headers present" };
    if (missing.length === 1) return { status: "WARNING", value: `Missing: ${missing[0]}` };
    return { status: "CRITICAL", value: `Missing: ${missing.join(", ")}` };
  } catch {
    return { status: "WARNING", value: "Could not check headers" };
  }
}

// ─── Performance (PageSpeed Insights) ────────────────────

export async function checkPerformance(url: string, apiKey?: string): Promise<CheckResult> {
  if (!apiKey) return { status: "OK", value: "Skipped (PAGESPEED_API_KEY not set)" };
  try {
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=mobile&key=${apiKey}`;
    const res = await fetch(apiUrl, { signal: AbortSignal.timeout(30_000) });
    if (!res.ok) return { status: "WARNING", value: "PageSpeed API error" };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = (await res.json()) as any;
    const score = Math.round((data?.lighthouseResult?.categories?.performance?.score ?? 0) * 100);
    if (score >= 70) return { status: "OK", value: `Mobile score: ${score}` };
    if (score >= 50) return { status: "WARNING", value: `Mobile score: ${score} (needs improvement)` };
    return { status: "CRITICAL", value: `Mobile score: ${score} (poor)` };
  } catch {
    return { status: "WARNING", value: "Performance check failed" };
  }
}

// ─── Run all checks ───────────────────────────────────────

export async function runAllChecks(url: string, pagespeedApiKey?: string) {
  const [uptime, ssl, headers, performance] = await Promise.allSettled([
    checkUptime(url),
    checkSSLExpiry(url),
    checkSecurityHeaders(url),
    checkPerformance(url, pagespeedApiKey),
  ]);

  return {
    uptime: uptime.status === "fulfilled" ? uptime.value : { status: "WARNING" as CheckStatus, value: "Check failed" },
    ssl_expiry: ssl.status === "fulfilled" ? ssl.value : { status: "WARNING" as CheckStatus, value: "Check failed" },
    security_headers: headers.status === "fulfilled" ? headers.value : { status: "WARNING" as CheckStatus, value: "Check failed" },
    performance: performance.status === "fulfilled" ? performance.value : { status: "WARNING" as CheckStatus, value: "Check failed" },
  };
}
