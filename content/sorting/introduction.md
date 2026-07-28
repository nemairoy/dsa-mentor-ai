# Sorting: Introduction

## Goal
Build the mental model, vocabulary, and why this topic matters.

## Theory
Introduction is a focused part of Sorting. Learn the rule, the state it changes, and the invariant that makes the operation correct.

## Step-by-step example
Use this trace to understand Sorting: Introduction before writing code.

Input: `[5, 2, 4, 1]`

1. Separate the array into a sorted part and an unsorted part.
2. Find or move the next correct value using the sorting rule.
3. For this input, 1 is the smallest value, so it belongs at the front.
4. After placing 1, the sorted part has grown and the remaining values are handled the same way.
5. Continue until every position is fixed in sorted order.

## Python code

```python
def sorting_introduction(items):
    result = []
    for index, value in enumerate(items):
        result.append((index, value))
    return result

print(sorting_introduction([3, 1, 4, 1, 5]))
```

## Explanation
Sorting is not just swapping randomly. At every step, you must know which region is already correct and which region still needs work. A professional dry-run explains why a value moves, which part becomes sorted, and why the final array is ordered.

For Sorting: Introduction, focus on the state before and after each step. A correct explanation should say what changed, why it changed, and why the final answer follows from the rule.

## Complexity
- Time: O(n^2) for elementary comparison sorts unless noted.
- Space: O(1) auxiliary space for in-place versions.

## Common mistakes
- Skipping boundary cases.
- Updating the wrong index, pointer, or state.
- Giving code without explaining the invariant.

## Practice
- Dry-run the code by hand.
- Implement it again without looking.
- Explain complexity in one minute.
