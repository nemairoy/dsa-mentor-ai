# Mathematics: Combinatorics

## Goal
Learn Combinatorics in Mathematics with theory, example, code, explanation, complexity, and practice.

## Theory
Combinatorics is a focused part of Mathematics. Learn the rule, the state it changes, and the invariant that makes the operation correct.

## Step-by-step example
Use this trace to understand Mathematics: Combinatorics before writing code.

Input: `gcd(18, 12)`

1. Use the property gcd(a, b) = gcd(b, a % b).
2. gcd(18, 12) becomes gcd(12, 6).
3. gcd(12, 6) becomes gcd(6, 0).
4. When remainder becomes 0, the current non-zero value is the answer.
5. So gcd(18, 12) = 6.

## Python code

```python
def mathematics_combinatorics(items):
    result = []
    for index, value in enumerate(items):
        result.append((index, value))
    return result

print(mathematics_combinatorics([3, 1, 4, 1, 5]))
```

## Explanation
Mathematical DSA topics rely on properties. The formula is useful only when you can explain why it preserves the answer. Always test the property on one small example before using it in code.

For Mathematics: Combinatorics, focus on the state before and after each step. A correct explanation should say what changed, why it changed, and why the final answer follows from the rule.

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
