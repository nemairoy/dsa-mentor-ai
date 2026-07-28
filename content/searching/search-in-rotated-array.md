# Searching: Search In Rotated Array

## Goal
Learn Search In Rotated Array in Searching with theory, example, code, explanation, complexity, and practice.

## Theory
Search In Rotated Array is a focused part of Searching. Learn the rule, the state it changes, and the invariant that makes the operation correct.

## Step-by-step example
Use this trace to understand searching: search in rotated array before writing code.

Input: `items = [6, 7, 1, 2, 3, 4, 5], target = 3`

1. Check the middle value to decide which half is normally sorted.
2. One side of a rotated sorted array is always sorted.
3. If target lies inside the sorted side range, keep that side.
4. Otherwise discard the sorted side and search the other side.
5. Continue until target 3 is found or the range becomes empty.

## Python code

```python
def searching_search_in_rotated_array(items):
    result = []
    for index, value in enumerate(items):
        result.append((index, value))
    return result

print(searching_search_in_rotated_array([3, 1, 4, 1, 5]))
```

## Explanation
Rotated search still uses binary-search thinking, but the decision is two-level: first find which side is sorted, then check whether the target belongs inside that side. Only discard a side after this proof.

For searching: search in rotated array, focus on the state before and after each step. A correct explanation should say what changed, why it changed, and why the final answer follows from the rule.

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
