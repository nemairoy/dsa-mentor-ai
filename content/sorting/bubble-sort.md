# Sorting: Bubble Sort

## Goal
Understand Bubble Sort from the ground up: what it compares, why it swaps, how one pass fixes one value, how to dry-run it, and why the algorithm is simple but slow for large inputs.

## Theory
Bubble Sort is a sorting algorithm that repeatedly compares two neighboring values. If the left value is greater than the right value, the two values are swapped. This small local rule is repeated from left to right.

Think of lining students up by height. You are only allowed to compare two students standing next to each other. If the taller student is standing before the shorter student, they swap positions. After enough neighbor swaps, the tallest student reaches the far right. Bubble Sort does the same thing with numbers.

The important idea is the sorted boundary. After the first full pass, the largest value is fixed at the end. After the second pass, the two largest values are fixed at the end. The algorithm keeps shrinking the unsorted part until the whole list is sorted.

## Step-by-step dry run
Sort `[5, 1, 4, 2]` in ascending order.

### Pass 1
The unsorted part is `[5, 1, 4, 2]`.

1. Compare `5` and `1`. Since `5 > 1`, swap them.
   Result: `[1, 5, 4, 2]`
2. Compare `5` and `4`. Since `5 > 4`, swap them.
   Result: `[1, 4, 5, 2]`
3. Compare `5` and `2`. Since `5 > 2`, swap them.
   Result: `[1, 4, 2, 5]`

Now `5` is fixed at the last position.

### Pass 2
The sorted part is `[5]`, so we only work on `[1, 4, 2]`.

1. Compare `1` and `4`. They are already in correct order, so no swap.
   Result: `[1, 4, 2, 5]`
2. Compare `4` and `2`. Since `4 > 2`, swap them.
   Result: `[1, 2, 4, 5]`

Now `4` is fixed before `5`.

### Pass 3
Only `[1, 2]` is left to check.

1. Compare `1` and `2`. They are already in correct order.
   Result: `[1, 2, 4, 5]`

The array is sorted because every neighboring pair is in ascending order.

## Python code

```python
def bubble_sort(items):
    values = list(items)
    n = len(values)

    for end in range(n - 1, 0, -1):
        swapped = False

        for i in range(end):
            if values[i] > values[i + 1]:
                values[i], values[i + 1] = values[i + 1], values[i]
                swapped = True

        if not swapped:
            break

    return values
```

## Explanation
The outer loop controls the unsorted boundary. At the beginning, the boundary is the last index. After each pass, one more value on the right is known to be correct, so the boundary moves left.

The inner loop does the real work. It compares `values[i]` and `values[i + 1]`. These are adjacent values. If they are in the wrong order, they are swapped. This pushes the larger value one step toward the right.

The `swapped` flag is an optimization. If one full pass makes no swap, the list was already sorted, so there is no reason to continue.

## Complexity
- Best time: `O(n)` when the list is already sorted and the no-swap optimization stops after one pass.
- Average time: `O(n^2)` because many neighboring pairs may need to be checked again and again.
- Worst time: `O(n^2)` when the list is reversed.
- Space: `O(1)` extra space for an in-place version because only a few variables are needed.

## Common mistakes
- Comparing non-adjacent values instead of neighboring values.
- Forgetting that the sorted region grows from the right side.
- Running the inner loop into the already sorted region.
- Swapping when `left <= right`, which breaks ascending order.
- Saying Bubble Sort is efficient for large data. It is mainly useful for learning.

## Practice
- Dry-run `[4, 1, 3, 2]` and write the array after every comparison.
- Implement Bubble Sort with the `swapped` optimization.
- Change the condition to sort in descending order.
- Explain why the last value is fixed after the first pass.
