# Searching: Binary Search On Answer

## Goal
Learn Binary Search On Answer in Searching with theory, example, code, explanation, complexity, and practice.

## Theory
Binary Search On Answer is a focused part of Searching. Learn the rule, the state it changes, and the invariant that makes the operation correct.

## Step-by-step example
Use this trace to understand searching: binary search on answer before writing code.

Input: `possible answer range = 1..10`

1. Define a yes/no condition that says whether a candidate answer is feasible.
2. Check the middle candidate.
3. If middle is feasible, keep it and try to improve in one direction.
4. If middle is not feasible, discard the impossible direction.
5. The final candidate is the best answer that satisfies the condition.

## Python code

```python
def searching_binary_search_on_answer(items):
    result = []
    for index, value in enumerate(items):
        result.append((index, value))
    return result

print(searching_binary_search_on_answer([3, 1, 4, 1, 5]))
```

## Explanation
Binary search on answer is used when the answer is not an array index but the answer space is ordered. The key is a monotonic condition: after some point answers are possible, or after some point they become impossible. Without that monotonic rule, binary search is not valid.

For searching: binary search on answer, focus on the state before and after each step. A correct explanation should say what changed, why it changed, and why the final answer follows from the rule.

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
