import { NextResponse } from "next/server";

import { marathonProblemSchema, marathonRequestSchema } from "@/core/marathon/marathon";
import { internalApiFetch } from "@/lib/internal-api";
import { validatePromptSafety } from "@/lib/prompt-guard";
import { rateLimit } from "@/lib/rate-limit";
import { getCurrentSession } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ detail: "Authentication is required" }, { status: 401 });

  const parsed = marathonRequestSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ detail: "Choose a language, difficulty, and describe the problem you want." }, { status: 400 });

  const safety = validatePromptSafety(parsed.data.request);
  if (!safety.safe) return NextResponse.json({ detail: safety.reason }, { status: 400 });

  const limit = await rateLimit(`marathon:${session.user.id}`, 12, 60_000);
  if (!limit.allowed) return NextResponse.json({ detail: "Please wait briefly before generating another problem." }, { status: 429 });

  const response = await internalApiFetch("/api/v1/ai/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Student-Id": session.user.id },
    body: JSON.stringify({
      feature: "follow_up",
      chapterSlug: "coding-marathon",
      lessonSlug: parsed.data.difficulty,
      lessonTitle: "Coding Marathon problem generator",
      lessonMarkdown: buildContract(parsed.data.language, parsed.data.difficulty),
      question: parsed.data.request,
    }),
  });

  const payload = await response.json() as { answer?: string; detail?: string };
  if (!response.ok || !payload.answer) {
    return NextResponse.json({ detail: payload.detail ?? "The AI could not generate a problem right now." }, { status: response.status || 502 });
  }

  const candidate = extractJson(payload.answer);
  if (!candidate) return NextResponse.json({ detail: "The generated problem was incomplete. Please generate it again." }, { status: 502 });

  const problem = marathonProblemSchema.safeParse(candidate);
  if (!problem.success) return NextResponse.json({ detail: "The generated problem did not match the compiler contract. Please try again." }, { status: 502 });

  return NextResponse.json({ problem: problem.data });
}

function buildContract(language: "python" | "java" | "cpp", difficulty: "easy" | "medium" | "hard") {
  const languageRules = {
    python: "Provide a top-level Python function. Do not include input() or a __main__ block.",
    java: "Provide `import java.util.*;` and a non-public `class Solution` with one static method. Do not include a Main class.",
    cpp: "Provide includes, `using namespace std;`, and a top-level function. Do not include main().",
  }[language];

  return [
    `Create exactly one ${difficulty} DSA problem for the product's ${language} function-based judge.`,
    "Return ONLY one valid JSON object. No markdown fences, preface, comments outside strings, or trailing text.",
    "Required JSON keys: title, difficulty, topic, statement, inputFormat, outputFormat, constraints, functionName, testCases, hints, approach, complexity, starterCode, solutionCode.",
    "difficulty must be exactly Easy, Medium, or Hard. complexity must be {\"time\": string, \"space\": string}.",
    "Each test case must be {input, output, explanation}. Provide 3 to 5 diverse deterministic tests including edge cases.",
    "Every test input MUST use comma-separated named assignments such as `nums=[2, 7, 11], target=9`. Values must be valid Python literals because the judge parses them.",
    "The function parameters and their order MUST exactly match those named assignments in every test.",
    "Outputs must match the function return value; never use console input/output.",
    `${languageRules}`,
    "starterCode and solutionCode must both be complete compiler-ready source strings for that contract. solutionCode must be correct for every stated constraint, not just samples.",
    "Use JSON escape sequences correctly inside source strings. Keep the statement precise and the solution professional.",
  ].join("\n");
}

function extractJson(answer: string): unknown | null {
  const cleaned = answer.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return null;
  }
}
