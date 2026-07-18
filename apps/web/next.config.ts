import type { NextConfig } from "next";

const apiBaseUrl = process.env.API_BASE_URL ?? "http://localhost:8000";
const judge0BaseUrl = process.env.JUDGE0_BASE_URL ?? "https://ce.judge0.com";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:all*(svg|png|jpg|jpeg|webp|ico|webmanifest)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Content-Security-Policy",
            value:
              `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' ${apiBaseUrl} ${judge0BaseUrl} https://generativelanguage.googleapis.com; frame-ancestors 'none';`,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
