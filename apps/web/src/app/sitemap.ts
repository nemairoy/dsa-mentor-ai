import type { MetadataRoute } from "next";

import { contentService } from "@/core/content/content-container";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const roadmap = await contentService.getRoadmap();
  const lessonUrls = roadmap.flatMap((chapter) =>
    chapter.lessons.map((lesson) => ({
      url: `${baseUrl}${lesson.href}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  );

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/dashboard`, lastModified: new Date(), changeFrequency: "daily", priority: 0.5 },
    ...lessonUrls,
  ];
}

