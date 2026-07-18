import { z } from "zod";

export const practiceAttemptInputSchema = z.object({
  problemId: z.string().uuid(),
  status: z.enum(["attempted", "solved", "review"]),
  timeSpentSeconds: z.number().int().min(0).default(0),
  mistakes: z.array(z.string()).default([]),
  notes: z.string().optional(),
});

export const visualizationUsageInputSchema = z.object({
  animationId: z.string().min(1),
  lessonId: z.string().optional(),
  event: z.enum(["opened", "played", "completed"]),
  durationSeconds: z.number().int().min(0).default(0),
});

export type PracticeAttemptInput = z.infer<typeof practiceAttemptInputSchema>;
export type VisualizationUsageInput = z.infer<typeof visualizationUsageInputSchema>;

export type IntelligenceSnapshot = {
  completedLessons: number;
  startedLessons: number;
  totalLessons: number;
  bookmarks: number;
  notes: number;
  aiConversations: number;
  visualizations: number;
  solvedProblems: number;
  attemptedProblems: number;
  studyDays: number;
  studyTimeMinutes: number;
  currentStreak: number;
};

export type TopicMastery = {
  topic: string;
  completed: number;
  total: number;
  mastery: number;
};

export type DailyActivity = {
  date: string;
  label: string;
  lessons: number;
  practice: number;
  notes: number;
  visualizations: number;
  total: number;
};

export type LearningAnalytics = {
  learningScore: number;
  confidenceScore: number;
  consistencyScore: number;
  revisionScore: number;
  problemSolvingScore: number;
  overallReadiness: "Beginner" | "Intermediate" | "Advanced" | "Interview Ready";
  topicMastery: TopicMastery[];
  weakTopics: TopicMastery[];
  strongTopics: TopicMastery[];
  snapshot: IntelligenceSnapshot;
};

export type PracticeProblem = {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topic: string;
  subtopic: string;
  tags: string[];
  companyTags: string[];
  explanation: string;
  hints: string[];
  editorial: string;
  solution: string;
  testCases: Array<{
    input: string;
    output: string;
    explanation: string;
  }>;
  judgeMetadata: {
    timeLimitMs?: number;
    memoryLimitMb?: number;
    functionName?: string;
  };
  lessonId: string;
  chapterSlug: string;
  lessonSlug: string;
  solved?: boolean;
};

export type Recommendation = {
  type: "lesson" | "practice" | "revision" | "visualization" | "ai";
  title: string;
  reason: string;
  href: string;
  priority: number;
};

export type LearningPlan = {
  lessons: Recommendation[];
  practice: Recommendation[];
  revision: Recommendation[];
  estimatedStudyTimeMinutes: number;
  targetCompletion: string;
};

export type Achievement = {
  id: string;
  title: string;
  description: string;
  xp: number;
  badge: string;
  earned: boolean;
};
