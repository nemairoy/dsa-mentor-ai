import { notFound, redirect } from "next/navigation";

import { contentService } from "@/core/content/content-container";

type ModulePageProps = {
  params: Promise<{ chapterSlug: string }>;
};

export async function generateStaticParams() {
  const roadmap = await contentService.getRoadmap();
  return roadmap.map((chapter) => ({ chapterSlug: chapter.slug }));
}

export default async function ModulePage({ params }: ModulePageProps) {
  const { chapterSlug } = await params;
  const roadmap = await contentService.getRoadmap();
  const chapter = roadmap.find((item) => item.slug === chapterSlug);

  if (!chapter) {
    notFound();
  }

  const introduction = chapter.lessons.find((lesson) => lesson.slug === "introduction") ?? chapter.lessons[0];

  if (!introduction) {
    notFound();
  }

  redirect(introduction.href);
}
