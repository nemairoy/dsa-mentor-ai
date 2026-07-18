# Time Complexity: Quadratic Time

## Goal
Learn Quadratic Time in Time Complexity with theory, example, code, explanation, complexity, and practice.

## Theory
Quadratic Time is a focused part of Time Complexity. Learn the rule, the state it changes, and the invariant that makes the operation correct.

## Step-by-step example
Input: `[3, 1, 4, 1, 5]`

1. Identify the current state.
2. Apply Quadratic Time.
3. Check empty input, one item, duplicates, and boundary cases.
4. Explain why the final state is correct.

## Python code

```python
def time_complexity_quadratic_time(items):
    result = []
    for index, value in enumerate(items):
        result.append((index, value))
    return result

print(time_complexity_quadratic_time([3, 1, 4, 1, 5]))
```

## Explanation
Track each variable or data-structure change after every step. The important part is not only the final answer, but why each update preserves the intended invariant.

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
