# Heap: Heapify

## Goal
Learn Heapify in Heap with theory, example, code, explanation, complexity, and practice.

## Theory
Heapify is a focused part of Heap. Learn the rule, the state it changes, and the invariant that makes the operation correct.

## Step-by-step example
Use this trace to understand Heap: Heapify before writing code.

Input: `insert 2 into heap [3, 5, 7]`

1. Put the new value in the next open position to keep the tree complete.
2. Compare the new value with its parent.
3. If heap property is broken, swap upward.
4. Continue until parent order is correct or the value reaches root.
5. Now both complete-tree shape and heap property are valid.

## Python code

```python
def heap_heapify(items):
    result = []
    for index, value in enumerate(items):
        result.append((index, value))
    return result

print(heap_heapify([3, 1, 4, 1, 5]))
```

## Explanation
A heap has two rules at the same time: shape and priority. The shape says the tree must stay complete. The priority says the smallest or largest value must stay near the root. Insert fixes priority by bubbling the value upward.

For Heap: Heapify, focus on the state before and after each step. A correct explanation should say what changed, why it changed, and why the final answer follows from the rule.

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
