import Link from "next/link";
import { AlertTriangle, CheckCircle2, Dumbbell, HelpCircle, Lightbulb } from "lucide-react";

import { ProfessionalCodeBlock } from "@/components/content/professional-code-block";
import { MarkdownContent } from "@/components/content/markdown-content";
import type { Lesson } from "@/core/content/domain/content";

export function LessonStudySections({ lesson }: { lesson: Lesson }) {
  const exampleMarkdown = [
    extractMarkdownSection(lesson.markdown, "Step-by-step example"),
    extractMarkdownSection(lesson.markdown, "Explanation"),
  ]
    .filter(Boolean)
    .join("\n\n");

  return (
    <div className="space-y-3">
      <StudySection id="example" title="Example">
        <div className="space-y-4">
          <p className="text-xs leading-5 text-muted-foreground">
            Trace the idea slowly. Focus on what changes at each step, which variables move, and what invariant remains true.
          </p>
          <MarkdownContent markdown={exampleMarkdown || lesson.markdown} />
        </div>
      </StudySection>
      <StudySection id="code" title="Code">
        <div className="space-y-4">
          {lesson.lesson.codeExamples.map((example) => (
            <ProfessionalCodeBlock key={`${example.filename}-${example.language}`} {...example} />
          ))}
        </div>
      </StudySection>
      <div className="grid gap-3 md:grid-cols-2">
        <StudySection id="time-complexity" title="Time Complexity">
          <p className="text-xs text-muted-foreground">{lesson.lesson.timeComplexity}</p>
        </StudySection>
        <StudySection id="space-complexity" title="Space Complexity">
          <p className="text-xs text-muted-foreground">{lesson.lesson.spaceComplexity}</p>
        </StudySection>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <StudySection id="common-mistakes" title="Common Mistakes">
          <IconList
            icon={AlertTriangle}
            items={
              lesson.lesson.commonMistakes.length
                ? lesson.lesson.commonMistakes
                : ["Skipping edge cases", "Moving pointers before checking the current state", "Confusing index and value"]
            }
          />
        </StudySection>
        <StudySection id="interview-tips" title="Interview Tips">
          <IconList
            icon={Lightbulb}
            items={
              lesson.lesson.interviewTips.length
                ? lesson.lesson.interviewTips
                : ["Use this pattern when scanning ordered data", "Explain invariants clearly in interviews", "Connect each step to a real state change"]
            }
          />
        </StudySection>
      </div>
      <StudySection id="practice" title="Practice">
        <div className="space-y-3">
          <IconList icon={Dumbbell} items={lesson.lesson.practiceProblems.length ? lesson.lesson.practiceProblems : ["Solve one related problem before continuing."]} />
          <Link
            href={`/practice?chapterSlug=${lesson.chapter.slug}&lessonSlug=${lesson.lesson.slug}`}
            className="inline-flex min-h-8 items-center rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
          >
            Open related practice
          </Link>
        </div>
      </StudySection>
      <StudySection id="quiz" title="Quiz">
        <div className="rounded-lg border border-border bg-background p-2.5">
          <div className="flex items-center gap-2">
            <HelpCircle aria-hidden={true} size={18} className="text-emerald-700 dark:text-emerald-300" />
            <p className="font-medium">Check your understanding</p>
          </div>
          <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
            Ask the AI Tutor to generate a short quiz from this lesson, then explain any answer you miss.
          </p>
        </div>
      </StudySection>
      <StudySection id="revision" title="Revision Summary">
        <IconList icon={CheckCircle2} items={lesson.lesson.learningObjectives} />
      </StudySection>
    </div>
  );
}

function extractMarkdownSection(markdown: string, heading: string) {
  const lines = markdown.split(/\r?\n/);
  const startIndex = lines.findIndex((line) => line.trim().toLowerCase() === `## ${heading.toLowerCase()}`);

  if (startIndex === -1) {
    return "";
  }

  const sectionLines: string[] = [];

  for (const line of lines.slice(startIndex + 1)) {
    if (/^##\s+/.test(line)) {
      break;
    }

    sectionLines.push(line);
  }

  return sectionLines.join("\n").trim();
}

function StudySection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28 rounded-xl border border-border bg-card p-3 shadow-sm">
      <h2 className="text-base font-semibold">{title}</h2>
      <div className="mt-2.5">{children}</div>
    </section>
  );
}

function IconList({
  icon: Icon,
  items,
}: {
  icon: React.ComponentType<{ size?: number; className?: string; "aria-hidden"?: boolean }>;
  items: string[];
}) {
  return (
    <ul className="space-y-2.5 text-xs text-muted-foreground">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <Icon aria-hidden={true} size={17} className="mt-0.5 shrink-0 text-emerald-700 dark:text-emerald-300" />
          <span className="leading-5">{item}</span>
        </li>
      ))}
    </ul>
  );
}
