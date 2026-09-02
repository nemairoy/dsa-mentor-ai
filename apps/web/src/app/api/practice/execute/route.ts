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
  const results = await Promise.all(body.testCases.map((testCase, index) =>
    runOneSample(body.language, body.code, body.functionName, testCase.input, testCase.output, index + 1),
  ));

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
    const call = pythonCallExpression(code, functionName, args);
    return `${code}

if __name__ == "__main__":
    result = ${call}
    print("__RESULT__" + repr(result))
`;
  }

  if (language === "java") {
    const safeCode = code.replace(/public\s+(?:final\s+)?class\s+Solution\b/, "class Solution");
    return `${safeCode}\n\n${javaRunnerSource("Main", functionName, assignments)}`;
  }

  const declarations = assignments.map(([, value], index) => cppArgumentDeclaration(value, index)).join("\n  ");
  const args = assignments.map(([,], index) => `__dsaArg${index}`).join(", ");
  const call = cppCallExpression(code, functionName, args);
  return `#include <bits/stdc++.h>
${code}

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
  ${declarations}
  auto result = ${call};
  cout << "__RESULT__" << dsaFormat(result) << endl;
  return 0;
}
`;
}

async function runPython(code: string, functionName: string, assignments: Array<[string, string]>) {
  const dir = await mkdtemp(path.join(tmpdir(), "dsa-python-"));
  const filePath = path.join(dir, "solution.py");
  const args = assignments.map(([, value]) => value).join(", ");
  const call = pythonCallExpression(code, functionName, args);
  const source = `${code}

if __name__ == "__main__":
    result = ${call}
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
  const safeCode = code.replace(/public\s+(?:final\s+)?class\s+Solution\b/, "class Solution");
  const source = `${safeCode}\n\n${javaRunnerSource("Runner", functionName, assignments)}`;

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

function toJavaRawLiteral(value: string): string {
  const trimmed = value.trim();
  if (/^-?\d+$/.test(trimmed)) return `Long.valueOf(${JSON.stringify(trimmed)})`;
  if (/^-?(?:\d+\.\d*|\d*\.\d+)$/.test(trimmed)) return `Double.valueOf(${JSON.stringify(trimmed)})`;
  if (/^(?:True|true)$/.test(trimmed)) return "Boolean.TRUE";
  if (/^(?:False|false)$/.test(trimmed)) return "Boolean.FALSE";
  if (/^(?:None|null)$/.test(trimmed)) return "null";
  if ((trimmed.startsWith("\"") && trimmed.endsWith("\"")) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return JSON.stringify(trimmed.slice(1, -1));
  }
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    const inner = trimmed.slice(1, -1).trim();
    if (!inner) return "new java.util.ArrayList<Object>()";
    return `java.util.Arrays.<Object>asList(${splitTopLevel(inner).map(toJavaRawLiteral).join(", ")})`;
  }
  return JSON.stringify(trimmed);
}

function javaRunnerSource(className: "Main" | "Runner", functionName: string, assignments: Array<[string, string]>) {
  const rawArguments = assignments.map(([, value]) => toJavaRawLiteral(value)).join(", ");
  return `class ${className} {
  public static void main(String[] args) throws Exception {
    Object[] raw = new Object[]{${rawArguments}};
    java.lang.reflect.Method target = null;
    for (java.lang.reflect.Method method : Solution.class.getDeclaredMethods()) {
      if (method.getName().equals(${JSON.stringify(functionName)}) && method.getParameterCount() == raw.length) {
        target = method;
        break;
      }
    }
    if (target == null) throw new IllegalArgumentException("Function ${functionName} with " + raw.length + " parameters was not found");
    target.setAccessible(true);
    Class<?>[] parameterTypes = target.getParameterTypes();
    java.lang.reflect.Type[] genericTypes = target.getGenericParameterTypes();
    Object[] converted = new Object[raw.length];
    for (int i = 0; i < raw.length; i++) converted[i] = convert(raw[i], parameterTypes[i], genericTypes[i]);
    Object instance = java.lang.reflect.Modifier.isStatic(target.getModifiers()) ? null : Solution.class.getDeclaredConstructor().newInstance();
    Object result;
    try {
      result = target.invoke(instance, converted);
    } catch (java.lang.reflect.InvocationTargetException error) {
      Throwable cause = error.getCause();
      throw new RuntimeException(cause == null ? error.getMessage() : cause.toString(), cause);
    }
    System.out.println("__RESULT__" + format(result));
  }

  static Object convert(Object value, Class<?> type, java.lang.reflect.Type genericType) throws Exception {
    if (value == null) return null;
    if (type == Object.class) return value;
    if (type == int.class || type == Integer.class) return ((Number) value).intValue();
    if (type == long.class || type == Long.class) return ((Number) value).longValue();
    if (type == double.class || type == Double.class) return ((Number) value).doubleValue();
    if (type == float.class || type == Float.class) return ((Number) value).floatValue();
    if (type == short.class || type == Short.class) return ((Number) value).shortValue();
    if (type == byte.class || type == Byte.class) return ((Number) value).byteValue();
    if (type == boolean.class || type == Boolean.class) return value;
    if (type == String.class) return String.valueOf(value);
    if (type == char.class || type == Character.class) return String.valueOf(value).charAt(0);
    if (type.isArray() && value instanceof java.util.List) {
      java.util.List<?> source = (java.util.List<?>) value;
      Object array = java.lang.reflect.Array.newInstance(type.getComponentType(), source.size());
      for (int i = 0; i < source.size(); i++) {
        java.lang.reflect.Array.set(array, i, convert(source.get(i), type.getComponentType(), type.getComponentType()));
      }
      return array;
    }
    if (java.util.Collection.class.isAssignableFrom(type) && value instanceof java.util.List) {
      java.lang.reflect.Type itemType = Object.class;
      if (genericType instanceof java.lang.reflect.ParameterizedType) {
        itemType = ((java.lang.reflect.ParameterizedType) genericType).getActualTypeArguments()[0];
      }
      Class<?> itemClass = rawClass(itemType);
      java.util.List<Object> output = new java.util.ArrayList<>();
      for (Object item : (java.util.List<?>) value) output.add(convert(item, itemClass, itemType));
      return output;
    }
    if (type.getSimpleName().equals("TreeNode") && value instanceof java.util.List) return buildTree((java.util.List<?>) value, type);
    if (type.getSimpleName().equals("ListNode") && value instanceof java.util.List) return buildList((java.util.List<?>) value, type);
    if (type.isInstance(value)) return value;
    throw new IllegalArgumentException("Unsupported input conversion to " + type.getTypeName());
  }

  static Class<?> rawClass(java.lang.reflect.Type type) {
    if (type instanceof Class) return (Class<?>) type;
    if (type instanceof java.lang.reflect.ParameterizedType) {
      java.lang.reflect.Type raw = ((java.lang.reflect.ParameterizedType) type).getRawType();
      if (raw instanceof Class) return (Class<?>) raw;
    }
    return Object.class;
  }

  static Object buildTree(java.util.List<?> values, Class<?> type) throws Exception {
    if (values.isEmpty() || values.get(0) == null) return null;
    Object root = newNode(type, values.get(0));
    java.util.ArrayDeque<Object> queue = new java.util.ArrayDeque<>();
    queue.add(root);
    int index = 1;
    while (!queue.isEmpty() && index < values.size()) {
      Object parent = queue.remove();
      for (String fieldName : new String[]{"left", "right"}) {
        if (index >= values.size()) break;
        Object item = values.get(index++);
        if (item != null) {
          Object child = newNode(type, item);
          field(type, fieldName).set(parent, child);
          queue.add(child);
        }
      }
    }
    return root;
  }

  static Object buildList(java.util.List<?> values, Class<?> type) throws Exception {
    Object head = null;
    Object tail = null;
    for (Object value : values) {
      Object node = newNode(type, value);
      if (head == null) head = node;
      else field(type, "next").set(tail, node);
      tail = node;
    }
    return head;
  }

  static Object newNode(Class<?> type, Object value) throws Exception {
    Object node;
    try {
      java.lang.reflect.Constructor<?> constructor = type.getDeclaredConstructor(int.class);
      constructor.setAccessible(true);
      node = constructor.newInstance(((Number) value).intValue());
    } catch (NoSuchMethodException missingIntConstructor) {
      try {
        java.lang.reflect.Constructor<?> constructor = type.getDeclaredConstructor(Integer.class);
        constructor.setAccessible(true);
        node = constructor.newInstance(((Number) value).intValue());
      } catch (NoSuchMethodException missingIntegerConstructor) {
        java.lang.reflect.Constructor<?> constructor = type.getDeclaredConstructor();
        constructor.setAccessible(true);
        node = constructor.newInstance();
        java.lang.reflect.Field valueField;
        try { valueField = field(type, "val"); } catch (NoSuchFieldException missingVal) { valueField = field(type, "value"); }
        valueField.set(node, convert(value, valueField.getType(), valueField.getGenericType()));
      }
    }
    return node;
  }

  static java.lang.reflect.Field field(Class<?> type, String name) throws Exception {
    java.lang.reflect.Field result = type.getDeclaredField(name);
    result.setAccessible(true);
    return result;
  }

  static String format(Object value) throws Exception {
    if (value == null) return "None";
    if (value instanceof Boolean) return ((Boolean) value) ? "True" : "False";
    if (value.getClass().isArray()) {
      java.util.List<Object> items = new java.util.ArrayList<>();
      for (int i = 0; i < java.lang.reflect.Array.getLength(value); i++) items.add(java.lang.reflect.Array.get(value, i));
      return format(items);
    }
    if (value instanceof java.lang.Iterable) {
      StringBuilder output = new StringBuilder("[");
      for (Object item : (java.lang.Iterable<?>) value) {
        if (output.length() > 1) output.append(", ");
        output.append(format(item));
      }
      return output.append("]").toString();
    }
    if (value instanceof java.util.Map) {
      java.util.List<String> entries = new java.util.ArrayList<>();
      for (Object entryObject : ((java.util.Map<?, ?>) value).entrySet()) {
        java.util.Map.Entry<?, ?> entry = (java.util.Map.Entry<?, ?>) entryObject;
        entries.add(format(entry.getKey()) + ": " + format(entry.getValue()));
      }
      java.util.Collections.sort(entries);
      return "{" + String.join(", ", entries) + "}";
    }
    if (value.getClass().getSimpleName().equals("ListNode")) {
      java.util.List<Object> items = new java.util.ArrayList<>();
      Object current = value;
      int guard = 0;
      while (current != null && guard++ < 10000) {
        java.lang.reflect.Field valueField;
        try { valueField = field(current.getClass(), "val"); } catch (NoSuchFieldException missingVal) { valueField = field(current.getClass(), "value"); }
        items.add(valueField.get(current));
        current = field(current.getClass(), "next").get(current);
      }
      return format(items);
    }
    return String.valueOf(value);
  }
}
`;
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

function pythonCallExpression(code: string, functionName: string, args: string) {
  return /class\s+Solution\s*[:(]/.test(code)
    ? `Solution().${functionName}(${args})`
    : `${functionName}(${args})`;
}

function cppCallExpression(code: string, functionName: string, args: string) {
  return /class\s+Solution\s*[{:\s]/.test(code)
    ? `Solution().${functionName}(${args})`
    : `${functionName}(${args})`;
}

function cppArgumentDeclaration(value: string, index: number) {
  return `${cppLiteralType(value)} __dsaArg${index} = ${toCppLiteral(value)};`;
}

function cppLiteralType(value: string): string {
  const trimmed = value.trim();
  if (/^-?\d+$/.test(trimmed)) {
    const number = Number(trimmed);
    return Number.isSafeInteger(number) && number >= -2_147_483_648 && number <= 2_147_483_647 ? "int" : "long long";
  }
  if (/^-?(?:\d+\.\d*|\d*\.\d+)$/.test(trimmed)) return "double";
  if (trimmed === "True" || trimmed === "False" || trimmed === "true" || trimmed === "false") return "bool";
  if ((trimmed.startsWith("\"") && trimmed.endsWith("\"")) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) return "string";
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    const items = splitTopLevel(trimmed.slice(1, -1));
    const itemType = items.length ? cppLiteralType(items[0]) : "int";
    return `vector<${itemType}>`;
  }
  return "long long";
}

function normalizeValue(value: string): string {
  const trimmed = value.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return normalizeObjectLike(trimmed);
  }
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    return `[${splitTopLevel(trimmed.slice(1, -1)).map(normalizeValue).join(",")}]`;
  }
  if (trimmed.startsWith("(") && trimmed.endsWith(")")) {
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
