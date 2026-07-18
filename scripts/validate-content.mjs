import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const roadmap = JSON.parse(fs.readFileSync(path.join(root, "content", "roadmap.json"), "utf8"));
const search = JSON.parse(fs.readFileSync(path.join(root, "content", "search-index.json"), "utf8"));
const missing = [];
let lessons = 0;

for (const chapter of roadmap.chapters) {
  const chapterDir = path.join(root, "content", chapter.slug);
  const metadataPath = path.join(chapterDir, "metadata.json");
  if (!fs.existsSync(metadataPath)) missing.push(`${chapter.slug}/metadata.json`);
  const metadata = fs.existsSync(metadataPath) ? JSON.parse(fs.readFileSync(metadataPath, "utf8")) : { lessons: {} };

  for (const lesson of chapter.lessons) {
    lessons += 1;
    const item = metadata.lessons?.[lesson.slug];
    if (!item) missing.push(`${chapter.slug}/metadata:${lesson.slug}`);
    if (!fs.existsSync(path.join(chapterDir, `${lesson.slug}.md`))) missing.push(`${chapter.slug}/${lesson.slug}.md`);
  }
}

if (search.totalLessons !== lessons || search.lessons.length !== lessons) {
  missing.push("search-index count mismatch");
}

if (missing.length) {
  console.error(missing.join("\n"));
  process.exit(1);
}

console.log(`Content validation passed: ${roadmap.chapters.length} chapters, ${lessons} lessons.`);

