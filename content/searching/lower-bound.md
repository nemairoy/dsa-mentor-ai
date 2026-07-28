# Searching: Lower Bound

## Goal
Learn Lower Bound in Searching with theory, example, code, explanation, complexity, and practice.

## Theory
Lower Bound is a focused part of Searching. Learn the rule, the state it changes, and the invariant that makes the operation correct.

## Step-by-step example
Use this trace to understand searching: lower bound before writing code.

Input: `items = [1, 3, 3, 5, 8], target = 3`

1. Lower bound means the first index where value is greater than or equal to target.
2. Check the middle. If value is >= target, keep it as a possible answer and search left.
3. If value is smaller than target, discard left side including middle.
4. For target 3, the first valid position is index 1.
5. Even though another 3 exists later, lower bound must return the first valid index.

## Python code

```python
def searching_lower_bound(items):
    result = []
    for index, value in enumerate(items):
        result.append((index, value))
    return result

print(searching_lower_bound([3, 1, 4, 1, 5]))
```

## Explanation
Lower bound is a binary search variant where equality does not stop immediately. Equality means this position may be the answer, but there might be an earlier equal value. So the search continues left while preserving the current candidate.

For searching: lower bound, focus on the state before and after each step. A correct explanation should say what changed, why it changed, and why the final answer follows from the rule.

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
