import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const root = process.cwd();
const require = createRequire(import.meta.url);
const { Pool } = require(path.join(root, "apps", "web", "node_modules", "pg"));

function loadEnv(filePath) {
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    process.env[trimmed.slice(0, index)] = trimmed.slice(index + 1);
  }
}

function functionName(chapterSlug, lessonSlug, difficulty) {
  return `${chapterSlug}_${lessonSlug}_${difficulty}`.replaceAll("-", "_").toLowerCase();
}

function titleCase(slug) {
  return slug
    .split("-")
    .map((part) => ({ bfs: "BFS", dfs: "DFS", avl: "AVL", dsu: "DSU", lcs: "LCS", lis: "LIS" })[part] ?? part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

function plainStatement(statement) {
  return statement.replaceAll("`", "");
}

function detailedTestExplanation(problem, test, sampleNumber) {
  const task = plainStatement(problem.statement);
  const reason = String(test.explanation ?? "").trim();
  const reasonSentence = reason.endsWith(".") ? reason : `${reason}.`;

  return [
    `What you need to do: ${task}`,
    `Sample ${sampleNumber} uses ${test.input}.`,
    `Your function should return ${test.output}. Reason: ${reasonSentence}`,
  ].join(" ");
}

function withDetailedTests(problem) {
  return {
    ...problem,
    tests: problem.tests.map((test, index) => ({
      ...test,
      explanation: detailedTestExplanation(problem, test, index + 1),
    })),
  };
}

function problemFor(chapterSlug, lessonSlug, topic, subtopic, difficulty) {
  const fn = functionName(chapterSlug, lessonSlug, difficulty);
  const base = genericProblem(chapterSlug, lessonSlug, topic, subtopic, difficulty, fn);

  const specific = {
    "advanced-dynamic-programming/dp-on-bitmasks": {
      title: `DP On Bitmasks: ${difficulty} Coding Problem`,
      statement: `Implement \`${fn}(values, target)\`. Count how many subsets have sum exactly equal to \`target\`. Return the count.`,
      hints: ["Represent a subset by whether each index is chosen.", "Try every mask for small n, then think about DP states.", "The empty subset has sum 0."],
      editorial: "A bitmask can represent every subset. For each mask, add the values whose bits are set and count masks whose sum equals target.",
      solution: "Loop over masks from 0 to 2^n - 1, compute the subset sum, and increment the answer when it equals target.",
      tests: [
        { input: "values = [2, 3, 5], target = 5", output: "2", explanation: "Subsets [5] and [2, 3] both sum to 5." },
        { input: "values = [1, 1, 1], target = 2", output: "3", explanation: "Choose any two of the three ones." },
      ],
    },
  };

  const key = `${chapterSlug}/${lessonSlug}`;
  const specificProblems = {
    "stack/push": {
      title: `Stack Push: ${difficulty} Coding Problem`,
      statement: `Implement \`${fn}(operations)\`. Start with an empty stack. For every value in \`operations\`, push it onto the stack and return the final stack from bottom to top.`,
      hints: ["Use a list as the stack.", "Push means append at the top.", "No element is removed in this problem."],
      editorial: "A stack push operation adds a new value to the top. With a dynamic array/list, appending is O(1) amortized.",
      solution: "Initialize an empty list, append each value, and return the list.",
      tests: [
        { input: "operations = [10, 20, 30]", output: "[10, 20, 30]", explanation: "All values are pushed in the same order." },
        { input: "operations = [5]", output: "[5]", explanation: "One push leaves one value on the stack." },
      ],
    },
    "stack/pop": {
      title: `Stack Pop: ${difficulty} Coding Problem`,
      statement: `Implement \`${fn}(stack, count)\`. Pop \`count\` items from the stack and return the remaining stack. If \`count\` is larger than stack size, return an empty stack.`,
      hints: ["Pop removes from the top.", "The top is the last element in a Python list.", "Stop when the stack becomes empty."],
      editorial: "Repeated pop operations remove the last value. Guard against underflow by checking whether the stack is empty.",
      solution: "Loop at most count times and call pop while the stack is non-empty.",
      tests: [
        { input: "stack = [10, 20, 30], count = 2", output: "[10]", explanation: "30 and 20 are removed from the top." },
        { input: "stack = [7], count = 3", output: "[]", explanation: "After one pop the stack is empty, so extra pops are ignored." },
      ],
    },
    "stack/peek": {
      title: `Stack Peek: ${difficulty} Coding Problem`,
      statement: `Implement \`${fn}(stack)\`. Return the top value without removing it. Return \`None\` if the stack is empty.`,
      hints: ["Peek does not mutate the stack.", "The top is the last value.", "Handle empty input first."],
      editorial: "Peek reads the top item only. It is O(1) because the top index is known.",
      solution: "Return stack[-1] when the stack has elements; otherwise return None.",
      tests: [
        { input: "stack = [4, 8, 15]", output: "15", explanation: "15 is the top value." },
        { input: "stack = []", output: "None", explanation: "An empty stack has no top value." },
      ],
    },
    "stack/is-empty": {
      title: `Stack Is Empty: ${difficulty} Coding Problem`,
      statement: `Implement \`${fn}(stack)\`. Return \`True\` if the stack has no elements, otherwise return \`False\`. Do not modify the stack.`,
      hints: ["An empty stack has length 0.", "This operation should not push or pop anything.", "Return a boolean value."],
      editorial: "Checking whether a stack is empty is a constant-time guard used before pop and peek operations.",
      solution: "Return len(stack) == 0.",
      tests: [
        { input: "stack = []", output: "True", explanation: "There are no elements, so the stack is empty." },
        { input: "stack = [10, 20]", output: "False", explanation: "The stack contains values, so it is not empty." },
      ],
    },
    "queue/enqueue": {
      title: `Queue Enqueue: ${difficulty} Coding Problem`,
      statement: `Implement \`${fn}(items)\`. Insert every item at the rear of an initially empty queue and return the final queue from front to rear.`,
      hints: ["A queue preserves insertion order.", "Enqueue adds at the rear.", "A list is enough for this simulation."],
      editorial: "Enqueue appends new values at the rear. The first inserted value remains at the front.",
      solution: "Append each item to the queue and return it.",
      tests: [
        { input: "items = [1, 2, 3]", output: "[1, 2, 3]", explanation: "The queue keeps FIFO order." },
        { input: "items = []", output: "[]", explanation: "No enqueue operation is performed." },
      ],
    },
    "queue/dequeue": {
      title: `Queue Dequeue: ${difficulty} Coding Problem`,
      statement: `Implement \`${fn}(queue, count)\`. Remove \`count\` items from the front and return the remaining queue.`,
      hints: ["Dequeue removes from the front.", "Do not remove more items than available.", "Think FIFO."],
      editorial: "FIFO means the earliest inserted values leave first. Slicing can model the remaining queue cleanly.",
      solution: "Return queue[min(count, len(queue)):]",
      tests: [
        { input: "queue = [10, 20, 30, 40], count = 2", output: "[30, 40]", explanation: "10 and 20 leave first." },
        { input: "queue = [5], count = 4", output: "[]", explanation: "The queue becomes empty." },
      ],
    },
    "arrays/insertion": {
      title: `Array Insertion: ${difficulty} Coding Problem`,
      statement: `Implement \`${fn}(arr, index, value)\`. Insert \`value\` at \`index\` and return the updated array.`,
      hints: ["Elements at index and after it shift right.", "Index 0 inserts at the beginning.", "Index len(arr) inserts at the end."],
      editorial: "Insertion in the middle of an array needs shifting, so the worst-case time is O(n).",
      solution: "Use slicing or manual shifts to place the value at the requested index.",
      tests: [
        { input: "arr = [10, 20, 40], index = 2, value = 30", output: "[10, 20, 30, 40]", explanation: "30 is inserted before 40." },
        { input: "arr = [], index = 0, value = 7", output: "[7]", explanation: "Inserting into an empty array creates one element." },
      ],
    },
    "arrays/deletion": {
      title: `Array Deletion: ${difficulty} Coding Problem`,
      statement: `Implement \`${fn}(arr, index)\`. Delete the value at \`index\` and return the updated array.`,
      hints: ["Elements after index shift left.", "Check first and last index cases.", "The removed value is not returned."],
      editorial: "Deletion from the middle requires moving later elements left, so it is O(n) in the worst case.",
      solution: "Return arr[:index] + arr[index + 1:].",
      tests: [
        { input: "arr = [10, 20, 30], index = 1", output: "[10, 30]", explanation: "20 is removed." },
        { input: "arr = [5], index = 0", output: "[]", explanation: "Deleting the only element leaves an empty array." },
      ],
    },
    "sorting/bubble-sort": {
      title: `Bubble Sort: ${difficulty} Coding Problem`,
      statement: `Implement \`${fn}(arr)\` and return the array sorted in ascending order using bubble sort.`,
      hints: ["Compare adjacent elements.", "Swap when the left value is larger.", "After each pass, the largest remaining value moves to the end."],
      editorial: "Bubble sort repeatedly fixes local inversions. It is simple but O(n^2).",
      solution: "Use nested loops and swap adjacent out-of-order values.",
      tests: [
        { input: "arr = [5, 1, 4, 2]", output: "[1, 2, 4, 5]", explanation: "Adjacent swaps move values into sorted order." },
        { input: "arr = [1, 2, 3]", output: "[1, 2, 3]", explanation: "Already sorted input remains unchanged." },
      ],
    },
    "sorting/merge-sort": {
      title: `Merge Sort: ${difficulty} Coding Problem`,
      statement: `Implement \`${fn}(arr)\` and return the array sorted in ascending order using merge sort.`,
      hints: ["Split the array into halves.", "Sort each half recursively.", "Merge two sorted halves with two pointers."],
      editorial: "Merge sort uses divide and conquer. Each level merges O(n) work and there are O(log n) levels.",
      solution: "Recursively sort left and right halves, then merge them into a new sorted array.",
      tests: [
        { input: "arr = [8, 3, 5, 1]", output: "[1, 3, 5, 8]", explanation: "Both halves are sorted then merged." },
        { input: "arr = [2]", output: "[2]", explanation: "A single element is already sorted." },
      ],
    },
    "searching/binary-search": {
      title: `Binary Search: ${difficulty} Coding Problem`,
      statement: `Implement \`${fn}(items, target)\`. \`items\` is sorted in ascending order. Return the index of \`target\`, or \`-1\` if it is missing.`,
      hints: ["Keep left and right pointers.", "Check the middle index each step.", "Move left or right based on comparison with target."],
      editorial: "Binary search works only on sorted data. Each comparison removes half of the remaining search range, so the time complexity is O(log n).",
      solution: "Use left = 0 and right = len(items) - 1. While left <= right, compare items[mid] with target and adjust the range.",
      tests: [
        { input: "items = [1, 3, 5, 7, 9], target = 7", output: "3", explanation: "The sorted array contains 7 at index 3." },
        { input: "items = [2, 4, 6, 8], target = 5", output: "-1", explanation: "5 is not present in the sorted array." },
      ],
    },
  }[key];

  return withDetailedTests(specificProblems ?? specific[key] ?? base);
}

function genericProblem(chapterSlug, lessonSlug, topic, subtopic, difficulty, fn) {
  if (chapterSlug.includes("dynamic-programming")) {
    return {
      title: `${subtopic}: ${difficulty} Coding Problem`,
      statement: `Implement \`${fn}(nums)\`. Return the maximum sum of non-adjacent elements in \`nums\`. This captures the DP idea of choosing or skipping each position.`,
      hints: ["Let dp[i] mean the best answer using values up to index i.", "At each index choose: take current plus dp[i-2], or skip current and keep dp[i-1].", "Handle empty input first."],
      editorial: "The state only needs the previous two answers. This is a classic one-dimensional DP transition.",
      solution: "Track prev2 and prev1 while scanning nums, then return prev1.",
      tests: [
        { input: "nums = [2, 7, 9, 3, 1]", output: "12", explanation: "Pick 2, 9, and 1 for total 12." },
        { input: "nums = [5, 1, 1, 5]", output: "10", explanation: "Pick the first and last values." },
      ],
    };
  }

  if (chapterSlug.includes("graph")) {
    return {
      title: `${subtopic}: ${difficulty} Coding Problem`,
      statement: `Implement \`${fn}(n, edges, start)\`. Given an undirected graph with nodes \`0..n-1\`, return how many nodes are reachable from \`start\`.`,
      hints: ["Build an adjacency list.", "Use BFS or DFS from start.", "Count each visited node once."],
      editorial: "Reachability is solved by graph traversal. The visited set prevents cycles from repeating work.",
      solution: "Build adjacency lists, traverse from start, and return visited.size.",
      tests: [
        { input: "n = 5, edges = [[0,1],[1,2],[3,4]], start = 0", output: "3", explanation: "Nodes 0, 1, and 2 are connected." },
        { input: "n = 4, edges = [], start = 2", output: "1", explanation: "Only the start node is reachable." },
      ],
    };
  }

  if (["algorithm-analysis", "time-complexity", "space-complexity", "big-o", "big-omega", "big-theta", "introduction", "interview-preparation", "competitive-programming"].includes(chapterSlug)) {
    return {
      title: `${subtopic}: ${difficulty} Coding Problem`,
      statement: `Implement \`${fn}(operations)\`. Each item in \`operations\` is a non-negative integer representing the cost of one step in an algorithm trace. Return an object with \`total\`, \`maxStep\`, and \`average\` rounded down.`,
      hints: ["Scan the trace once.", "Track running total and maximum step cost.", "Handle an empty trace by returning zeros."],
      editorial: "Algorithm analysis often starts by counting operations. A single pass gives total work, the largest step, and average cost.",
      solution: "If the list is empty return zeros; otherwise compute sum, max, and floor average in one traversal.",
      tests: [
        { input: "operations = [1, 3, 2, 4]", output: "{ total: 10, maxStep: 4, average: 2 }", explanation: "Total cost is 10 and floor average is 10 // 4 = 2." },
        { input: "operations = []", output: "{ total: 0, maxStep: 0, average: 0 }", explanation: "No operations means no measured work." },
      ],
    };
  }

  if (chapterSlug === "hashing") {
    return {
      title: `${subtopic}: ${difficulty} Coding Problem`,
      statement: `Implement \`${fn}(items)\`. Return the first value that appears more than once. Return \`None\` if every value is unique.`,
      hints: ["Use a set for values already seen.", "Scan left to right to preserve first duplicate order.", "Return as soon as a duplicate is found."],
      editorial: "Hash sets make duplicate detection efficient because membership checks are O(1) on average.",
      solution: "Keep a seen set. For each item, return it if already seen; otherwise add it to the set.",
      tests: [
        { input: "items = [4, 2, 7, 2, 4]", output: "2", explanation: "2 is the first value whose second occurrence is reached." },
        { input: "items = [1, 3, 5]", output: "None", explanation: "All values are unique." },
      ],
    };
  }

  if (chapterSlug === "bit-manipulation") {
    return {
      title: `${subtopic}: ${difficulty} Coding Problem`,
      statement: `Implement \`${fn}(nums)\`. Return the value that appears once when every other value appears exactly twice.`,
      hints: ["XOR cancels equal values.", "x ^ x is 0.", "0 ^ x is x."],
      editorial: "The XOR operation is ideal for pair cancellation. After XOR-ing all values, duplicates vanish and the single value remains.",
      solution: "Initialize answer to 0 and XOR every number into it.",
      tests: [
        { input: "nums = [6, 1, 6, 3, 1]", output: "3", explanation: "6 and 1 cancel, leaving 3." },
        { input: "nums = [9]", output: "9", explanation: "The only value is the answer." },
      ],
    };
  }

  if (chapterSlug === "disjoint-set-union") {
    return {
      title: `${subtopic}: ${difficulty} Coding Problem`,
      statement: `Implement \`${fn}(n, edges)\`. Given \`n\` nodes and undirected edges, return the number of connected components.`,
      hints: ["Start with n separate sets.", "Union the endpoints of every edge.", "Count distinct parents after path compression."],
      editorial: "DSU maintains connected components efficiently by merging sets and finding representatives.",
      solution: "Initialize parent for each node, union every edge, then count unique roots.",
      tests: [
        { input: "n = 5, edges = [[0,1],[1,2],[3,4]]", output: "2", explanation: "Components are {0,1,2} and {3,4}." },
        { input: "n = 3, edges = []", output: "3", explanation: "No edges means every node is separate." },
      ],
    };
  }

  if (chapterSlug === "segment-tree" || chapterSlug === "fenwick-tree") {
    return {
      title: `${subtopic}: ${difficulty} Coding Problem`,
      statement: `Implement \`${fn}(nums, queries)\`. Each query is \`[left, right]\`. Return the sum of values from \`left\` to \`right\` inclusive for every query.`,
      hints: ["Prefix sums are enough for static range sums.", "Range sum is prefix[right + 1] - prefix[left].", "Check zero-based indexes carefully."],
      editorial: "Range query structures optimize repeated queries. For static sums, prefix sums model the same query idea cleanly.",
      solution: "Build prefix sums once, then answer each query in O(1).",
      tests: [
        { input: "nums = [2, 4, 6, 8], queries = [[0,1],[1,3]]", output: "[6, 18]", explanation: "2+4=6 and 4+6+8=18." },
        { input: "nums = [5], queries = [[0,0]]", output: "[5]", explanation: "The only range contains the only value." },
      ],
    };
  }

  if (chapterSlug === "mathematics" || chapterSlug === "number-theory") {
    return {
      title: `${subtopic}: ${difficulty} Coding Problem`,
      statement: `Implement \`${fn}(a, b)\`. Return the greatest common divisor of \`a\` and \`b\` using Euclid's algorithm.`,
      hints: ["gcd(a, b) = gcd(b, a % b).", "Stop when b becomes 0.", "Use absolute values for safety."],
      editorial: "Euclid's algorithm repeatedly reduces the pair without changing the gcd, giving logarithmic performance.",
      solution: "While b is non-zero, replace (a, b) with (b, a % b), then return abs(a).",
      tests: [
        { input: "a = 48, b = 18", output: "6", explanation: "48 and 18 share greatest divisor 6." },
        { input: "a = 17, b = 13", output: "1", explanation: "17 and 13 are coprime." },
      ],
    };
  }

  if (chapterSlug === "recursion" || chapterSlug === "backtracking") {
    return {
      title: `${subtopic}: ${difficulty} Coding Problem`,
      statement: `Implement \`${fn}(nums)\`. Return all subsets of \`nums\` in any order.`,
      hints: ["At each index choose to include or skip the value.", "The base case is reaching the end.", "Copy the current path before storing it."],
      editorial: "Subset generation is a classic recursion tree: every element creates two branches, include and exclude.",
      solution: "Use DFS with an index and path. Recurse with and without nums[index].",
      tests: [
        { input: "nums = [1, 2]", output: "[[], [2], [1], [1, 2]]", explanation: "All include/exclude combinations are present." },
        { input: "nums = []", output: "[[]]", explanation: "The empty set has one subset: itself." },
      ],
    };
  }

  if (chapterSlug === "greedy") {
    return {
      title: `${subtopic}: ${difficulty} Coding Problem`,
      statement: `Implement \`${fn}(intervals)\`. Given intervals \`[start, end]\`, return the maximum number of non-overlapping intervals that can be selected.`,
      hints: ["Sort by ending time.", "Pick an interval when its start is at least the last selected end.", "Greedy works because earliest finish leaves the most room."],
      editorial: "Interval scheduling is the standard greedy proof pattern: selecting the earliest finishing compatible interval is always safe.",
      solution: "Sort intervals by end, scan once, and count compatible intervals.",
      tests: [
        { input: "intervals = [[1,3],[2,4],[3,5]]", output: "2", explanation: "Pick [1,3] and [3,5]." },
        { input: "intervals = [[1,2],[2,3],[3,4]]", output: "3", explanation: "All intervals can be chained." },
      ],
    };
  }

  if (chapterSlug.includes("tree") || chapterSlug === "heap" || chapterSlug === "trie") {
    return {
      title: `${subtopic}: ${difficulty} Coding Problem`,
      statement: `Implement \`${fn}(values)\`. Treat \`values\` as level-order binary tree data where \`None\` means missing node. Return the height of the tree.`,
      hints: ["The height of an empty tree is 0.", "Use recursion or level-order traversal.", "A node contributes 1 plus the max height of its children."],
      editorial: "Tree height measures the longest root-to-leaf path in node count. Recursion naturally combines left and right subtree answers.",
      solution: "Build or index through the level-order representation and compute max depth.",
      tests: [
        { input: "values = [1, 2, 3, None, 4]", output: "3", explanation: "The path 1 -> 2 -> 4 has length 3." },
        { input: "values = []", output: "0", explanation: "An empty tree has height 0." },
      ],
    };
  }

  if (["stack", "queue", "deque", "linked-list", "arrays", "strings"].includes(chapterSlug)) {
    return {
      title: `${subtopic}: ${difficulty} Coding Problem`,
      statement: `Implement \`${fn}(items)\`. Return a new list with duplicate values removed while preserving the first occurrence order.`,
      hints: ["Use a set to remember seen values.", "Append only the first time a value appears.", "Preserving order means do not sort."],
      editorial: "This problem tests linear traversal and state tracking. A set gives O(1) average membership checks.",
      solution: "Scan left to right, keep seen values, and append unseen values to the answer.",
      tests: [
        { input: "items = [3, 1, 3, 2, 1]", output: "[3, 1, 2]", explanation: "The second 3 and second 1 are skipped." },
        { input: "items = []", output: "[]", explanation: "No values means no duplicates." },
      ],
    };
  }

  if (chapterSlug === "sorting") {
    return {
      title: `${subtopic}: ${difficulty} Coding Problem`,
      statement: `Implement \`${fn}(items)\`. Return the values sorted in ascending order without modifying the input list.`,
      hints: ["Create a copy before sorting.", "Check duplicates and negative values.", "Explain whether your method is stable."],
      editorial: "Sorting requires arranging values by comparison or by value range. Copying keeps the original input unchanged.",
      solution: "Return a sorted copy of the input.",
      tests: [
        { input: "items = [5, -1, 3, 3]", output: "[-1, 3, 3, 5]", explanation: "Values are ordered ascending and duplicates remain." },
        { input: "items = []", output: "[]", explanation: "An empty list is already sorted." },
      ],
    };
  }

  if (chapterSlug === "searching") {
    return {
      title: `${subtopic}: ${difficulty} Coding Problem`,
      statement: `Implement \`${fn}(items, target)\`. Return the first index of \`target\`, or \`-1\` if it is missing.`,
      hints: ["Scan from left to right.", "Return immediately on the first match.", "If the loop ends, the target was not found."],
      editorial: "First occurrence search is a direct traversal problem. The first match is the answer because indexes are checked in increasing order.",
      solution: "Loop with index and value, returning index when value equals target.",
      tests: [
        { input: "items = [4, 2, 7, 2], target = 2", output: "1", explanation: "The first 2 is at index 1." },
        { input: "items = [1, 3, 5], target = 2", output: "-1", explanation: "2 does not appear." },
      ],
    };
  }

  return {
    title: `${subtopic}: ${difficulty} Coding Problem`,
    statement: `Implement \`${fn}(nums)\`. Return the sum of all even numbers in \`nums\`.`,
    hints: ["Check each number once.", "Use modulo to test even values.", "The answer is 0 when no even numbers exist."],
    editorial: "This is a clean traversal problem: inspect every value, keep only values satisfying the condition, and accumulate the result.",
    solution: "Initialize total = 0, add x when x % 2 == 0, and return total.",
    tests: [
      { input: "nums = [3, 2, 8, 5]", output: "10", explanation: "2 + 8 = 10." },
      { input: "nums = [1, 3, 5]", output: "0", explanation: "There are no even numbers." },
    ],
  };
}

loadEnv(path.join(root, "apps", "web", ".env.local"));

const roadmap = JSON.parse(fs.readFileSync(path.join(root, "content", "roadmap.json"), "utf8"));
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined,
});

const difficulties = ["Easy", "Medium", "Hard"];
let count = 0;
const activeKeys = [];

for (const chapter of roadmap.chapters) {
  const metadata = JSON.parse(fs.readFileSync(path.join(root, "content", chapter.slug, "metadata.json"), "utf8"));

  for (const lessonRef of chapter.lessons) {
    const lesson = metadata.lessons[lessonRef.slug];
    const subtopic = lesson.title || titleCase(lessonRef.slug);

    for (const difficulty of difficulties) {
      const key = `${lesson.lessonId}.${difficulty.toLowerCase()}`;
      activeKeys.push(key);
      const problem = problemFor(chapter.slug, lessonRef.slug, metadata.title, subtopic, difficulty);
      const fn = functionName(chapter.slug, lessonRef.slug, difficulty);

      await pool.query(
        `INSERT INTO practice_problems (
          problem_key, lesson_id, chapter_slug, lesson_slug, title, difficulty, topic, subtopic,
          company_tags, tags, explanation, hints, editorial_placeholder, solution_placeholder,
          future_test_cases, future_judge_metadata, related_lessons, related_algorithms
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
        ON CONFLICT (problem_key)
        DO UPDATE SET
          lesson_id = EXCLUDED.lesson_id,
          chapter_slug = EXCLUDED.chapter_slug,
          lesson_slug = EXCLUDED.lesson_slug,
          title = EXCLUDED.title,
          difficulty = EXCLUDED.difficulty,
          topic = EXCLUDED.topic,
          subtopic = EXCLUDED.subtopic,
          company_tags = EXCLUDED.company_tags,
          tags = EXCLUDED.tags,
          explanation = EXCLUDED.explanation,
          hints = EXCLUDED.hints,
          editorial_placeholder = EXCLUDED.editorial_placeholder,
          solution_placeholder = EXCLUDED.solution_placeholder,
          future_test_cases = EXCLUDED.future_test_cases,
          future_judge_metadata = EXCLUDED.future_judge_metadata,
          related_lessons = EXCLUDED.related_lessons,
          related_algorithms = EXCLUDED.related_algorithms`,
        [
          key,
          lesson.lessonId,
          chapter.slug,
          lessonRef.slug,
          problem.title,
          difficulty,
          metadata.title,
          subtopic,
          ["Google", "Amazon", "Microsoft"],
          lesson.tags ?? [],
          problem.statement,
          problem.hints,
          problem.editorial,
          problem.solution,
          JSON.stringify(problem.tests),
          JSON.stringify({ judge: "local-samples", timeLimitMs: 1000, memoryLimitMb: 256, functionName: fn }),
          lesson.relatedLessons ?? [],
          lesson.tags ?? [],
        ],
      );
      count += 1;
    }
  }
}

await pool.query(`DELETE FROM practice_problems WHERE NOT (problem_key = ANY($1::text[]))`, [activeKeys]);
await pool.end();
console.log(`Seeded ${count} professional practice problems with 2 test cases each.`);
