const suspiciousPatterns = [
  /ignore\s+(all\s+)?previous\s+instructions/i,
  /system\s+prompt/i,
  /developer\s+message/i,
  /reveal\s+(secrets|keys|credentials)/i,
  /bypass\s+(security|policy|guardrails)/i,
];

export function validatePromptSafety(input: string | undefined) {
  if (!input) return { safe: true };

  const unsafe = suspiciousPatterns.some((pattern) => pattern.test(input));
  return {
    safe: !unsafe,
    reason: unsafe ? "Prompt contains unsafe instruction override language." : undefined,
  };
}

