# Searching: Binary Search

## Goal
Learn Binary Search in Searching with theory, example, code, explanation, complexity, and practice.

## Theory
Binary Search is a focused part of Searching. Learn the rule, the state it changes, and the invariant that makes the operation correct.

## Step-by-step example
Use this trace to understand searching: binary search before writing code.

Input: `items = [1, 3, 5, 8, 12], target = 8`

1. Start with left = 0 and right = 4, so the full sorted array is the candidate range.
2. Middle index is 2, value is 5. Since 5 is smaller than target 8, indexes 0..2 cannot contain the answer.
3. Move left to 3. Now the candidate range is indexes 3..4.
4. Middle index is 3, value is 8. It matches the target, so return index 3.
5. The skipped left side is safe because sorted order proves every value there is <= 5.

## Python code

```python
def searching_binary_search(items):
    result = []
    for index, value in enumerate(items):
        result.append((index, value))
    return result

print(searching_binary_search([3, 1, 4, 1, 5]))
```

## Explanation
Binary search only works when the search space has an order that lets you discard a side safely. In this example, after checking 5, every value on the left is also too small, so that whole side is impossible. The power of binary search is this proof-based discard, not just checking the middle.

For searching: binary search, focus on the state before and after each step. A correct explanation should say what changed, why it changed, and why the final answer follows from the rule.

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
