import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contentRoot = path.join(root, "content");

const roadmap = JSON.parse(await readFile(path.join(contentRoot, "roadmap.json"), "utf8"));
const lessons = [];
const tags = new Map();
const topics = new Map();
const difficulties = new Map();

for (const chapterRef of roadmap.chapters) {
  const metadata = JSON.parse(await readFile(path.join(contentRoot, chapterRef.slug, "metadata.json"), "utf8"));

  for (const lessonRef of chapterRef.lessons) {
    const lesson = metadata.lessons[lessonRef.slug];
    const markdown = await readFile(path.join(contentRoot, chapterRef.slug, `${lessonRef.slug}.md`), "utf8");
    const entry = {
      id: lesson.lessonId,
      chapterSlug: chapterRef.slug,
      chapterTitle: metadata.title,
      lessonSlug: lessonRef.slug,
      lessonTitle: lesson.title,
      difficulty: lesson.difficulty,
      tags: lesson.tags,
      summary: lesson.summary,
      href: `/learn/${chapterRef.slug}/${lessonRef.slug}`,
      animationId: lesson.animationId,
      futureQuizId: lesson.futureQuizId,
      searchableText: [metadata.title, lesson.title, lesson.summary, lesson.tags.join(" "), markdown.replace(/[#>*`\-[\]]/g, " ")]
        .join(" ")
        .replace(/\s+/g, " ")
        .trim(),
    };

    lessons.push(entry);
    topics.set(metadata.title, [...(topics.get(metadata.title) ?? []), entry.id]);
    difficulties.set(lesson.difficulty, [...(difficulties.get(lesson.difficulty) ?? []), entry.id]);

    for (const tag of lesson.tags) {
      tags.set(tag, [...(tags.get(tag) ?? []), entry.id]);
    }
  }
}

const index = {
  generatedAt: new Date().toISOString(),
  totalChapters: roadmap.chapters.length,
  totalLessons: lessons.length,
  lessons,
  facets: {
    topics: Object.fromEntries(topics),
    tags: Object.fromEntries(tags),
    difficulties: Object.fromEntries(difficulties),
  },
};

await writeFile(path.join(contentRoot, "search-index.json"), `${JSON.stringify(index, null, 2)}\n`, "utf8");

console.log(`Generated search index for ${index.totalChapters} chapters and ${index.totalLessons} lessons.`);

