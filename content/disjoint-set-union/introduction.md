# Disjoint Set Union: Introduction

## Goal
Build the mental model, vocabulary, and why this topic matters.

## Theory
Introduction is a focused part of Disjoint Set Union. Learn the rule, the state it changes, and the invariant that makes the operation correct.

## Step-by-step example
Use this trace to understand Disjoint Set Union: Introduction before writing code.

Input: `[4, 2, 7, 2]`

1. Start with an empty seen set.
2. Read 4: it is not in seen, so add it.
3. Read 2: it is not in seen, so add it.
4. Read 7: it is not in seen, so add it.
5. Read the second 2: it is already in seen, so duplicate is found.

## Python code

```python
def disjoint_set_union_introduction(items):
    result = []
    for index, value in enumerate(items):
        result.append((index, value))
    return result

print(disjoint_set_union_introduction([3, 1, 4, 1, 5]))
```

## Explanation
Hashing stores information from previous steps so the current step can ask a fast question: have I seen this before, what is its count, or what value maps to it? Update the map/set at the correct time to avoid counting the current value incorrectly.

For Disjoint Set Union: Introduction, focus on the state before and after each step. A correct explanation should say what changed, why it changed, and why the final answer follows from the rule.

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
