import type { ChapterSummary } from "@/core/content/domain/content";
import {
  practiceAttemptInputSchema,
  visualizationUsageInputSchema,
  type Achievement,
  type LearningAnalytics,
  type LearningPlan,
  type PracticeAttemptInput,
  type Recommendation,
  type VisualizationUsageInput,
} from "@/core/intelligence/domain/intelligence";
import { PostgresIntelligenceRepository } from "@/core/intelligence/infrastructure/postgres-intelligence-repository";

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

type AnalyticsCacheEntry = {
  expiresAt: number;
  value: Promise<LearningAnalytics>;
};

type RecommendationCacheEntry = {
  expiresAt: number;
  value: Promise<Recommendation[]>;
};

export class IntelligenceService {
  private analyticsCache = new Map<string, AnalyticsCacheEntry>();
  private recommendationCache = new Map<string, RecommendationCacheEntry>();

  constructor(private readonly repository: PostgresIntelligenceRepository) {}

  async getAnalytics(userId: string, roadmap: ChapterSummary[]): Promise<LearningAnalytics> {
    const totalLessons = roadmap.reduce((total, chapter) => total + chapter.lessons.length, 0);
    const cacheKey = `${userId}:${totalLessons}`;
    const cached = this.analyticsCache.get(cacheKey);

    if (cached && cached.expiresAt > Date.now()) {
      return cached.value;
    }

    const value = this.computeAnalytics(userId, roadmap, totalLessons);
    this.analyticsCache.set(cacheKey, { expiresAt: Date.now() + 5_000, value });
    value.catch(() => this.analyticsCache.delete(cacheKey));
    return value;
  }

  private async computeAnalytics(userId: string, roadmap: ChapterSummary[], totalLessons: number): Promise<LearningAnalytics> {
    const [snapshot, topicMastery] = await Promise.all([
      this.repository.getSnapshot(userId, totalLessons),
      this.repository.getTopicMastery(
        userId,
        roadmap.map((chapter) => ({ slug: chapter.slug, title: chapter.title, total: chapter.lessons.length })),
      ),
    ]);
    const completionRate = totalLessons ? (snapshot.completedLessons / totalLessons) * 100 : 0;
    const practiceRate = snapshot.attemptedProblems ? (snapshot.solvedProblems / snapshot.attemptedProblems) * 100 : 0;
    const consistencyScore = clamp(snapshot.currentStreak * 12 + snapshot.studyDays * 2);
    const revisionScore = clamp(snapshot.bookmarks * 2 + snapshot.notes * 3);
    const confidenceScore = clamp((completionRate + practiceRate + revisionScore) / 3);
    const problemSolvingScore = clamp(practiceRate + Math.min(snapshot.solvedProblems, 50));
    const learningScore = clamp((completionRate + consistencyScore + revisionScore + problemSolvingScore) / 4);

    return {
      learningScore,
      confidenceScore,
      consistencyScore,
      revisionScore,
      problemSolvingScore,
      overallReadiness: this.readiness(learningScore, snapshot.solvedProblems),
      topicMastery,
      weakTopics: topicMastery.filter((topic) => topic.mastery < 40).slice(0, 6),
      strongTopics: topicMastery.filter((topic) => topic.mastery >= 70).slice(0, 6),
      snapshot,
    };
  }

  async getRecommendations(userId: string, roadmap: ChapterSummary[]): Promise<Recommendation[]> {
    const cacheKey = `${userId}:${roadmap.length}:${roadmap[0]?.slug ?? "none"}`;
    const cached = this.recommendationCache.get(cacheKey);

    if (cached && cached.expiresAt > Date.now()) {
      return cached.value;
    }

    const value = this.computeRecommendations(userId, roadmap);
    this.recommendationCache.set(cacheKey, { expiresAt: Date.now() + 5_000, value });
    value.catch(() => this.recommendationCache.delete(cacheKey));
    return value;
  }

  private async computeRecommendations(userId: string, roadmap: ChapterSummary[]): Promise<Recommendation[]> {
    const analytics = await this.getAnalytics(userId, roadmap);
    const weakTopic = analytics.weakTopics[0] ?? analytics.topicMastery[0];
    const chapter = roadmap.find((item) => item.title === weakTopic?.topic) ?? roadmap[0];
    const lesson = chapter?.lessons[0];

    if (!chapter || !lesson) return [];

    return [
      {
        type: "lesson",
        title: `Continue ${chapter.title}`,
        reason: `${chapter.title} is the highest-impact next topic based on current mastery.`,
        href: lesson.href,
        priority: 1,
      },
      {
        type: "practice",
        title: `${chapter.title} practice`,
        reason: "Practice accuracy improves interview readiness faster than reading alone.",
        href: `/practice?chapterSlug=${chapter.slug}`,
        priority: 2,
      },
      {
        type: "revision",
        title: `${chapter.title} revision`,
        reason: "Review weak topics before moving deeper into advanced material.",
        href: lesson.href,
        priority: 3,
      },
      {
        type: "visualization",
        title: "Open a matching visualization",
        reason: "Visual explanations strengthen recall for procedural algorithms.",
        href: "/visualizations",
        priority: 4,
      },
      {
        type: "ai",
        title: "Ask AI for a focused explanation",
        reason: "Use the AI coach to clarify the exact concept that feels weak.",
        href: lesson.href,
        priority: 5,
      },
    ];
  }

  async getLearningPlan(userId: string, roadmap: ChapterSummary[]): Promise<LearningPlan> {
    const recommendations = await this.getRecommendations(userId, roadmap);
    const firstLessonMinutes = recommendations[0]
      ? roadmap.flatMap((chapter) => chapter.lessons).find((lesson) => lesson.href === recommendations[0]?.href)?.durationMinutes
      : undefined;
    return {
      lessons: recommendations.filter((item) => item.type === "lesson").slice(0, 2),
      practice: recommendations.filter((item) => item.type === "practice").slice(0, 2),
      revision: recommendations.filter((item) => item.type === "revision").slice(0, 2),
      estimatedStudyTimeMinutes: (firstLessonMinutes ?? 25) + 20,
      targetCompletion: "Complete the recommended lesson and one related practice task.",
    };
  }

  getDailyActivity(userId: string, days: number) {
    return this.repository.getDailyActivity(userId, days);
  }

  async getAchievements(userId: string, roadmap: ChapterSummary[]): Promise<Achievement[]> {
    const analytics = await this.getAnalytics(userId, roadmap);
    const [definitions, earned] = await Promise.all([
      this.repository.listAchievementDefinitions(),
      this.repository.listEarnedAchievementIds(userId),
    ]);
    const newlyEarned = new Set<string>();

    for (const definition of definitions) {
      if (this.qualifies(definition.id, analytics)) {
        await this.repository.awardAchievement(userId, definition.id);
        newlyEarned.add(definition.id);
      }
    }

    return definitions.map((definition) => ({
      id: definition.id,
      title: definition.title,
      description: definition.description,
      xp: Number(definition.xp),
      badge: definition.badge,
      earned: earned.has(definition.id) || newlyEarned.has(definition.id),
    }));
  }

  listPracticeProblems(userId: string, filters: { chapterSlug?: string; lessonSlug?: string; difficulty?: string; status?: string }) {
    return this.repository.listPracticeProblems(userId, filters);
  }

  getPracticeProblem(problemId: string) {
    return this.repository.getPracticeProblem(problemId);
  }

  recordPracticeAttempt(userId: string, input: PracticeAttemptInput) {
    this.clearUserAnalyticsCache(userId);
    return this.repository.recordPracticeAttempt(userId, practiceAttemptInputSchema.parse(input));
  }

  recordVisualizationUsage(userId: string, input: VisualizationUsageInput) {
    this.clearUserAnalyticsCache(userId);
    return this.repository.recordVisualizationUsage(userId, visualizationUsageInputSchema.parse(input));
  }

  async getWeeklyReport(userId: string, roadmap: ChapterSummary[]) {
    const analytics = await this.getAnalytics(userId, roadmap);
    return {
      summary: "Weekly learning report",
      learning: analytics.snapshot,
      topicPerformance: analytics.topicMastery.slice(0, 10),
      weakTopics: analytics.weakTopics,
      strongTopics: analytics.strongTopics,
    };
  }

  private readiness(score: number, solvedProblems: number): LearningAnalytics["overallReadiness"] {
    if (score >= 80 && solvedProblems >= 75) return "Interview Ready";
    if (score >= 60) return "Advanced";
    if (score >= 35) return "Intermediate";
    return "Beginner";
  }

  private qualifies(id: string, analytics: LearningAnalytics) {
    const snapshot = analytics.snapshot;
    if (id === "first_lesson") return snapshot.completedLessons >= 1;
    if (id === "ten_lessons") return snapshot.completedLessons >= 10;
    if (id === "problem_solver") return snapshot.solvedProblems >= 10;
    if (id === "ai_explorer") return snapshot.aiConversations >= 10;
    if (id === "visualization_master") return snapshot.visualizations >= 10;
    if (id === "perfect_week") return snapshot.currentStreak >= 7;
    return false;
  }

  private clearUserAnalyticsCache(userId: string) {
    for (const key of this.analyticsCache.keys()) {
      if (key.startsWith(`${userId}:`)) {
        this.analyticsCache.delete(key);
      }
    }
    for (const key of this.recommendationCache.keys()) {
      if (key.startsWith(`${userId}:`)) {
        this.recommendationCache.delete(key);
      }
    }
  }
}
