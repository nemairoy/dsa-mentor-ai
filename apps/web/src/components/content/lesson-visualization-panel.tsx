import { AnimationPlayer } from "@/components/visualization/player/animation-player";
import { animationLoader } from "@/core/visualization/loader/animation-loader";
import type { Lesson } from "@/core/content/domain/content";

const fallbackByChapter: Record<string, string> = {
  arrays: "array-traversal",
  searching: "linear-search",
  sorting: "bubble-sort",
  stack: "stack-push",
  queue: "queue-enqueue",
  "linked-list": "linked-list-traversal",
  tree: "tree-traversal",
  "binary-tree": "tree-traversal",
  graph: "bfs",
};

export function LessonVisualizationPanel({ lesson }: { lesson: Lesson }) {
  const definition =
    animationLoader.load(lesson.lesson.animationComponent) ??
    animationLoader.load(lesson.lesson.animationId) ??
    animationLoader.load(fallbackByChapter[lesson.chapter.slug] ?? "array-traversal");

  return (
    <section id="visualization" className="scroll-mt-28 rounded-xl border border-border bg-card p-3 shadow-sm">
      <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-300">Concept picture</p>
          <h2 className="mt-1 font-semibold">{definition?.title ?? "Visualization planned"}</h2>
        </div>
        <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">Beginner friendly</span>
      </div>
      {definition ? (
        <div className="[&>div]:grid-cols-1 [&_section.space-y-4]:space-y-3 [&_section.rounded-lg]:rounded-2xl">
          <AnimationPlayer definition={definition} />
        </div>
      ) : (
        <div className="rounded-xl bg-muted p-3 text-xs text-muted-foreground">
          This lesson is mapped to {lesson.lesson.animationComponent}. The renderer will load it when implemented.
        </div>
      )}
    </section>
  );
}
