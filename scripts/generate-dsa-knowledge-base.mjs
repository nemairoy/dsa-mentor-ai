import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contentRoot = path.join(root, "content");

const chapters = [
  ["introduction", "Introduction", "Beginner", ["foundation", "learning-path"]],
  ["algorithm-analysis", "Algorithm Analysis", "Beginner", ["analysis", "complexity"]],
  ["time-complexity", "Time Complexity", "Beginner", ["complexity", "runtime"]],
  ["space-complexity", "Space Complexity", "Beginner", ["complexity", "memory"]],
  ["big-o", "Big O", "Beginner", ["asymptotic-analysis", "upper-bound"]],
  ["big-omega", "Big Omega", "Beginner", ["asymptotic-analysis", "lower-bound"]],
  ["big-theta", "Big Theta", "Beginner", ["asymptotic-analysis", "tight-bound"]],
  ["arrays", "Arrays", "Beginner", ["linear-data-structure", "indexing"]],
  ["strings", "Strings", "Beginner", ["linear-data-structure", "text"]],
  ["searching", "Searching", "Beginner", ["search", "patterns"]],
  ["sorting", "Sorting", "Beginner", ["sorting", "ordering"]],
  ["recursion", "Recursion", "Beginner", ["recursion", "call-stack"]],
  ["backtracking", "Backtracking", "Intermediate", ["recursion", "state-space"]],
  ["stack", "Stack", "Beginner", ["linear-data-structure", "lifo"]],
  ["queue", "Queue", "Beginner", ["linear-data-structure", "fifo"]],
  ["deque", "Deque", "Beginner", ["linear-data-structure", "double-ended"]],
  ["linked-list", "Linked List", "Beginner", ["nodes", "pointers"]],
  ["hashing", "Hashing", "Intermediate", ["hash-table", "lookup"]],
  ["tree", "Tree Fundamentals", "Intermediate", ["tree", "hierarchy"]],
  ["binary-tree", "Binary Tree", "Intermediate", ["tree", "recursion"]],
  ["binary-search-tree", "Binary Search Tree", "Intermediate", ["tree", "ordered-data"]],
  ["avl-tree", "AVL Tree", "Advanced", ["balanced-tree", "rotations"]],
  ["heap", "Heap", "Intermediate", ["priority-queue", "complete-tree"]],
  ["trie", "Trie", "Intermediate", ["prefix-tree", "strings"]],
  ["graph", "Graph", "Intermediate", ["graph", "traversal"]],
  ["greedy", "Greedy", "Intermediate", ["optimization", "strategy"]],
  ["dynamic-programming", "Dynamic Programming", "Intermediate", ["dp", "optimization"]],
  ["bit-manipulation", "Bit Manipulation", "Intermediate", ["bits", "operators"]],
  ["segment-tree", "Segment Tree", "Advanced", ["range-query", "tree"]],
  ["fenwick-tree", "Fenwick Tree", "Advanced", ["range-query", "binary-indexed-tree"]],
  ["disjoint-set-union", "Disjoint Set Union", "Intermediate", ["union-find", "graph"]],
  ["mathematics", "Mathematics", "Beginner", ["math", "problem-solving"]],
  ["number-theory", "Number Theory", "Intermediate", ["math", "modular-arithmetic"]],
  ["competitive-programming", "Competitive Programming", "Advanced", ["contest", "patterns"]],
  ["interview-preparation", "Interview Preparation", "Intermediate", ["interviews", "communication"]],
  ["advanced-graph-algorithms", "Advanced Graph Algorithms", "Advanced", ["graph", "shortest-path"]],
  ["advanced-dynamic-programming", "Advanced Dynamic Programming", "Advanced", ["dp", "advanced-patterns"]],
].map(([slug, title, difficulty, tags], index) => ({ slug, title, difficulty, tags, order: index + 1 }));

const lessonTemplates = [
  ["introduction", "Introduction", "Build the mental model and vocabulary for this chapter."],
  ["theory", "Theory", "Study the core principles, invariants, and correctness ideas."],
  ["operations", "Operations", "Understand common operations, constraints, and tradeoffs."],
  ["applications", "Applications", "Connect the topic to real interview and engineering use cases."],
  ["practice", "Practice", "Work through structured practice prompts and edge cases."],
  ["interview-questions", "Interview Questions", "Prepare clear explanations for common interview prompts."],
  ["animation-ai-mapping", "Animation and AI Mapping", "Define future animation and AI context mappings."],
  ["revision-summary", "Revision and Summary", "Review the chapter and consolidate key takeaways."],
];

const extraLessonsByChapter = {
  tree: [
    ["terminology", "Terminology", "Learn roots, leaves, height, depth, ancestors, descendants, and subtrees."],
    ["traversals", "Traversals", "Compare preorder, inorder, postorder, and level-order traversal strategies."],
    ["binary-tree", "Binary Tree Bridge", "Connect general tree terminology to binary tree structure."],
  ],
};

function pascalCase(value) {
  return value
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

function complexityFor(slug) {
  if (slug.includes("sorting")) return ["O(n log n) for efficient comparison sorting; O(n^2) for elementary sorting.", "O(1) to O(n) depending on algorithm."];
  if (slug.includes("graph")) return ["O(V + E) for core traversal; varies for advanced algorithms.", "O(V + E) for graph storage and visited state."];
  if (slug.includes("dynamic-programming")) return ["O(states * transitions).", "O(states), reducible when only recent states are needed."];
  if (slug.includes("tree") || slug.includes("heap") || slug.includes("trie")) return ["O(h) to O(n), depending on height and traversal breadth.", "O(h) recursion stack or O(n) auxiliary structures."];
  if (slug.includes("hashing")) return ["Average O(1) lookup/update; O(n) worst case with heavy collisions.", "O(n) for stored keys."];
  return ["O(n) for full scans; specialized operations may be O(1) or O(log n).", "Usually O(1) auxiliary space unless extra structures are introduced."];
}

function codeFor(chapter, lesson) {
  const functionName = `${chapter.slug.replaceAll("-", "_")}_${lesson.slug.replaceAll("-", "_")}`;
  return `def ${functionName}(items):\n    \"\"\"Reference scaffold for ${chapter.title}: ${lesson.title}.\"\"\"\n    result = []\n    for index, value in enumerate(items):\n        result.append((index, value))\n    return result\n\n\nprint(${functionName}([3, 1, 4, 1, 5]))`;
}

function markdownFor(chapter, lesson, metadata) {
  return `# ${chapter.title}: ${lesson.title}

## Overview

${lesson.description} The goal is to understand ${chapter.title.toLowerCase()} from first principles and connect it to practical problem solving.

## Core Explanation

${chapter.title} appears repeatedly in DSA because it provides a reusable way to reason about input size, constraints, state, and tradeoffs. Start with the simple mental model, identify the operation being performed, then analyze the dominant cost.

## Example

\`\`\`python
${codeFor(chapter, lesson)}
\`\`\`

## Complexity

| Measure | Guidance |
| --- | --- |
| Time | ${metadata.timeComplexity} |
| Space | ${metadata.spaceComplexity} |

## Checklist

- [ ] Explain the main idea in your own words.
- [ ] Trace one small input manually.
- [ ] Identify edge cases.
- [ ] State time and space complexity.

## Callout

> Warning: Do not memorize only the final formula. Interviewers usually care more about how you reason from constraints to a correct approach.

## Visual Learning

Use the visualization workspace and AI tutor to turn this lesson into a traceable mental model. When a diagram is available, compare each visual step with the invariant described above.

## Practice Path

Open the related practice set, solve one easy sample first, then use the executor and AI validation flow to check edge cases before moving to harder problems.
`;
}

async function generate() {
  await mkdir(contentRoot, { recursive: true });

  const roadmap = {
    version: 2,
    generatedAt: new Date().toISOString(),
    chapters: chapters.map((chapter) => ({
      slug: chapter.slug,
      order: chapter.order,
      lessons: [...lessonTemplates, ...(extraLessonsByChapter[chapter.slug] ?? [])].map(([slug], index) => ({
        slug,
        order: index + 1,
      })),
    })),
  };

  const animationMap = {};
  const aiMap = {};

  for (const chapter of chapters) {
    const chapterDir = path.join(contentRoot, chapter.slug);
    await mkdir(chapterDir, { recursive: true });
    await mkdir(path.join(chapterDir, "images"), { recursive: true });

    const lessons = {};
    const animationMappings = {};

    const chapterLessonTemplates = [...lessonTemplates, ...(extraLessonsByChapter[chapter.slug] ?? [])];

    for (const [slug, title, description] of chapterLessonTemplates) {
      const lessonId = `${chapter.slug}.${slug}`;
      const [timeComplexity, spaceComplexity] = complexityFor(chapter.slug);
      const animationComponent = `${pascalCase(chapter.slug)}${pascalCase(slug)}Animation`;
      const metadata = {
        lessonId,
        chapter: chapter.title,
        title,
        summary: description,
        difficulty: chapter.difficulty,
        estimatedTimeMinutes: chapter.difficulty === "Advanced" ? 35 : chapter.difficulty === "Intermediate" ? 30 : 25,
        durationMinutes: chapter.difficulty === "Advanced" ? 35 : chapter.difficulty === "Intermediate" ? 30 : 25,
        prerequisites: chapter.order === 1 ? ["Basic programming syntax"] : ["Complete earlier roadmap fundamentals"],
        tags: [...chapter.tags, slug],
        learningObjectives: [
          `Explain ${chapter.title} ${title.toLowerCase()} concepts clearly.`,
          "Identify operations, edge cases, and constraints.",
          "Analyze time and space complexity for common scenarios.",
        ],
        animationId: `${chapter.slug}-${slug}`,
        animationComponent,
        aiContext: `${chapter.title} / ${title}: ${description}`,
        aiSummary: `${title} lesson for ${chapter.title}, covering theory, examples, practice, and interview preparation.`,
        aiPromptContext: `Act as a DSA mentor teaching ${chapter.title}: ${title}. Use concise explanations, examples, and complexity analysis.`,
        ragMetadata: {
          chapterSlug: chapter.slug,
          lessonSlug: slug,
          topic: chapter.title,
          contentType: "lesson",
          phase: 4,
        },
        embeddingMetadata: {
          namespace: "dsa-knowledge-base",
          documentId: lessonId,
          tags: [...chapter.tags, slug],
        },
        timeComplexity,
        spaceComplexity,
        relatedLessons: [
          `${chapter.slug}/introduction`,
          chapter.order > 1 ? `${chapters[chapter.order - 2].slug}/revision-summary` : `${chapter.slug}/theory`,
        ],
        futureQuizId: `quiz-${chapter.slug}-${slug}`,
        futureFlashcardId: `flashcards-${chapter.slug}-${slug}`,
        futureProjectId: `project-${chapter.slug}-${slug}`,
        images: [`content/${chapter.slug}/images/${slug}.png`],
        commonMistakes: [
          "Skipping constraints before choosing an approach.",
          "Ignoring empty, single-element, and duplicate-heavy inputs.",
          "Confusing implementation details with complexity drivers.",
        ],
        interviewTips: [
          "State assumptions before coding.",
          "Explain the invariant or reason the approach works.",
          "Discuss tradeoffs and alternatives after solving.",
        ],
        practiceProblems: [
          `Solve one easy ${chapter.title} problem.`,
          `Solve one medium ${chapter.title} problem.`,
          "Write down edge cases before implementation.",
        ],
        codeExamples: [
          {
            language: "python",
            filename: `${chapter.slug}-${slug}.py`,
            code: codeFor(chapter, { slug, title }),
          },
        ],
      };

      lessons[slug] = metadata;
      animationMappings[slug] = {
        animationId: metadata.animationId,
        component: animationComponent,
        status: "planned",
      };
      animationMap[lessonId] = animationMappings[slug];
      aiMap[lessonId] = {
        aiContext: metadata.aiContext,
        aiSummary: metadata.aiSummary,
        aiPromptContext: metadata.aiPromptContext,
        ragMetadata: metadata.ragMetadata,
        embeddingMetadata: metadata.embeddingMetadata,
      };

      await writeFile(path.join(chapterDir, `${slug}.md`), markdownFor(chapter, { slug, title, description }, metadata), "utf8");
    }

    const chapterMetadata = {
      chapterId: chapter.slug,
      title: chapter.title,
      description: `Production-ready DSA chapter covering ${chapter.title.toLowerCase()} concepts, implementation patterns, practice, interviews, revision, animation mapping, and AI preparation.`,
      difficulty: chapter.difficulty,
      estimatedHours: Math.round((lessonTemplates.length * (chapter.difficulty === "Advanced" ? 35 : 25)) / 60),
      tags: chapter.tags,
      animationNamespace: pascalCase(chapter.slug),
      aiContext: `${chapter.title} chapter in the DSA Mentor AI syllabus.`,
      animationMappings,
      lessons,
    };

    await writeFile(path.join(chapterDir, "metadata.json"), `${JSON.stringify(chapterMetadata, null, 2)}\n`, "utf8");
  }

  await writeFile(path.join(contentRoot, "roadmap.json"), `${JSON.stringify(roadmap, null, 2)}\n`, "utf8");
  await writeFile(path.join(contentRoot, "animation-map.json"), `${JSON.stringify(animationMap, null, 2)}\n`, "utf8");
  await writeFile(path.join(contentRoot, "ai-map.json"), `${JSON.stringify(aiMap, null, 2)}\n`, "utf8");
}

await generate();
