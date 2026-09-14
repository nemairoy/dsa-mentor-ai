import type { MetadataRoute } from "next";

import { contentService } from "@/core/content/content-container";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const roadmap = await contentService.getRoadmap();
  const chapterUrls = roadmap.map((chapter) => ({
    url: `${baseUrl}/topics/${chapter.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));
  const lessonUrls = roadmap.flatMap((chapter) =>
    chapter.lessons.map((lesson) => ({
      url: `${baseUrl}/topics/${chapter.slug}/${lesson.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  );

  return [
    { url: baseUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/topics`, changeFrequency: "weekly", priority: 0.9 },
    ...chapterUrls,
    ...lessonUrls,
  ];
}
