import type { LessonSummary } from "@/core/content/domain/content";

type LessonMetaSectionsProps = {
  lesson: LessonSummary;
};

export function LessonMetaSections({ lesson }: LessonMetaSectionsProps) {
  return (
    <div className="mt-8 grid gap-4 md:grid-cols-2">
      <InfoList title="Prerequisites" items={lesson.prerequisites} />
      <InfoList title="Learning Objectives" items={lesson.learningObjectives} />
      <section className="rounded-lg border border-border p-3.5">
        <h2 className="font-semibold">Complexity Table</h2>
        <table className="mt-3 w-full text-sm">
          <tbody>
            <tr className="border-b border-border">
              <th className="py-2 text-left font-medium">Time Complexity</th>
              <td className="py-2 text-muted-foreground">{lesson.timeComplexity}</td>
            </tr>
            <tr>
              <th className="py-2 text-left font-medium">Space Complexity</th>
              <td className="py-2 text-muted-foreground">{lesson.spaceComplexity}</td>
            </tr>
          </tbody>
        </table>
      </section>
      <InfoList title="Common Mistakes" items={lesson.commonMistakes} />
      <InfoList title="Interview Tips" items={lesson.interviewTips} />
      <InfoList title="Practice Problems" items={lesson.practiceProblems} />
    </div>
  );
}

function InfoList({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="rounded-lg border border-border p-3.5">
      <h2 className="font-semibold">{title}</h2>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
