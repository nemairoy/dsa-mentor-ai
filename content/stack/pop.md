# Stack: Pop

## Goal
Learn Pop in Stack with theory, example, code, explanation, complexity, and practice.

## Theory
Pop is a focused part of Stack. Learn the rule, the state it changes, and the invariant that makes the operation correct.

## Step-by-step example
Input: `[3, 1, 4, 1, 5]`

1. Identify the current state.
2. Apply Pop.
3. Check empty input, one item, duplicates, and boundary cases.
4. Explain why the final state is correct.

## Python code

```python
class Stack:
    def __init__(self):
        self.items = []

    def pop(self):
        if not self.items:
            raise IndexError("pop from empty stack")
        return self.items.pop()

stack = Stack()
stack.items = [10, 20, 30]
print(stack.pop())
```

## Explanation
Track each variable or data-structure change after every step. The important part is not only the final answer, but why each update preserves the intended invariant.

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
