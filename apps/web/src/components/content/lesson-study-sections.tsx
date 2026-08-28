import Link from "next/link";
import { AlertTriangle, CheckCircle2, Dumbbell, HelpCircle, Lightbulb } from "lucide-react";

import { ProfessionalCodeBlock } from "@/components/content/professional-code-block";
import { LessonExampleCard } from "@/components/content/lesson-example-card";
import { buildLearningModel, buildTeachingCodeExample, isBubbleSortLesson } from "@/components/content/lesson-learning-model";
import type { Lesson } from "@/core/content/domain/content";

export function LessonStudySections({ lesson }: { lesson: Lesson }) {
  const model = buildLearningModel(lesson);
  const codeExample = buildTeachingCodeExample(lesson);
  const bubbleSort = isBubbleSortLesson(lesson);
  const mistakes = bubbleSort ? bubbleSortMistakes : model.pitfalls;
  const interviewTips = bubbleSort
    ? bubbleSortInterviewTips
    : [
        `Start with the definition: ${model.definition}`,
        `Name the state: ${model.state}`,
        `State the invariant: ${model.invariant}`,
      ];

  return (
    <div className="space-y-3">
      <StudySection id="example" title="Example">
        <LessonExampleCard lesson={lesson} />
      </StudySection>
      <StudySection id="code" title="Code">
        {bubbleSort ? <BubbleSortCodeIntro /> : <GenericCodeIntro model={model} />}
        <ProfessionalCodeBlock {...codeExample} />
        {bubbleSort ? <BubbleSortCodeExplanation /> : <GenericCodeExplanation model={model} />}
      </StudySection>
      <div className="grid gap-3 md:grid-cols-2">
        <StudySection id="time-complexity" title="Time Complexity">
          {bubbleSort ? <BubbleSortTimeComplexity /> : <GenericTimeComplexity lesson={lesson} model={model} />}
        </StudySection>
        <StudySection id="space-complexity" title="Space Complexity">
          {bubbleSort ? <BubbleSortSpaceComplexity /> : <GenericSpaceComplexity lesson={lesson} model={model} />}
        </StudySection>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <StudySection id="common-mistakes" title="Common Mistakes">
          <IconList
            icon={AlertTriangle}
            items={mistakes}
          />
        </StudySection>
        <StudySection id="interview-tips" title="Interview Tips">
          <IconList
            icon={Lightbulb}
            items={interviewTips}
          />
        </StudySection>
      </div>
      <StudySection id="practice" title="Practice">
        <div className="space-y-3">
          <IconList icon={Dumbbell} items={bubbleSort ? bubbleSortPractice : lesson.lesson.practiceProblems.length ? lesson.lesson.practiceProblems : ["Solve one related problem before continuing."]} />
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
          {bubbleSort ? (
            <div className="mt-2 space-y-2 text-xs leading-5 text-muted-foreground">
              <p>1. In [3, 2, 1], after the first full pass, which value is fixed at the end?</p>
              <p>2. Why do we compare only adjacent values instead of jumping to any two values?</p>
              <p>3. If a full pass makes no swap, what does that tell us about the array?</p>
              <p>4. Why is Bubble Sort O(n^2) in the worst case?</p>
            </div>
          ) : <GenericQuiz model={model} />}
        </div>
      </StudySection>
      <StudySection id="revision" title="Revision Summary">
        <IconList icon={CheckCircle2} items={bubbleSort ? bubbleSortRevision : buildGenericRevision(model)} />
      </StudySection>
    </div>
  );
}

const bubbleSortMistakes = [
  "Comparing non-neighbor values. Bubble Sort works by adjacent comparisons: index i with index i + 1.",
  "Forgetting the sorted boundary. After pass 1, the last element is fixed; after pass 2, the last two are fixed.",
  "Using the wrong swap condition. For ascending order, swap only when left value is greater than right value.",
  "Thinking one pass always sorts the whole array. One pass fixes only the largest remaining value.",
  "Not stopping early when no swap happens. A no-swap pass means the array is already sorted.",
];

const bubbleSortInterviewTips = [
  "Start with the simple definition: Bubble Sort repeatedly compares adjacent values and swaps wrong-order pairs.",
  "Dry-run one full pass before code. Show how the largest value moves to the right boundary.",
  "State the invariant clearly: after each pass, one more largest value is fixed at the end.",
  "Mention complexity honestly: worst and average time are O(n^2), best time is O(n) only when using the no-swap optimization.",
  "Explain when not to use it: Bubble Sort is educational, but Merge Sort, Quick Sort, or built-in sort are better for real large inputs.",
];

const bubbleSortPractice = [
  "Dry-run Bubble Sort on [4, 1, 3, 2]. Write the array after every comparison and every swap.",
  "Implement Bubble Sort with the no-swap optimization, then test it on an already sorted array.",
  "Change the condition to sort in descending order and explain what changed.",
  "Count how many comparisons and swaps happen for [3, 2, 1].",
];

const bubbleSortRevision = [
  "Bubble Sort compares adjacent pairs and swaps them if they are in the wrong order.",
  "Each full pass pushes the largest unsorted value to the right side.",
  "The sorted region grows from right to left; avoid touching it again.",
  "Worst-case and average time complexity are O(n^2) because nested loops compare many pairs.",
  "Space complexity is O(1) because sorting can happen in the same array with only a few variables.",
];

function BubbleSortCodeIntro() {
  return (
    <div className="mb-3 rounded-xl border border-border bg-background p-3 text-xs leading-5 text-muted-foreground">
      <p className="font-semibold text-foreground">Before reading the code</p>
      <p className="mt-1.5">
        The code has two loops. The outer loop controls how much of the right side is already sorted. The inner loop walks from left to right and compares neighboring pairs. A swap means the larger value moves one step right.
      </p>
    </div>
  );
}

function GenericCodeIntro({ model }: { model: ReturnType<typeof buildLearningModel> }) {
  return (
    <div className="mb-3 rounded-xl border border-border bg-background p-3 text-sm leading-6 text-muted-foreground">
      <p className="font-semibold text-foreground">Before reading the code</p>
      <p className="mt-1.5">
        First connect the code to the idea. This lesson tracks <span className="font-medium text-foreground">{model.state}</span>. Each line should either read input, update that state, apply the rule, or return the final answer.
      </p>
      <p className="mt-1.5">
        The rule to keep in mind is: <span className="font-medium text-foreground">{model.rule}</span>
      </p>
    </div>
  );
}

function BubbleSortCodeExplanation() {
  return (
    <div className="mt-3 grid gap-2 md:grid-cols-3">
      <ConceptMiniCard title="Outer loop" body="Shrinks the unsorted boundary. After each pass, one more ending value is fixed." />
      <ConceptMiniCard title="Inner loop" body="Compares adjacent pairs from left to right until it reaches the current boundary." />
      <ConceptMiniCard title="swapped flag" body="If no pair was swapped, the list is already sorted and the algorithm can stop early." />
    </div>
  );
}

function GenericCodeExplanation({ model }: { model: ReturnType<typeof buildLearningModel> }) {
  return (
    <div className="mt-3 grid gap-2 md:grid-cols-3">
      <ConceptMiniCard title="Input reading" body="Find where the code reads the current value, node, pointer, or subproblem. That is the start of each step." />
      <ConceptMiniCard title="State update" body={`After reading input, the code updates: ${model.state}. Write this state in your dry-run table.`} />
      <ConceptMiniCard title="Correctness check" body={`The answer is trustworthy when this remains true: ${model.invariant}`} />
    </div>
  );
}

function BubbleSortTimeComplexity() {
  return (
    <div className="space-y-3">
      <p className="text-xs leading-5 text-muted-foreground">
        Worst case is O(n^2). If the list is reversed, every value has to move through many neighbors. For 4 values, Bubble Sort may compare 3 + 2 + 1 pairs. For n values, that pattern grows roughly like n * n.
      </p>
      <div className="grid gap-2 text-xs sm:grid-cols-3">
        <ComplexityBox label="Best" value="O(n)" note="already sorted + no-swap check" />
        <ComplexityBox label="Average" value="O(n^2)" note="many repeated pair checks" />
        <ComplexityBox label="Worst" value="O(n^2)" note="reversed order" />
      </div>
      <div className="flex items-end gap-2 rounded-lg border border-border bg-background p-3" aria-label="Bubble Sort comparison growth">
        {[1, 2, 3, 4].map((height, index) => (
          <div key={height} className="flex flex-1 flex-col items-center gap-1">
            <div className="w-full rounded-t bg-emerald-500/80" style={{ height: `${height * 18}px` }} />
            <span className="text-[10px] text-muted-foreground">n={index + 2}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function GenericTimeComplexity({ lesson, model }: { lesson: Lesson; model: ReturnType<typeof buildLearningModel> }) {
  const complexity = lesson.chapter.slug === "searching"
    ? lesson.lesson.slug === "linear-search" || lesson.lesson.slug === "introduction"
      ? "O(n): in the worst case, every element must be checked once."
      : lesson.lesson.slug === "binary-search-on-answer"
        ? "O(log R × C): R is the size of the answer range and C is the cost of one feasibility check."
        : "O(log n): every comparison removes roughly half of the remaining candidate range."
    : lesson.lesson.timeComplexity;
  return (
    <div className="space-y-3">
      <p className="text-sm leading-6 text-muted-foreground">{complexity}</p>
      <div className="rounded-lg border border-border bg-background p-3 text-xs leading-5 text-muted-foreground">
        <p className="font-semibold text-foreground">How to think about it</p>
        <p className="mt-1.5">
          Count the operation that repeats as input grows. For this lesson, watch the state <span className="font-medium text-foreground">{model.state}</span> and ask: does it update once per item, once per edge, inside nested loops, or through recursive calls?
        </p>
      </div>
      <div className="flex items-end gap-2 rounded-lg border border-border bg-background p-3" aria-label="Growth intuition">
        {[1, 2, 3, 4].map((height, index) => (
          <div key={height} className="flex flex-1 flex-col items-center gap-1">
            <div className="w-full rounded-t bg-emerald-500/75" style={{ height: `${height * 14}px` }} />
            <span className="text-[10px] text-muted-foreground">n={index + 1}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BubbleSortSpaceComplexity() {
  return (
    <div className="space-y-3">
      <p className="text-xs leading-5 text-muted-foreground">
        Space is O(1) when Bubble Sort is done in-place. The algorithm does not create another big array. It only uses a few small variables like index, left, right, and swapped.
      </p>
      <div className="rounded-lg border border-border bg-background p-3 text-xs">
        <p className="font-semibold">Memory picture</p>
        <p className="mt-1.5 text-muted-foreground">Input array stays the same size: [5, 1, 4, 2]</p>
        <p className="mt-1 text-muted-foreground">Extra memory: i, end, swapped, temporary pair values</p>
      </div>
    </div>
  );
}

function GenericSpaceComplexity({ lesson, model }: { lesson: Lesson; model: ReturnType<typeof buildLearningModel> }) {
  const complexity = lesson.chapter.slug === "searching"
    ? "O(1) auxiliary space for the iterative implementation: only boundaries, middle, target, and an optional candidate are stored."
    : lesson.lesson.spaceComplexity;
  return (
    <div className="space-y-3">
      <p className="text-sm leading-6 text-muted-foreground">{complexity}</p>
      <div className="rounded-lg border border-border bg-background p-3 text-xs leading-5 text-muted-foreground">
        <p className="font-semibold text-foreground">Memory picture</p>
        <p className="mt-1.5">
          Space complexity asks what extra memory the algorithm keeps besides the input. Here, the important memory is the tracked state: <span className="font-medium text-foreground">{model.state}</span>.
        </p>
      </div>
    </div>
  );
}

function GenericQuiz({ model }: { model: ReturnType<typeof buildLearningModel> }) {
  return (
    <div className="mt-2 space-y-2 text-xs leading-5 text-muted-foreground">
      <p>1. What does this lesson rule do in one step?</p>
      <p>2. Which state must be tracked while dry-running: {model.state}?</p>
      <p>3. What invariant proves that the current step is still correct?</p>
      <p>4. Which edge case could break a careless implementation?</p>
    </div>
  );
}

function buildGenericRevision(model: ReturnType<typeof buildLearningModel>) {
  return [
    model.definition,
    `Mental model: ${model.mentalModel}`,
    `State to track: ${model.state}`,
    `Rule to apply: ${model.rule}`,
    `Correctness invariant: ${model.invariant}`,
  ];
}

function ComplexityBox({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-2.5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-bold">{value}</p>
      <p className="mt-1 text-[11px] leading-4 text-muted-foreground">{note}</p>
    </div>
  );
}

function ConceptMiniCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <p className="text-xs font-semibold">{title}</p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{body}</p>
    </div>
  );
}

function StudySection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28 rounded-xl border border-border bg-card p-3 shadow-sm sm:p-4">
      <h2 className="text-base font-semibold sm:text-lg">{title}</h2>
      <div className="mt-3">{children}</div>
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
    <ul className="space-y-2.5 text-sm text-muted-foreground">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <Icon aria-hidden={true} size={17} className="mt-0.5 shrink-0 text-emerald-700 dark:text-emerald-300" />
          <span className="leading-6">{item}</span>
        </li>
      ))}
    </ul>
  );
}
