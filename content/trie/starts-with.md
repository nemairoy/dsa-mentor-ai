# Trie: Starts With

## Goal
Learn Starts With in Trie with theory, example, code, explanation, complexity, and practice.

## Theory
Starts With is a focused part of Trie. Learn the rule, the state it changes, and the invariant that makes the operation correct.

## Step-by-step example
Use this trace to understand Trie: Starts With before writing code.

Input: `words = ["cat", "car"]`

1. Start at the root node with no character selected.
2. Insert c, then a; both words share this prefix.
3. For cat, create or follow t and mark word end.
4. For car, return to c -> a, then create or follow r and mark word end.
5. The shared path saves space and makes prefix lookup fast.

## Python code

```python
def trie_starts_with(items):
    result = []
    for index, value in enumerate(items):
        result.append((index, value))
    return result

print(trie_starts_with([3, 1, 4, 1, 5]))
```

## Explanation
A trie stores words as character paths. Prefixes are shared, but full words need an end marker. That is why ca can be a prefix even if it is not a complete word.

For Trie: Starts With, focus on the state before and after each step. A correct explanation should say what changed, why it changed, and why the final answer follows from the rule.

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
