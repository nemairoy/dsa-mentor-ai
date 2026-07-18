import Link from "next/link";
import { FileQuestion, Layers3, MessageSquareText, Sparkles } from "lucide-react";

import { BrandLockup } from "@/components/brand/brand-logo";
import { PageHeader } from "@/components/layout/page-header";
import { PremiumCard } from "@/components/shared/premium-card";

const prompts = ["Explain again", "Simplify this topic", "Give another example", "Generate quiz", "Create flashcards", "Compare algorithms"];

export default function AiTutorPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="AI Tutor" description="A focused tutoring desk for DSA questions. For lesson-aware answers, open a lesson and use the pinned tutor panel." />
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <PremiumCard className="min-h-[440px]">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <BrandLockup size="sm" subtitle="Ask precise questions, request examples, or revise a concept." compact />
          </div>
          <div className="mt-4 space-y-3">
            <div className="max-w-xl rounded-xl bg-muted p-3 text-xs leading-5">
              Choose a prompt below or open any lesson for a fully contextual AI chat with lesson markdown, RAG context, and your learning state.
            </div>
            <div className="ml-auto max-w-xl rounded-xl bg-emerald-600 p-3 text-xs leading-5 text-white">
              Help me understand arrays with a real-world analogy.
            </div>
            <div className="max-w-xl rounded-xl bg-muted p-3 text-xs leading-5">
              Think of an array like numbered lockers in a row. You can jump directly to locker 5 because every locker has a known position.
            </div>
          </div>
          <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {prompts.map((prompt) => (
              <button key={prompt} type="button" className="rounded-lg border border-border px-3 py-2 text-left text-xs transition hover:bg-muted">
                {prompt}
              </button>
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-border bg-background p-2.5">
            <div className="flex items-center gap-2 rounded-xl bg-card px-3 py-2.5 text-sm text-muted-foreground">
              <MessageSquareText aria-hidden={true} size={18} />
              Open a lesson to start contextual chat
            </div>
          </div>
        </PremiumCard>
        <aside className="space-y-4">
          {[
            { icon: Layers3, title: "Lesson context", text: "Best answers come from the right panel inside lesson pages." },
            { icon: FileQuestion, title: "Quiz-ready", text: "Generate MCQs, coding tasks, and revision prompts from current content." },
            { icon: Sparkles, title: "Beginner-friendly", text: "Ask for analogies, simpler words, or alternate visual explanations." },
          ].map((item) => (
            <PremiumCard key={item.title}>
              <item.icon aria-hidden={true} size={20} className="text-emerald-700 dark:text-emerald-300" />
              <h2 className="mt-4 font-semibold">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.text}</p>
            </PremiumCard>
          ))}
          <Link href="/learn" className="block rounded-xl bg-primary p-3 text-xs font-medium text-primary-foreground transition hover:opacity-90">
            Choose a lesson
          </Link>
        </aside>
      </section>
    </div>
  );
}
