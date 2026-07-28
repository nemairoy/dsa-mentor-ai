# Recursion: Recursive Case

## Goal
Learn Recursive Case in Recursion with theory, example, code, explanation, complexity, and practice.

## Theory
Recursive Case is a focused part of Recursion. Learn the rule, the state it changes, and the invariant that makes the operation correct.

## Step-by-step example
Use this trace to understand Recursion: Recursive Case before writing code.

Input: `nums = [1, 2]`

1. At each value, make a choice: include it or skip it.
2. For value 1, branch into paths with 1 and without 1.
3. For value 2, again branch into include and skip.
4. When index reaches the end, store the current path as one answer.
5. The generated subsets are [], [1], [2], and [1, 2].

## Python code

```python
def recursion_recursive_case(items):
    result = []
    for index, value in enumerate(items):
        result.append((index, value))
    return result

print(recursion_recursive_case([3, 1, 4, 1, 5]))
```

## Explanation
Recursion is a chain of smaller pending calls. Backtracking adds one more idea: after exploring one choice, undo it before trying the next choice. The base case tells when a complete answer is ready.

For Recursion: Recursive Case, focus on the state before and after each step. A correct explanation should say what changed, why it changed, and why the final answer follows from the rule.

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
