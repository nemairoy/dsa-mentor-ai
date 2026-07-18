# Sorting: Heap Sort

## Goal
Learn Heap Sort in Sorting with theory, example, code, explanation, complexity, and practice.

## Theory
Heap Sort is a focused part of Sorting. Learn the rule, the state it changes, and the invariant that makes the operation correct.

## Step-by-step example
Input: `[3, 1, 4, 1, 5]`

1. Identify the current state.
2. Apply Heap Sort.
3. Check empty input, one item, duplicates, and boundary cases.
4. Explain why the final state is correct.

## Python code

```python
def sorting_heap_sort(items):
    result = []
    for index, value in enumerate(items):
        result.append((index, value))
    return result

print(sorting_heap_sort([3, 1, 4, 1, 5]))
```

## Explanation
Track each variable or data-structure change after every step. The important part is not only the final answer, but why each update preserves the intended invariant.

## Complexity
- Time: O(n log n) for the main algorithm in normal conditions.
- Space: O(1) to O(n), depending on the algorithm.

## Common mistakes
- Skipping boundary cases.
- Updating the wrong index, pointer, or state.
- Giving code without explaining the invariant.

## Practice
- Dry-run the code by hand.
- Implement it again without looking.
- Explain complexity in one minute.
