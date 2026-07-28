# Binary Search Tree: Inorder Sorted Order

## Goal
Learn Inorder Sorted Order in Binary Search Tree with theory, example, code, explanation, complexity, and practice.

## Theory
Inorder Sorted Order is a focused part of Binary Search Tree. Learn the rule, the state it changes, and the invariant that makes the operation correct.

## Step-by-step example
Use this trace to understand Binary Search Tree: Inorder Sorted Order before writing code.

Input: `items = [4, 2, 7, 9], target = 7`

1. Start at the first valid candidate position.
2. Check 4: it is not equal to target 7, so continue searching.
3. Check 2: it is also not equal to 7, so continue.
4. Check 7: it matches the target, so the search can stop successfully.
5. The answer is the position or value where the target was found, depending on the problem statement.

## Python code

```python
def binary_search_tree_inorder_sorted_order(items):
    result = []
    for index, value in enumerate(items):
        result.append((index, value))
    return result

print(binary_search_tree_inorder_sorted_order([3, 1, 4, 1, 5]))
```

## Explanation
Search problems are about proving one of two things: either the target exists at a valid position, or every possible position has been checked or safely discarded. In linear search, we check one value after another. In binary search, we can discard half only because sorted order proves the target cannot be there. Never skip a candidate unless the rule proves it is impossible.

For Binary Search Tree: Inorder Sorted Order, focus on the state before and after each step. A correct explanation should say what changed, why it changed, and why the final answer follows from the rule.

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
