# Arrays: Indexing

## Goal
Learn Indexing in Arrays with theory, example, code, explanation, complexity, and practice.

## Theory
Indexing is a focused part of Arrays. Learn the rule, the state it changes, and the invariant that makes the operation correct.

## Step-by-step example
Use this trace to understand Arrays: Indexing before writing code.

Input: `[3, 1, 4, 1, 5]`

1. Start from index 0 and read the value 3.
2. Keep a running answer. For maximum, current max starts as 3.
3. Read 1: max stays 3. Read 4: max becomes 4.
4. Read 1: max stays 4. Read 5: max becomes 5.
5. After the last index, the running answer is final because every value was checked once.

## Python code

```python
def arrays_indexing(items):
    result = []
    for index, value in enumerate(items):
        result.append((index, value))
    return result

print(arrays_indexing([3, 1, 4, 1, 5]))
```

## Explanation
Array problems usually become simple when you write both index and value. The index tells where you are, and the running answer tells what you have learned so far. For [3, 1, 4, 1, 5], the maximum changes only when a larger value appears: 3 to 4 to 5.

For Arrays: Indexing, focus on the state before and after each step. A correct explanation should say what changed, why it changed, and why the final answer follows from the rule.

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
