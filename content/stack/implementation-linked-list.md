# Stack: Implementation Linked List

## Goal
Learn Implementation Linked List in Stack with theory, example, code, explanation, complexity, and practice.

## Theory
Implementation Linked List is a focused part of Stack. Learn the rule, the state it changes, and the invariant that makes the operation correct.

## Step-by-step example
Use this trace to understand Stack: Implementation Linked List before writing code.

Input: `[3, 1, 4, 1, 5]`

1. Start with an empty stack: [].
2. Push 3 first, so the stack becomes [3] and top is 3.
3. Push 1, then 4, then 1, then 5. Each new value is placed above the previous top.
4. After all pushes the stack is [3, 1, 4, 1, 5], where 3 is the oldest value and 5 is the top.
5. Because stack follows LIFO, popping removes values in this order: 5, 1, 4, 1, 3.

## Python code

```python
def stack_implementation_linked_list(items):
    result = []
    for index, value in enumerate(items):
        result.append((index, value))
    return result

print(stack_implementation_linked_list([3, 1, 4, 1, 5]))
```

## Explanation
A stack behaves like plates kept one above another. The first inserted value stays at the bottom, and every later value sits on top of it. In the example, 3 enters first, then 1, 4, 1, and finally 5. Since 5 was inserted last, it must be removed first. This is the core LIFO rule: last in, first out. If this trace is still unclear, open the AI Tutor and ask it to dry-run the same stack step by step.

For Stack: Implementation Linked List, focus on the state before and after each step. A correct explanation should say what changed, why it changed, and why the final answer follows from the rule.

## Complexity
- Time: O(1) for push, pop, peek, and is-empty.
- Space: O(n) for n stored items.

## Common mistakes
- Skipping boundary cases.
- Updating the wrong index, pointer, or state.
- Giving code without explaining the invariant.

## Practice
- Dry-run the code by hand.
- Implement it again without looking.
- Explain complexity in one minute.
