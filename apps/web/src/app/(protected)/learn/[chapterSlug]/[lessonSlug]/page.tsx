import { notFound, redirect } from "next/navigation";

import Link from "next/link";

import { AiAssistantLazyPanel } from "@/components/content/ai-assistant-lazy-panel";
import { LessonCompletionGate } from "@/components/content/lesson-completion-gate";
import { LessonActions } from "@/components/content/lesson-actions";
import { LessonPartBar } from "@/components/content/lesson-part-bar";
import { NotesPanel } from "@/components/content/notes-panel";
import { ReadingProgressTracker } from "@/components/content/reading-progress-tracker";
import { LessonSideNav } from "@/components/content/lesson-side-nav";
import { LessonStudySections } from "@/components/content/lesson-study-sections";
import { LessonTheoryPreview } from "@/components/content/lesson-theory-preview";
import { LessonVisualizationPanel } from "@/components/content/lesson-visualization-panel";
import { contentService } from "@/core/content/content-container";
import { learningService } from "@/core/learning/learning-container";
import { profileService } from "@/core/profile/profile-container";
import { requireSession } from "@/lib/session";

type LessonPageProps = {
  params: Promise<{
    chapterSlug: string;
    lessonSlug: string;
  }>;
};

export async function generateStaticParams() {
  const roadmap = await contentService.getRoadmap();

  return roadmap.flatMap((chapter) =>
    chapter.lessons.map((lesson) => ({
      chapterSlug: chapter.slug,
      lessonSlug: lesson.slug,
    })),
  );
}

export default async function LessonPage({ params }: LessonPageProps) {
  const session = await requireSession();
  const profile = await profileService.getByUserId(session.user.id);

  if (!profile) {
    redirect("/profile-setup");
  }

  const { chapterSlug, lessonSlug } = await params;
  const lesson = await contentService.getLesson(chapterSlug, lessonSlug);

  if (!lesson) {
    notFound();
  }

  const lessonIdentity = { chapterSlug, lessonSlug };
  const [bookmarked, progress, note] = await Promise.all([
    learningService.isBookmarked(session.user.id, lessonIdentity),
    learningService.getProgress(session.user.id, lessonIdentity),
    learningService.getNote(session.user.id, lessonIdentity),
  ]);

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-border bg-card p-3 shadow-sm">
        <ReadingProgressTracker
          chapterSlug={chapterSlug}
          lessonSlug={lessonSlug}
          initialProgress={progress?.progressPercent ?? 0}
        />
        <nav className="mb-3 text-xs text-muted-foreground" aria-label="Breadcrumb">
          <Link href="/dashboard" className="hover:text-foreground">
            Dashboard
          </Link>
          <span className="px-2">/</span>
          <Link href="/learn" className="hover:text-foreground">
            Learn
          </Link>
          <span className="px-2">/</span>
          <Link href={`/learn/${chapterSlug}`} className="hover:text-foreground">
            {lesson.chapter.title}
          </Link>
        </nav>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">{lesson.chapter.title}</p>
            <h1 className="mt-1.5 text-lg font-semibold tracking-tight md:text-xl">{lesson.lesson.title}</h1>
            <p className="mt-2 max-w-3xl text-xs leading-5 text-muted-foreground">{lesson.lesson.summary}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
              <span>{lesson.lesson.durationMinutes} min read</span>
              <span>{lesson.chapter.difficulty}</span>
              <span>Last read: {progress?.lastReadAt ? new Date(progress.lastReadAt).toLocaleString() : "Not started"}</span>
            </div>
          </div>
          <LessonActions chapterSlug={chapterSlug} lessonSlug={lessonSlug} initialBookmarked={bookmarked} />
        </div>
      </section>

      <LessonPartBar
        lessons={lesson.chapter.lessons}
        currentLessonSlug={lessonSlug}
        currentTitle={lesson.lesson.title}
      />

      <div className="grid gap-3 xl:grid-cols-[200px_minmax(0,1fr)_300px]">
        <div className="hidden xl:block">
          <LessonSideNav progress={progress?.progressPercent ?? 0} />
        </div>
        <main className="min-w-0 space-y-3">
          <LessonTheoryPreview lesson={lesson} />
          <LessonVisualizationPanel lesson={lesson} />
          <LessonStudySections lesson={lesson} />
          <LessonCompletionGate
            previousLesson={lesson.previousLesson}
            nextLesson={lesson.nextLesson}
            currentTitle={lesson.lesson.title}
          />
        </main>
        <aside className="space-y-3 xl:sticky xl:top-20 xl:self-start">
          <AiAssistantLazyPanel
            chapterSlug={chapterSlug}
            lessonSlug={lessonSlug}
            lessonTitle={lesson.lesson.title}
            lessonMarkdown={lesson.markdown}
          />
          <NotesPanel chapterSlug={chapterSlug} lessonSlug={lessonSlug} initialNote={note?.body ?? ""} />
          <section className="rounded-xl border border-border bg-card p-3 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Bookmark</p>
            <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
              Save this lesson from the header actions and return from Bookmarks when revising.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
