# Segment Tree: Point Update

## Goal
Learn Point Update in Segment Tree with theory, example, code, explanation, complexity, and practice.

## Theory
Point Update is a focused part of Segment Tree. Learn the rule, the state it changes, and the invariant that makes the operation correct.

## Step-by-step example
Use this trace to understand Segment Tree: Point Update before writing code.

Input: `nums = [2, 1, 5, 3], query sum [1, 3]`

1. Each tree node represents a range of indexes.
2. Build leaves from individual array values.
3. Build parent nodes by combining child range answers.
4. For query [1, 3], collect only ranges fully inside the query.
5. Combine collected range answers to get the final result.

## Python code

```python
def segment_tree_point_update(items):
    result = []
    for index, value in enumerate(items):
        result.append((index, value))
    return result

print(segment_tree_point_update([3, 1, 4, 1, 5]))
```

## Explanation
Segment tree and Fenwick tree problems become clear when every stored value has a range meaning. Query is fast because large precomputed ranges can be reused instead of scanning every element again.

For Segment Tree: Point Update, focus on the state before and after each step. A correct explanation should say what changed, why it changed, and why the final answer follows from the rule.

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
