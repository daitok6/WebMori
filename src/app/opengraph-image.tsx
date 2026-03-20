import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "WebMori - Web Security Audit Service";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1a2332 0%, #0f1923 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* Gold accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            background: "linear-gradient(90deg, #c8a84e, #e0c068)",
          }}
        />

        {/* Logo text */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "linear-gradient(135deg, #c8a84e, #e0c068)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              fontWeight: 700,
              color: "#1a2332",
            }}
          >
            W
          </div>
          <span
            style={{
              fontSize: 56,
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: -1,
            }}
          >
            WebMori
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            color: "#c8a84e",
            fontWeight: 600,
            marginBottom: 24,
          }}
        >
          Web Security Audit Service
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: 20,
            color: "rgba(255, 255, 255, 0.6)",
            textAlign: "center",
            maxWidth: 700,
            lineHeight: 1.5,
          }}
        >
          Security / Performance / LINE API / i18n / Maintainability
        </div>

        {/* Bottom accent */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            fontSize: 16,
            color: "rgba(255, 255, 255, 0.3)",
          }}
        >
          webmori.jp
        </div>
      </div>
    ),
    { ...size },
  );
}
