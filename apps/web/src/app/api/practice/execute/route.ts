import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentSession } from "@/lib/session";

export const runtime = "nodejs";

const execFileAsync = promisify(execFile);

const executeSchema = z.object({
  language: z.enum(["python", "java", "cpp"]),
  code: z.string().min(1).max(20000),
  functionName: z.string().min(1).max(120),
  testCases: z.array(z.object({
    input: z.string(),
    output: z.string(),
    explanation: z.string().optional(),
  })).min(1).max(5),
});

type SampleResult = {
  sample: number;
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
  error?: string;
};

const judge0LanguageIds = {
  cpp: envNumber("JUDGE0_CPP_LANGUAGE_ID", 54),
  java: envNumber("JUDGE0_JAVA_LANGUAGE_ID", 62),
  python: envNumber("JUDGE0_PYTHON_LANGUAGE_ID", 71),
};

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ detail: "Authentication is required" }, { status: 401 });
  }

  const body = executeSchema.parse(await request.json());
  const results: SampleResult[] = [];

  for (const [index, testCase] of body.testCases.entries()) {
    const result = await runOneSample(body.language, body.code, body.functionName, testCase.input, testCase.output, index + 1);
    results.push(result);
  }

  return NextResponse.json({
    ok: results.every((result) => result.passed),
    results,
  });
}

async function runOneSample(language: "python" | "java" | "cpp", code: string, functionName: string, input: string, expected: string, sample: number): Promise<SampleResult> {
  try {
    const assignments = parseAssignments(input);
    const actual = shouldUseLocalRunner()
      ? await runWithLocalRunner(language, code, functionName, assignments)
      : await runWithJudge0(language, code, functionName, assignments);

    return {
      sample,
      input,
      expected,
      actual,
      passed: normalizeValue(actual) === normalizeValue(expected),
    };
  } catch (error) {
    return {
      sample,
      input,
      expected,
      actual: "",
      passed: false,
      error: error instanceof Error ? error.message : "Execution failed",
    };
  }
}

function shouldUseLocalRunner() {
  return process.env.CODE_EXECUTION_PROVIDER === "local";
}

async function runWithLocalRunner(language: "python" | "java" | "cpp", code: string, functionName: string, assignments: Array<[string, string]>) {
  if (language === "python") return runPython(code, functionName, assignments);
  if (language === "java") return runJava(code, functionName, assignments);
  return runCpp(code, functionName, assignments);
}

async function runWithJudge0(language: "python" | "java" | "cpp", code: string, functionName: string, assignments: Array<[string, string]>) {
  const sourceCode = buildJudge0Source(language, code, functionName, assignments);
  const response = await fetch(`${judge0BaseUrl()}/submissions?base64_encoded=true&wait=true`, {
    method: "POST",
    headers: judge0Headers(),
    body: JSON.stringify({
      source_code: encodeBase64(sourceCode),
      language_id: judge0LanguageIds[language],
      cpu_time_limit: envNumber("JUDGE0_CPU_TIME_LIMIT", 3),
      wall_time_limit: envNumber("JUDGE0_WALL_TIME_LIMIT", 6),
      memory_limit: envNumber("JUDGE0_MEMORY_LIMIT_KB", 128000),
    }),
    signal: AbortSignal.timeout(envNumber("JUDGE0_REQUEST_TIMEOUT_MS", 15000)),
  });

  const payload = await response.json() as {
    stdout?: string | null;
    stderr?: string | null;
    compile_output?: string | null;
    message?: string | null;
    status?: { id?: number; description?: string };
  };

  if (!response.ok) {
    throw new Error(payload.message ?? payload.stderr ?? payload.compile_output ?? `Judge0 rejected the execution request (${response.status}).`);
  }

  if (payload.status?.id && payload.status.id > 3) {
    throw new Error(decodeMaybeBase64(payload.stderr) ?? decodeMaybeBase64(payload.compile_output) ?? payload.message ?? payload.status.description ?? "Execution failed.");
  }

  return extractResult(decodeMaybeBase64(payload.stdout) ?? "", decodeMaybeBase64(payload.stderr) ?? decodeMaybeBase64(payload.compile_output) ?? "");
}

function judge0BaseUrl() {
  return (process.env.JUDGE0_BASE_URL ?? "https://ce.judge0.com").replace(/\/$/, "");
}

function judge0Headers() {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (process.env.JUDGE0_API_KEY) {
    headers["X-RapidAPI-Key"] = process.env.JUDGE0_API_KEY;
  }
  if (process.env.JUDGE0_RAPIDAPI_HOST) {
    headers["X-RapidAPI-Host"] = process.env.JUDGE0_RAPIDAPI_HOST;
  }
  return headers;
}

function envNumber(name: string, fallback: number) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function encodeBase64(value: string) {
  return Buffer.from(value, "utf8").toString("base64");
}

function decodeMaybeBase64(value: string | null | undefined) {
  if (!value) return null;
  try {
    return Buffer.from(value, "base64").toString("utf8");
  } catch {
    return value;
  }
}

function buildJudge0Source(language: "python" | "java" | "cpp", code: string, functionName: string, assignments: Array<[string, string]>) {
  if (language === "python") {
    const args = assignments.map(([, value]) => value).join(", ");
    return `${code}

if __name__ == "__main__":
    result = ${functionName}(${args})
    print("__RESULT__" + repr(result))
`;
  }

  if (language === "java") {
    const args = assignments.map(([, value]) => toJavaLiteral(value)).join(", ");
    return `${code}

class Main {
  public static void main(String[] args) {
    Object result = Solution.${functionName}(${args});
    System.out.println("__RESULT__" + format(result));
  }

  static String format(Object value) {
    if (value == null) return "None";
    if (value instanceof Boolean) return ((Boolean) value) ? "True" : "False";
    return String.valueOf(value);
  }
}
`;
  }

  const args = assignments.map(([, value]) => toCppLiteral(value)).join(", ");
  return `${code}

template <typename T>
string dsaFormat(const T& value) {
  return to_string(value);
}

string dsaFormat(bool value) { return value ? "True" : "False"; }
string dsaFormat(const string& value) { return value; }
string dsaFormat(const char* value) { return string(value); }

template <typename T>
string dsaFormat(const vector<T>& values) {
  string output = "[";
  for (size_t i = 0; i < values.size(); ++i) {
    if (i) output += ", ";
    output += dsaFormat(values[i]);
  }
  output += "]";
  return output;
}

template <typename T>
string dsaFormat(const map<string, T>& values) {
  string output = "{ ";
  bool first = true;
  for (const auto& item : values) {
    if (!first) output += ", ";
    output += item.first + ": " + dsaFormat(item.second);
    first = false;
  }
  output += " }";
  return output;
}

int main() {
  auto result = ${functionName}(${args});
  cout << "__RESULT__" << dsaFormat(result) << endl;
  return 0;
}
`;
}

async function runPython(code: string, functionName: string, assignments: Array<[string, string]>) {
  const dir = await mkdtemp(path.join(tmpdir(), "dsa-python-"));
  const filePath = path.join(dir, "solution.py");
  const args = assignments.map(([, value]) => value).join(", ");
  const source = `${code}

if __name__ == "__main__":
    result = ${functionName}(${args})
    print("__RESULT__" + repr(result))
`;

  try {
    await writeFile(filePath, source, "utf8");
    const { stdout, stderr } = await execFileAsync("python", [filePath], { timeout: 3000, maxBuffer: 1024 * 1024 });
    return extractResult(stdout, stderr);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

async function runJava(code: string, functionName: string, assignments: Array<[string, string]>) {
  const dir = await mkdtemp(path.join(tmpdir(), "dsa-java-"));
  const filePath = path.join(dir, "Runner.java");
  const args = assignments.map(([, value]) => toJavaLiteral(value)).join(", ");
  const source = `${code}

class Runner {
  public static void main(String[] args) {
    Object result = Solution.${functionName}(${args});
    System.out.println("__RESULT__" + format(result));
  }

  static String format(Object value) {
    if (value == null) return "None";
    if (value instanceof Boolean) return ((Boolean) value) ? "True" : "False";
    return String.valueOf(value);
  }
}
`;

  try {
    await writeFile(filePath, source, "utf8");
    await execFileAsync("javac", [filePath], { cwd: dir, timeout: 5000, maxBuffer: 1024 * 1024 });
    const { stdout, stderr } = await execFileAsync("java", ["-cp", dir, "Runner"], { timeout: 3000, maxBuffer: 1024 * 1024 });
    return extractResult(stdout, stderr);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

async function runCpp(code: string, functionName: string, assignments: Array<[string, string]>): Promise<string> {
  void code;
  void functionName;
  void assignments;
  throw new Error("Local C++ execution is disabled. Use CODE_EXECUTION_PROVIDER=judge0 for Python, Java, and C++ sandbox execution.");
}

function extractResult(stdout: string, stderr: string) {
  const line = stdout.split(/\r?\n/).find((item) => item.startsWith("__RESULT__"));
  if (!line) {
    throw new Error(stderr.trim() || stdout.trim() || "Program finished without returning a result.");
  }
  return line.slice("__RESULT__".length).trim();
}

function parseAssignments(input: string) {
  return splitTopLevel(input).map((part) => {
    const index = part.indexOf("=");
    if (index === -1) throw new Error(`Invalid sample input: ${input}`);
    return [part.slice(0, index).trim(), part.slice(index + 1).trim()] as [string, string];
  });
}

function splitTopLevel(value: string) {
  const parts: string[] = [];
  let depth = 0;
  let quote: string | null = null;
  let start = 0;

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    if (quote) {
      if (char === quote && value[index - 1] !== "\\") quote = null;
      continue;
    }
    if (char === "'" || char === "\"") {
      quote = char;
      continue;
    }
    if (char === "[" || char === "{" || char === "(") depth += 1;
    if (char === "]" || char === "}" || char === ")") depth -= 1;
    if (char === "," && depth === 0) {
      parts.push(value.slice(start, index).trim());
      start = index + 1;
    }
  }

  parts.push(value.slice(start).trim());
  return parts.filter(Boolean);
}

function toJavaLiteral(value: string): string {
  const trimmed = value.trim();
  if (/^-?\d+$/.test(trimmed)) return trimmed;
  if (trimmed === "True") return "true";
  if (trimmed === "False") return "false";
  if (trimmed === "None" || trimmed === "null") return "null";
  if ((trimmed.startsWith("\"") && trimmed.endsWith("\"")) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return JSON.stringify(trimmed.slice(1, -1));
  }
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    return `new java.util.ArrayList<>(${toJavaArraysAsList(trimmed)})`;
  }
  return trimmed;
}

function toJavaArraysAsList(value: string): string {
  const inner = value.slice(1, -1).trim();
  if (!inner) return "java.util.Arrays.asList()";
  const values = splitTopLevel(inner).map(toJavaLiteral);
  return `java.util.Arrays.asList(${values.join(", ")})`;
}

function toCppLiteral(value: string): string {
  const trimmed = value.trim();
  if (/^-?\d+$/.test(trimmed)) return trimmed;
  if (trimmed === "True") return "true";
  if (trimmed === "False") return "false";
  if (trimmed === "None" || trimmed === "null") return "-1";
  if ((trimmed.startsWith("\"") && trimmed.endsWith("\"")) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return JSON.stringify(trimmed.slice(1, -1));
  }
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    const inner = trimmed.slice(1, -1).trim();
    if (!inner) return "{}";
    return `{${splitTopLevel(inner).map(toCppLiteral).join(", ")}}`;
  }
  return trimmed;
}

function normalizeValue(value: string): string {
  const trimmed = value.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return normalizeObjectLike(trimmed);
  }
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    return `[${splitTopLevel(trimmed.slice(1, -1)).map(normalizeValue).join(",")}]`;
  }
  return trimmed
    .replace(/\btrue\b/g, "True")
    .replace(/\bfalse\b/g, "False")
    .replace(/\bnull\b/g, "None")
    .replace(/^['"]|['"]$/g, "")
    .replace(/\s+/g, "")
    .trim();
}

function normalizeObjectLike(value: string): string {
  const inner = value.slice(1, -1).trim();
  if (!inner) return "{}";

  const entries = splitTopLevel(inner).map((part) => {
    const separator = findTopLevelKeyValueSeparator(part);
    if (separator === -1) return normalizeValue(part);
    const key = part.slice(0, separator).trim().replace(/^['"]|['"]$/g, "");
    const itemValue = part.slice(separator + 1).trim();
    return `${key}:${normalizeValue(itemValue)}`;
  });

  return `{${entries.sort().join(",")}}`;
}

function findTopLevelKeyValueSeparator(value: string): number {
  let depth = 0;
  let quote: string | null = null;

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    if (quote) {
      if (char === quote && value[index - 1] !== "\\") quote = null;
      continue;
    }
    if (char === "'" || char === "\"") {
      quote = char;
      continue;
    }
    if (char === "[" || char === "{" || char === "(") depth += 1;
    if (char === "]" || char === "}" || char === ")") depth -= 1;
    if ((char === ":" || char === "=") && depth === 0) return index;
  }

  return -1;
}
