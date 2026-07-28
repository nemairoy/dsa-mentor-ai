# Linked List: Practice

## Goal
Learn Practice in Linked List with theory, example, code, explanation, complexity, and practice.

## Theory
Practice is a focused part of Linked List. Learn the rule, the state it changes, and the invariant that makes the operation correct.

## Step-by-step example
Use this trace to understand Linked List: Practice before writing code.

Input: `3 -> 1 -> 4 -> null`

1. Start at the head node containing 3.
2. Visit the current node, then follow its next pointer.
3. Move from 3 to 1, then from 1 to 4.
4. When next becomes null, traversal is finished.
5. For insertion or deletion, save next before changing links.

## Python code

```python
def linked_list_practice(items):
    result = []
    for index, value in enumerate(items):
        result.append((index, value))
    return result

print(linked_list_practice([3, 1, 4, 1, 5]))
```

## Explanation
A linked list is controlled by pointers, not indexes. Each node only knows the next node. That means every update must preserve the chain. Before changing a link, identify current, previous, and next; otherwise part of the list can be lost.

For Linked List: Practice, focus on the state before and after each step. A correct explanation should say what changed, why it changed, and why the final answer follows from the rule.

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
