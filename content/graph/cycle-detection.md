# Graph: Cycle Detection

## Goal
Learn Cycle Detection in Graph with theory, example, code, explanation, complexity, and practice.

## Theory
Cycle Detection is a focused part of Graph. Learn the rule, the state it changes, and the invariant that makes the operation correct.

## Step-by-step example
Use this trace to understand Graph: Cycle Detection before writing code.

Input: `A connected to B and C; B connected to D`

1. Start from source node A and mark it visited.
2. Add safe unvisited neighbors B and C to the frontier.
3. Process B, then discover D through B.
4. Do not add a node twice after it is visited.
5. Stop when the frontier is empty or the target condition is met.

## Python code

```python
def graph_cycle_detection(items):
    result = []
    for index, value in enumerate(items):
        result.append((index, value))
    return result

print(graph_cycle_detection([3, 1, 4, 1, 5]))
```

## Explanation
Graph problems are about relationships. The visited set is important because the same node can be reached through multiple paths. BFS explores nearest nodes first, DFS explores deep paths first, and shortest-path algorithms also track distance.

For Graph: Cycle Detection, focus on the state before and after each step. A correct explanation should say what changed, why it changed, and why the final answer follows from the rule.

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
