# Bit Manipulation: Shifts

## Goal
Learn Shifts in Bit Manipulation with theory, example, code, explanation, complexity, and practice.

## Theory
Shifts is a focused part of Bit Manipulation. Learn the rule, the state it changes, and the invariant that makes the operation correct.

## Step-by-step example
Use this trace to understand Bit Manipulation: Shifts before writing code.

Input: `x = 10 (binary 1010), k = 1`

1. Build a mask using 1 << k.
2. For k = 1, mask is binary 0010.
3. Use x & mask to check whether bit k is on.
4. Use x | mask to set, x & ~mask to clear, and x ^ mask to toggle.
5. Only the selected bit should change unless the operation says otherwise.

## Python code

```python
def bit_manipulation_shifts(items):
    result = []
    for index, value in enumerate(items):
        result.append((index, value))
    return result

print(bit_manipulation_shifts([3, 1, 4, 1, 5]))
```

## Explanation
Bit manipulation is easier when you name the exact bit position. A mask selects that bit. AND checks, OR sets, XOR toggles, and shift moves bit positions.

For Bit Manipulation: Shifts, focus on the state before and after each step. A correct explanation should say what changed, why it changed, and why the final answer follows from the rule.

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
