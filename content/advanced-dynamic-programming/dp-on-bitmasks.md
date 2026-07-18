# Advanced Dynamic Programming: DP On Bitmasks

## Goal
Learn DP On Bitmasks in Advanced Dynamic Programming with theory, example, code, explanation, complexity, and practice.

## Theory
DP On Bitmasks is a focused part of Advanced Dynamic Programming. Learn the rule, the state it changes, and the invariant that makes the operation correct.

## Step-by-step example
Input: `[3, 1, 4, 1, 5]`

1. Identify the current state.
2. Apply DP On Bitmasks.
3. Check empty input, one item, duplicates, and boundary cases.
4. Explain why the final state is correct.

## Python code

```python
def advanced_dynamic_programming_dp_on_bitmasks(items):
    result = []
    for index, value in enumerate(items):
        result.append((index, value))
    return result

print(advanced_dynamic_programming_dp_on_bitmasks([3, 1, 4, 1, 5]))
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
