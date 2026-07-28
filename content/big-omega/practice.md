# Big Omega: Practice

## Goal
Learn Practice in Big Omega with theory, example, code, explanation, complexity, and practice.

## Theory
Practice is a focused part of Big Omega. Learn the rule, the state it changes, and the invariant that makes the operation correct.

## Step-by-step example
Use this trace to understand Big Omega: Practice before writing code.

Input: `n = number of items`

1. Identify the operation that dominates runtime.
2. Count how many times that operation runs as n grows.
3. One loop over n items gives O(n).
4. A nested loop that scans n items for each item gives O(n^2).
5. Drop constants and smaller terms only after explaining the count.

## Python code

```python
def big_omega_practice(items):
    result = []
    for index, value in enumerate(items):
        result.append((index, value))
    return result

print(big_omega_practice([3, 1, 4, 1, 5]))
```

## Explanation
Complexity explains scaling, not exact stopwatch time. Count the dominant operation, express it using input size, and then simplify. If code has a loop and a nested loop, the nested loop usually dominates.

For Big Omega: Practice, focus on the state before and after each step. A correct explanation should say what changed, why it changed, and why the final answer follows from the rule.

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
