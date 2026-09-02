import { NextResponse } from "next/server";

import { marathonProblemSchema, marathonRequestSchema } from "@/core/marathon/marathon";
import { logger } from "@/infrastructure/logging/logger";
import { generateWithGeminiFallback } from "@/lib/gemini-fallback";
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

  let lastFailure = "The AI response was incomplete.";
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const aiRequest = {
      feature: "follow_up" as const,
      chapterSlug: "coding-marathon",
      lessonSlug: parsed.data.difficulty,
      lessonTitle: "Coding Marathon problem generator",
      lessonMarkdown: buildContract(parsed.data.language, parsed.data.difficulty),
      question: attempt === 0
        ? parsed.data.request
        : `${parsed.data.request}\nThe previous response did not pass validation. Return a smaller complete JSON object with every required key, valid source strings, and at least two test cases.`,
    };

    let answer = "";
    if (attempt === 0) {
      try {
        const response = await internalApiFetch("/api/v1/ai/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Student-Id": session.user.id },
          body: JSON.stringify(aiRequest),
          signal: AbortSignal.timeout(7_000),
        });
        const payload = await response.json() as { answer?: string; detail?: string };
        if (response.ok && payload.answer) answer = payload.answer;
        else lastFailure = payload.detail ?? `AI API returned ${response.status}.`;
      } catch (error) {
        lastFailure = "The AI API timed out during startup.";
        logger.warn("Marathon AI API unavailable; using direct fallback", { error });
      }
    }

    if (!answer) {
      try {
        const fallback = await generateWithGeminiFallback(aiRequest, {
          json: true,
          maxOutputTokens: 8192,
          timeoutMs: 16_000,
        });
        answer = fallback.answer;
      } catch (error) {
        lastFailure = "The AI provider is temporarily unavailable.";
        logger.error("Marathon direct AI generation failed", { attempt: attempt + 1, error });
        continue;
      }
    }

    const candidate = extractJson(answer);
    const problem = candidate ? marathonProblemSchema.safeParse(normalizeProblem(candidate, parsed.data.language, parsed.data.difficulty)) : null;
    if (problem?.success && isJudgeCompatible(problem.data, parsed.data.language)) {
      return NextResponse.json({ problem: problem.data });
    }
    if (problem?.success) {
      lastFailure = "The generated function used a type or program structure that the function-based judge does not accept.";
      logger.warn("Marathon AI response violated judge contract", { attempt: attempt + 1, language: parsed.data.language });
      continue;
    }
    lastFailure = problem?.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).slice(0, 3).join("; ") || "The AI returned malformed JSON.";
    logger.warn("Marathon AI response failed validation", { attempt: attempt + 1, reason: lastFailure });
  }

  return NextResponse.json({ detail: `The AI could not create a compiler-ready challenge (${lastFailure}). Please try again.` }, { status: 502 });
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
    "Every test input MUST use comma-separated named assignments such as `nums=[2, 7, 11], target=9`. Values are restricted to numbers, booleans, strings, arrays, and nested arrays written as valid Python literals.",
    "The function parameters and their order MUST exactly match those named assignments in every test.",
    "Never use TreeNode, ListNode, Node, custom classes, maps, sets, tuples, or console/stdin input. Represent trees and linked lists as arrays; use -1 as the missing-node sentinel and explain it in the input format.",
    "Outputs must match the function return value; never use console input/output.",
    `${languageRules}`,
    "starterCode and solutionCode must both be complete compiler-ready source strings for that contract. solutionCode must be correct for every stated constraint, not just samples.",
    "Use JSON escape sequences correctly inside source strings. Keep the statement precise and the solution professional.",
  ].join("\n");
}

function isJudgeCompatible(problem: { functionName: string; starterCode: string; solutionCode: string; testCases: Array<{ input: string }> }, language: "python" | "java" | "cpp") {
  const combinedCode = `${problem.starterCode}\n${problem.solutionCode}`;
  if (/\b(?:TreeNode|ListNode)\b|\bNode\s*[*&]?\s+[A-Za-z_]/.test(combinedCode)) return false;
  if (language === "java" && /\b(?:Map|HashMap|Set|HashSet)\s*</.test(combinedCode)) return false;
  if (language === "python" && (/\binput\s*\(/.test(combinedCode) || /if\s+__name__\s*==/.test(combinedCode))) return false;
  if (language === "java" && /\bclass\s+Main\b|\bstatic\s+void\s+main\s*\(/.test(combinedCode)) return false;
  if (language === "cpp" && /\bint\s+main\s*\(/.test(combinedCode)) return false;
  const functionPattern = new RegExp(`\\b${escapeRegExp(problem.functionName)}\\s*\\(`);
  if (!functionPattern.test(problem.starterCode) || !functionPattern.test(problem.solutionCode)) return false;
  return problem.testCases.every((test) => hasNamedAssignments(test.input));
}

function hasNamedAssignments(input: string) {
  let depth = 0;
  let hasEquals = false;
  for (const character of input) {
    if (character === "[" || character === "(" || character === "{") depth += 1;
    if (character === "]" || character === ")" || character === "}") depth -= 1;
    if (character === "=" && depth === 0) hasEquals = true;
    if (depth < 0) return false;
  }
  return depth === 0 && hasEquals;
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

function normalizeProblem(candidate: unknown, language: "python" | "java" | "cpp", requestedDifficulty: "easy" | "medium" | "hard") {
  const outer = asRecord(candidate);
  if (!outer) return candidate;
  const source = asRecord(outer.problem) ?? outer;

  const solutionCode = cleanCode(readString(source, "solutionCode", "solution_code", "solution", "completeSolution", "referenceSolution"));
  const starterCode = cleanCode(readString(source, "starterCode", "starter_code", "template", "codeTemplate"));
  const testsValue = readValue(source, "testCases", "test_cases", "samples", "examples");
  const tests = Array.isArray(testsValue) ? testsValue.map(normalizeTestCase).filter(Boolean) : [];
  const difficultyValue = readString(source, "difficulty").toLowerCase();
  const difficulty = difficultyValue.includes("hard") ? "Hard" : difficultyValue.includes("medium") ? "Medium" : difficultyValue.includes("easy") ? "Easy" : capitalize(requestedDifficulty);
  const complexitySource = asRecord(readValue(source, "complexity"));
  const constraints = stringArray(readValue(source, "constraints", "constraint"));
  const hints = stringArray(readValue(source, "hints", "hint"));

  return {
    title: readString(source, "title", "problemTitle", "name") || "Coding Marathon Challenge",
    difficulty,
    topic: readString(source, "topic", "category") || "Data Structures and Algorithms",
    statement: readString(source, "statement", "description", "problemStatement") || "Solve the challenge using the required function contract.",
    inputFormat: readString(source, "inputFormat", "input_format") || "Use the named function parameters shown in each test case.",
    outputFormat: readString(source, "outputFormat", "output_format") || "Return the requested result from the function.",
    constraints: constraints.length ? constraints : ["Use the function signature exactly as provided."],
    functionName: readString(source, "functionName", "function_name") || inferFunctionName(starterCode || solutionCode, language),
    testCases: tests,
    hints: hints.length ? hints : ["Start by identifying the input-output relationship and the required data structure."],
    approach: readString(source, "approach", "editorial", "explanation", "solutionExplanation") || "Apply the appropriate data structure while processing each input element once where possible.",
    complexity: {
      time: readString(complexitySource, "time") || readString(source, "timeComplexity", "time_complexity") || "See the solution analysis.",
      space: readString(complexitySource, "space") || readString(source, "spaceComplexity", "space_complexity") || "See the solution analysis.",
    },
    starterCode,
    solutionCode,
  };
}

function normalizeTestCase(value: unknown) {
  const test = asRecord(value);
  if (!test) return null;
  const input = readValue(test, "input", "stdin", "args", "parameters");
  const output = readValue(test, "output", "expected", "expectedOutput", "expected_output");
  if (input === undefined || output === undefined) return null;
  return {
    input: typeof input === "string" ? input : namedAssignments(input),
    output: typeof output === "string" ? output : pythonLiteral(output),
    explanation: readString(test, "explanation", "reason"),
  };
}

function namedAssignments(value: unknown) {
  const record = asRecord(value);
  if (record) return Object.entries(record).map(([key, item]) => `${key}=${pythonLiteral(item)}`).join(", ");
  if (Array.isArray(value)) return value.map((item, index) => `arg${index + 1}=${pythonLiteral(item)}`).join(", ");
  return `input=${pythonLiteral(value)}`;
}

function pythonLiteral(value: unknown): string {
  if (value === null) return "None";
  if (value === true) return "True";
  if (value === false) return "False";
  if (typeof value === "string") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(pythonLiteral).join(", ")}]`;
  const record = asRecord(value);
  if (record) return `{${Object.entries(record).map(([key, item]) => `${JSON.stringify(key)}: ${pythonLiteral(item)}`).join(", ")}}`;
  return String(value);
}

function cleanCode(value: string) {
  return value.trim().replace(/^```(?:python|py|java|cpp|c\+\+|c)?\s*/i, "").replace(/\s*```$/, "").trim();
}

function inferFunctionName(code: string, language: "python" | "java" | "cpp") {
  const pattern = language === "python" ? /def\s+([A-Za-z_]\w*)\s*\(/ : language === "java" ? /static\s+[\w<>\[\], ?]+\s+([A-Za-z_]\w*)\s*\(/ : /(?:auto|int|long long|bool|string|vector<[^>]+>)\s+([A-Za-z_]\w*)\s*\(/;
  return pattern.exec(code)?.[1] ?? "solve";
}

function stringArray(value: unknown) {
  if (Array.isArray(value)) return value.map((item) => typeof item === "string" ? item.trim() : String(item)).filter(Boolean);
  if (typeof value === "string") return value.split(/\r?\n|;/).map((item) => item.replace(/^[-*\d.)\s]+/, "").trim()).filter(Boolean);
  return [];
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function readValue(source: Record<string, unknown> | null, ...keys: string[]) {
  if (!source) return undefined;
  for (const key of keys) if (source[key] !== undefined && source[key] !== null) return source[key];
  return undefined;
}

function readString(source: Record<string, unknown> | null, ...keys: string[]) {
  const value = readValue(source, ...keys);
  return typeof value === "string" ? value.trim() : typeof value === "number" || typeof value === "boolean" ? String(value) : "";
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
