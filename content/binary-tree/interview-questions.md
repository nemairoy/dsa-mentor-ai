# Binary Tree: Interview Questions

## Goal
Learn Interview Questions in Binary Tree with theory, example, code, explanation, complexity, and practice.

## Theory
Interview Questions is a focused part of Binary Tree. Learn the rule, the state it changes, and the invariant that makes the operation correct.

## Step-by-step example
Use this trace to understand Binary Tree: Interview Questions before writing code.

Input: `root with left child and right child`

1. Decide what one node should return.
2. Solve the left child using the same rule.
3. Solve the right child using the same rule.
4. Combine left result, right result, and current node value.
5. Return the combined result to the parent.

## Python code

```python
def binary_tree_interview_questions(items):
    result = []
    for index, value in enumerate(items):
        result.append((index, value))
    return result

print(binary_tree_interview_questions([3, 1, 4, 1, 5]))
```

## Explanation
Tree problems repeat the same rule at every node. The key is to define what a single node returns. For height, a node returns 1 plus the larger child height. For traversal, order decides when the current node is processed.

For Binary Tree: Interview Questions, focus on the state before and after each step. A correct explanation should say what changed, why it changed, and why the final answer follows from the rule.

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
