# Deque: Push Front

## Goal
Learn Push Front in Deque with theory, example, code, explanation, complexity, and practice.

## Theory
Push Front is a focused part of Deque. Learn the rule, the state it changes, and the invariant that makes the operation correct.

## Step-by-step example
Use this trace to understand Deque: Push Front before writing code.

Input: `[3, 1, 4, 1, 5]`

1. Start with an empty queue: [].
2. Enqueue 3 first, so 3 becomes the front because it arrived first.
3. Enqueue 1, 4, 1, and 5 at the rear without moving the front.
4. After all inserts the queue is [3, 1, 4, 1, 5], front is 3 and rear is 5.
5. Because queue follows FIFO, dequeue returns 3 first, then 1, 4, 1, and 5.

## Python code

```python
def deque_push_front(items):
    result = []
    for index, value in enumerate(items):
        result.append((index, value))
    return result

print(deque_push_front([3, 1, 4, 1, 5]))
```

## Explanation
A queue works like a line of students waiting for service. The first student who enters the line is served first. In this example, 3 enters before every other value, so 3 must leave first. New values are added at the rear, and removal always happens from the front. This is the FIFO rule: first in, first out.

For Deque: Push Front, focus on the state before and after each step. A correct explanation should say what changed, why it changed, and why the final answer follows from the rule.

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
