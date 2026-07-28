# Introduction: Interview Questions

## Goal
Learn Interview Questions in Introduction with theory, example, code, explanation, complexity, and practice.

## Theory
Interview Questions is a focused part of Introduction. Learn the rule, the state it changes, and the invariant that makes the operation correct.

## Step-by-step example
Use this trace to understand Introduction: Interview Questions before writing code.

Input: `problem statement with constraints`

1. Clarify input size, empty input, duplicates, and expected output.
2. Explain the brute-force approach briefly.
3. Improve the approach using the relevant DSA pattern.
4. Dry-run with a small sample so the interviewer can follow the state.
5. Finish with time and space complexity.

## Python code

```python
def introduction_interview_questions(items):
    result = []
    for index, value in enumerate(items):
        result.append((index, value))
    return result

print(introduction_interview_questions([3, 1, 4, 1, 5]))
```

## Explanation
Interview performance is not only about the final code. A strong answer shows assumptions, approach, dry-run, correctness, and complexity. Speak in a structured way so the interviewer can follow your decisions.

For Introduction: Interview Questions, focus on the state before and after each step. A correct explanation should say what changed, why it changed, and why the final answer follows from the rule.

## Complexity
- Time: Depends on the dominant loop, recursion, or data-structure operation.
- Space: Count auxiliary structures and recursion stack separately.

## Common mistakes
- Skipping boundary cases.
- Updating the wrong index, pointer, or state.
- Giving code without explaining the invariant.

## Practice
- Dry-run the code by hand.
- Implement it again without looking.
- Explain complexity in one minute.
