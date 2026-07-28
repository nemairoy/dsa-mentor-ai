# Dynamic Programming: Tabulation

## Goal
Learn Tabulation in Dynamic Programming with theory, example, code, explanation, complexity, and practice.

## Theory
Tabulation is a focused part of Dynamic Programming. Learn the rule, the state it changes, and the invariant that makes the operation correct.

## Step-by-step example
Use this trace to understand Dynamic Programming: Tabulation before writing code.

Input: `nums = [2, 7, 9, 3], choose non-adjacent max sum`

1. Define the state: best answer up to the current index.
2. Base cases handle the first one or two values.
3. At each index, choose between taking current value or skipping it.
4. Taking current means adding it to the best answer two positions back.
5. The final state contains the best answer for the whole input.

## Python code

```python
def dynamic_programming_tabulation(items):
    result = []
    for index, value in enumerate(items):
        result.append((index, value))
    return result

print(dynamic_programming_tabulation([3, 1, 4, 1, 5]))
```

## Explanation
Dynamic programming works when a problem has repeated subproblems and a clear state. Do not start by writing code. First define what dp[i] means, then define base cases, then write the transition. If the state is wrong, the whole solution becomes confusing.

For Dynamic Programming: Tabulation, focus on the state before and after each step. A correct explanation should say what changed, why it changed, and why the final answer follows from the rule.

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
