import { z } from "zod";

export const marathonLanguageSchema = z.enum(["python", "java", "cpp"]);
export type MarathonLanguage = z.infer<typeof marathonLanguageSchema>;

export const marathonRequestSchema = z.object({
  request: z.string().trim().min(3).max(1200),
  language: marathonLanguageSchema,
  difficulty: z.enum(["easy", "medium", "hard"]),
});

export const marathonProblemSchema = z.object({
  title: z.string().min(3).max(140),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  topic: z.string().min(2).max(80),
  statement: z.string().min(20).max(5000),
  inputFormat: z.string().min(3).max(1200),
  outputFormat: z.string().min(3).max(1200),
  constraints: z.array(z.string().min(1).max(300)).min(1).max(10),
  functionName: z.string().regex(/^[A-Za-z_][A-Za-z0-9_]*$/),
  testCases: z.array(z.object({
    input: z.string().min(1).max(1000),
    output: z.string().max(1000),
    explanation: z.string().max(1000).optional().default(""),
  })).min(2).max(5),
  hints: z.array(z.string().min(2).max(500)).min(1).max(5),
  approach: z.string().min(10).max(3000),
  complexity: z.object({ time: z.string().min(2).max(120), space: z.string().min(2).max(120) }),
  starterCode: z.string().min(10).max(16000),
  solutionCode: z.string().min(10).max(20000),
});

export type MarathonProblem = z.infer<typeof marathonProblemSchema>;

export const languageLabels: Record<MarathonLanguage, string> = {
  python: "Python",
  java: "Java",
  cpp: "C++",
};
