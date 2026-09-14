import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/admin",
        "/admin-console",
        "/dashboard",
        "/learn",
        "/practice",
        "/marathon",
        "/ai-tutor",
        "/notes",
        "/bookmarks",
        "/progress",
        "/achievements",
        "/profile",
        "/settings",
        "/intelligence",
        "/visualizations",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
