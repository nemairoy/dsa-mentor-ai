# Searching: Upper Bound

## Goal
Learn Upper Bound in Searching with theory, example, code, explanation, complexity, and practice.

## Theory
Upper Bound is a focused part of Searching. Learn the rule, the state it changes, and the invariant that makes the operation correct.

## Step-by-step example
Use this trace to understand searching: upper bound before writing code.

Input: `items = [1, 3, 3, 5, 8], target = 3`

1. Upper bound means the first index where value is strictly greater than target.
2. If middle value is <= target, discard left side because answer must be after it.
3. If middle value is > target, keep it as a candidate and search left.
4. For target 3, both 3 values are skipped.
5. The first greater value is 5 at index 3.

## Python code

```python
def searching_upper_bound(items):
    result = []
    for index, value in enumerate(items):
        result.append((index, value))
    return result

print(searching_upper_bound([3, 1, 4, 1, 5]))
```

## Explanation
Upper bound is different from normal binary search because equality is not enough. You are searching for the first strictly greater value. This is useful for counting duplicates and splitting sorted ranges.

For searching: upper bound, focus on the state before and after each step. A correct explanation should say what changed, why it changed, and why the final answer follows from the rule.

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
