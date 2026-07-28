# Strings: Practice

## Goal
Learn Practice in Strings with theory, example, code, explanation, complexity, and practice.

## Theory
Practice is a focused part of Strings. Learn the rule, the state it changes, and the invariant that makes the operation correct.

## Step-by-step example
Use this trace to understand Strings: Practice before writing code.

Input: `s = "racecar"`

1. Treat the string as characters stored by index.
2. Compare the leftmost and rightmost characters: r and r match.
3. Move both pointers inward: a and a match, then c and c match.
4. The middle character does not need a pair.
5. All required pairs matched, so the string is a palindrome.

## Python code

```python
def strings_practice(items):
    result = []
    for index, value in enumerate(items):
        result.append((index, value))
    return result

print(strings_practice([3, 1, 4, 1, 5]))
```

## Explanation
String logic is usually pointer or frequency logic. In pointer problems, clearly define what left and right mean. In frequency problems, clearly define what each count means. Without that state, off-by-one mistakes become very common.

For Strings: Practice, focus on the state before and after each step. A correct explanation should say what changed, why it changed, and why the final answer follows from the rule.

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
