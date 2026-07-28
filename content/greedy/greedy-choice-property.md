# Greedy: Greedy Choice Property

## Goal
Learn Greedy Choice Property in Greedy with theory, example, code, explanation, complexity, and practice.

## Theory
Greedy Choice Property is a focused part of Greedy. Learn the rule, the state it changes, and the invariant that makes the operation correct.

## Step-by-step example
Use this trace to understand Greedy: Greedy Choice Property before writing code.

Input: `[3, 1, 4]`

1. Read the problem and identify the expected output.
2. Write the state you need to track before coding.
3. Process one value at a time using the lesson rule.
4. Update the state after every step.
5. Compare the final state with the expected answer and test edge cases.

## Python code

```python
def greedy_greedy_choice_property(items):
    result = []
    for index, value in enumerate(items):
        result.append((index, value))
    return result

print(greedy_greedy_choice_property([3, 1, 4, 1, 5]))
```

## Explanation
Every DSA lesson should be learned by dry-running a small input. The final answer matters, but the reason behind each state update matters more. If you can explain the state before and after every step, you are ready to code it.

For Greedy: Greedy Choice Property, focus on the state before and after each step. A correct explanation should say what changed, why it changed, and why the final answer follows from the rule.

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
