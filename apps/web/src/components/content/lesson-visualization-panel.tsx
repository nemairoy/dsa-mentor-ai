import type { LucideIcon } from "lucide-react";
import {
  Binary,
  Braces,
  Cable,
  CircleDot,
  GitBranch,
  Hash,
  Layers,
  List,
  Network,
  Rows3,
  Search,
  Shuffle,
  Split,
  SquareStack,
  TreePine,
} from "lucide-react";

import type { Lesson } from "@/core/content/domain/content";
import { buildLearningModel, isBubbleSortLesson, type PatternKey } from "@/components/content/lesson-learning-model";
import { cn } from "@/lib/utils";

type DiagramStep = {
  title: string;
  badge: string;
  values: Array<{ label: string; tone?: "active" | "fixed" | "muted" }>;
  note: string;
  boundary: string;
};

type PatternDiagram = {
  label: string;
  title: string;
  example: string;
  summary: string;
  icon: LucideIcon;
  steps: DiagramStep[];
};

const patternDiagrams: Record<PatternKey, PatternDiagram> = {
  sort: {
    label: "Sorting diagram",
    title: "Build a sorted region step by step",
    example: "Example: [5, 2, 4, 1]",
    summary:
      "Sorting is not magic. At every step, the algorithm compares values, moves the correct value, and grows the part that is already ordered.",
    icon: Shuffle,
    steps: [
      {
        title: "Start",
        badge: "Step 1",
        values: [{ label: "5", tone: "active" }, { label: "2", tone: "active" }, { label: "4" }, { label: "1" }],
        note: "Read the unsorted list. At this moment no position is guaranteed to be correct.",
        boundary: "sorted region: empty",
      },
      {
        title: "Compare",
        badge: "Step 2",
        values: [{ label: "2", tone: "fixed" }, { label: "5", tone: "active" }, { label: "4", tone: "active" }, { label: "1" }],
        note: "Use the lesson rule to decide which value should move closer to its final position.",
        boundary: "one value is closer to the correct place",
      },
      {
        title: "Grow sorted part",
        badge: "Step 3",
        values: [{ label: "1", tone: "fixed" }, { label: "2", tone: "fixed" }, { label: "5", tone: "active" }, { label: "4", tone: "active" }],
        note: "After repeated comparisons, the known sorted region becomes larger.",
        boundary: "sorted region is visible",
      },
      {
        title: "Finish",
        badge: "Step 4",
        values: [{ label: "1", tone: "fixed" }, { label: "2", tone: "fixed" }, { label: "4", tone: "fixed" }, { label: "5", tone: "fixed" }],
        note: "Verify adjacent values. If every pair is in order, the whole list is sorted.",
        boundary: "final: [1, 2, 4, 5]",
      },
    ],
  },
  search: {
    label: "Searching diagram",
    title: "Keep only the possible answer area",
    example: "Example: target = 7",
    summary:
      "Searching means proving one of two things: where the target is, or why it cannot exist in the remaining candidate area.",
    icon: Search,
    steps: [
      {
        title: "Input",
        badge: "Step 1",
        values: [{ label: "4" }, { label: "2" }, { label: "7", tone: "active" }, { label: "9" }],
        note: "Read the target and the data. The answer must be one of the candidate positions or missing.",
        boundary: "target: 7",
      },
      {
        title: "Check candidate",
        badge: "Step 2",
        values: [{ label: "4", tone: "active" }, { label: "2" }, { label: "7" }, { label: "9" }],
        note: "Compare the current candidate with the target. If it does not match, move according to the search rule.",
        boundary: "4 is not 7",
      },
      {
        title: "Narrow the search",
        badge: "Step 3",
        values: [{ label: "4", tone: "muted" }, { label: "2", tone: "active" }, { label: "7" }, { label: "9" }],
        note: "Discard or skip positions that cannot be the answer. Keep the remaining candidate area clear.",
        boundary: "continue to next candidate",
      },
      {
        title: "Answer",
        badge: "Step 4",
        values: [{ label: "4", tone: "muted" }, { label: "2", tone: "muted" }, { label: "7", tone: "fixed" }, { label: "9" }],
        note: "When the current value equals the target, return its position. If all candidates end, return not found.",
        boundary: "found target at index 2",
      },
    ],
  },
  array: {
    label: "Array diagram",
    title: "Use indexes to visit stored values",
    example: "Example: items = [3, 1, 4, 5]",
    summary:
      "An array keeps values in indexed positions. Most array algorithms become simple when you track the current index and the running state.",
    icon: Rows3,
    steps: [
      {
        title: "Indexed storage",
        badge: "Step 1",
        values: [{ label: "i=0\n3", tone: "active" }, { label: "i=1\n1" }, { label: "i=2\n4" }, { label: "i=3\n5" }],
        note: "Each value has a stable position. The index tells the algorithm where the value lives.",
        boundary: "current index = 0",
      },
      {
        title: "Read value",
        badge: "Step 2",
        values: [{ label: "3", tone: "fixed" }, { label: "1", tone: "active" }, { label: "4" }, { label: "5" }],
        note: "Read one value, update the running answer, then move to the next index.",
        boundary: "state updated after index 0",
      },
      {
        title: "Move forward",
        badge: "Step 3",
        values: [{ label: "3", tone: "muted" }, { label: "1", tone: "fixed" }, { label: "4", tone: "active" }, { label: "5" }],
        note: "The algorithm repeats the same action for every index.",
        boundary: "visited prefix grows",
      },
      {
        title: "Finish scan",
        badge: "Step 4",
        values: [{ label: "3", tone: "fixed" }, { label: "1", tone: "fixed" }, { label: "4", tone: "fixed" }, { label: "5", tone: "fixed" }],
        note: "After the last index, the running state becomes the final answer.",
        boundary: "all values processed",
      },
    ],
  },
  stack: {
    label: "Stack diagram",
    title: "Last inserted value comes out first",
    example: "Example: push 3, 1, 5",
    summary:
      "A stack works like plates. You add to the top, and the top item is the only one removed next. This is LIFO: last in, first out.",
    icon: SquareStack,
    steps: [
      {
        title: "Push first item",
        badge: "Step 1",
        values: [{ label: "3", tone: "fixed" }],
        note: "Insert 3. Since the stack was empty, 3 is both bottom and top.",
        boundary: "top = 3",
      },
      {
        title: "Push next item",
        badge: "Step 2",
        values: [{ label: "1", tone: "active" }, { label: "3" }],
        note: "Insert 1 on top of 3. The new item becomes the current top.",
        boundary: "top = 1",
      },
      {
        title: "Push last item",
        badge: "Step 3",
        values: [{ label: "5", tone: "active" }, { label: "1" }, { label: "3" }],
        note: "Insert 5 last. Because it is on top, it must be removed first.",
        boundary: "top = 5",
      },
      {
        title: "Pop order",
        badge: "Step 4",
        values: [{ label: "5", tone: "fixed" }, { label: "1", tone: "fixed" }, { label: "3", tone: "fixed" }],
        note: "Pop removes from top: 5 first, then 1, then 3.",
        boundary: "pop order: 5, 1, 3",
      },
    ],
  },
  queue: {
    label: "Queue diagram",
    title: "First inserted value comes out first",
    example: "Example: enqueue 3, 1, 5",
    summary:
      "A queue works like a line at a counter. New values join at the rear, and the front value leaves first. This is FIFO: first in, first out.",
    icon: List,
    steps: [
      {
        title: "Enqueue",
        badge: "Step 1",
        values: [{ label: "3", tone: "active" }],
        note: "Insert 3. It is the first value, so it is at the front.",
        boundary: "front = 3 | rear = 3",
      },
      {
        title: "Join rear",
        badge: "Step 2",
        values: [{ label: "3", tone: "fixed" }, { label: "1", tone: "active" }],
        note: "Insert 1 at the rear. 3 still stays at the front.",
        boundary: "front is unchanged",
      },
      {
        title: "More values join",
        badge: "Step 3",
        values: [{ label: "3", tone: "fixed" }, { label: "1" }, { label: "5", tone: "active" }],
        note: "Insert 5 at the rear. The removal order still starts from 3.",
        boundary: "rear = 5",
      },
      {
        title: "Dequeue order",
        badge: "Step 4",
        values: [{ label: "3", tone: "fixed" }, { label: "1", tone: "fixed" }, { label: "5", tone: "fixed" }],
        note: "Dequeue removes from the front: 3 first, then 1, then 5.",
        boundary: "dequeue order: 3, 1, 5",
      },
    ],
  },
  linkedList: {
    label: "Linked list diagram",
    title: "Move by following links",
    example: "Example: A -> B -> C",
    summary:
      "A linked list stores each value inside a node. To reach the next value, follow the next pointer instead of jumping by index.",
    icon: Cable,
    steps: [
      {
        title: "Head node",
        badge: "Step 1",
        values: [{ label: "A", tone: "active" }, { label: "next" }, { label: "B" }, { label: "C" }],
        note: "Start at head. The current pointer tells you which node is being processed.",
        boundary: "current = A",
      },
      {
        title: "Follow next",
        badge: "Step 2",
        values: [{ label: "A", tone: "muted" }, { label: "B", tone: "active" }, { label: "next" }, { label: "C" }],
        note: "Use current.next to move from A to B. You cannot skip directly by array index.",
        boundary: "current = B",
      },
      {
        title: "Continue traversal",
        badge: "Step 3",
        values: [{ label: "A", tone: "muted" }, { label: "B", tone: "muted" }, { label: "C", tone: "active" }],
        note: "Repeat: process the node, then move to the next link.",
        boundary: "current = C",
      },
      {
        title: "End",
        badge: "Step 4",
        values: [{ label: "A", tone: "fixed" }, { label: "B", tone: "fixed" }, { label: "C", tone: "fixed" }, { label: "None", tone: "muted" }],
        note: "When next becomes None, traversal is complete.",
        boundary: "stop at null",
      },
    ],
  },
  graph: {
    label: "Graph diagram",
    title: "Visit nodes through edges",
    example: "Example: A connected to B and C",
    summary:
      "A graph is a set of nodes connected by edges. Graph algorithms stay correct by tracking visited nodes and the next frontier.",
    icon: Network,
    steps: [
      {
        title: "Start node",
        badge: "Step 1",
        values: [{ label: "A", tone: "active" }, { label: "B" }, { label: "C" }, { label: "D" }],
        note: "Choose a start node. Mark it visited so it is not processed again.",
        boundary: "visited: {A}",
      },
      {
        title: "Explore neighbors",
        badge: "Step 2",
        values: [{ label: "A", tone: "fixed" }, { label: "B", tone: "active" }, { label: "C", tone: "active" }, { label: "D" }],
        note: "Look at nodes connected by edges from A. These become the next candidates.",
        boundary: "frontier: B, C",
      },
      {
        title: "Advance frontier",
        badge: "Step 3",
        values: [{ label: "A", tone: "muted" }, { label: "B", tone: "fixed" }, { label: "C", tone: "active" }, { label: "D", tone: "active" }],
        note: "Process one frontier node and add its unvisited neighbors.",
        boundary: "avoid revisiting nodes",
      },
      {
        title: "Complete",
        badge: "Step 4",
        values: [{ label: "A", tone: "fixed" }, { label: "B", tone: "fixed" }, { label: "C", tone: "fixed" }, { label: "D", tone: "fixed" }],
        note: "When no new frontier remains, all reachable nodes have been handled.",
        boundary: "visited: all reachable nodes",
      },
    ],
  },
  heap: {
    label: "Heap diagram",
    title: "Keep the priority value at the root",
    example: "Example min-heap: [1, 3, 5, 8]",
    summary:
      "A heap keeps the highest-priority value at the root. Insert and remove operations repair the heap property by moving values up or down.",
    icon: Binary,
    steps: [
      {
        title: "Root priority",
        badge: "Step 1",
        values: [{ label: "1", tone: "fixed" }, { label: "3" }, { label: "5" }, { label: "8" }],
        note: "In a min-heap, the smallest value stays at the root.",
        boundary: "root = best priority",
      },
      {
        title: "Insert",
        badge: "Step 2",
        values: [{ label: "1", tone: "fixed" }, { label: "3" }, { label: "5" }, { label: "0", tone: "active" }],
        note: "A new value is placed at the end first.",
        boundary: "new value may break heap",
      },
      {
        title: "Bubble up",
        badge: "Step 3",
        values: [{ label: "0", tone: "active" }, { label: "1", tone: "fixed" }, { label: "5" }, { label: "3" }],
        note: "If the new value has higher priority, swap it upward until the heap property is restored.",
        boundary: "root repaired",
      },
      {
        title: "Extract",
        badge: "Step 4",
        values: [{ label: "0", tone: "fixed" }, { label: "1" }, { label: "3" }, { label: "5" }],
        note: "Extract returns the root, then the heap repairs itself again.",
        boundary: "next priority is ready",
      },
    ],
  },
  tree: {
    label: "Tree diagram",
    title: "Solve the current node using its children",
    example: "Example: root with left and right child",
    summary:
      "Tree algorithms usually process a node, then combine answers from the left and right subtrees.",
    icon: TreePine,
    steps: [
      {
        title: "Root",
        badge: "Step 1",
        values: [{ label: "root", tone: "active" }, { label: "left" }, { label: "right" }],
        note: "Start from the root node. Decide what information this node needs from its children.",
        boundary: "current = root",
      },
      {
        title: "Left subtree",
        badge: "Step 2",
        values: [{ label: "root" }, { label: "left", tone: "active" }, { label: "right" }],
        note: "Solve the left side first if the traversal or recursion asks for it.",
        boundary: "left answer ready",
      },
      {
        title: "Right subtree",
        badge: "Step 3",
        values: [{ label: "root" }, { label: "left", tone: "fixed" }, { label: "right", tone: "active" }],
        note: "Solve the right side and bring that result back to the current node.",
        boundary: "right answer ready",
      },
      {
        title: "Combine",
        badge: "Step 4",
        values: [{ label: "root", tone: "fixed" }, { label: "left", tone: "fixed" }, { label: "right", tone: "fixed" }],
        note: "Combine current node, left answer, and right answer to produce the final result.",
        boundary: "answer returned upward",
      },
    ],
  },
  dp: {
    label: "Dynamic programming diagram",
    title: "Store smaller answers and reuse them",
    example: "Example: dp[0], dp[1], dp[2], dp[3]",
    summary:
      "Dynamic Programming avoids solving the same subproblem again. Define a state, compute small states first, then reuse them to build larger answers.",
    icon: Layers,
    steps: [
      {
        title: "Define state",
        badge: "Step 1",
        values: [{ label: "dp[i]", tone: "active" }, { label: "meaning" }],
        note: "Decide what one table cell means. Without a clear state, DP becomes guesswork.",
        boundary: "state meaning is fixed",
      },
      {
        title: "Base case",
        badge: "Step 2",
        values: [{ label: "dp[0]", tone: "fixed" }, { label: "dp[1]", tone: "fixed" }, { label: "dp[2]" }],
        note: "Fill the smallest answers that are known directly.",
        boundary: "base answers ready",
      },
      {
        title: "Transition",
        badge: "Step 3",
        values: [{ label: "dp[i-1]", tone: "fixed" }, { label: "dp[i-2]", tone: "fixed" }, { label: "dp[i]", tone: "active" }],
        note: "Use previous states to compute the current state.",
        boundary: "reuse instead of recompute",
      },
      {
        title: "Final answer",
        badge: "Step 4",
        values: [{ label: "dp[0]", tone: "fixed" }, { label: "dp[1]", tone: "fixed" }, { label: "dp[n]", tone: "fixed" }],
        note: "The requested answer is usually one table cell or a combination of final states.",
        boundary: "return requested state",
      },
    ],
  },
  recursion: {
    label: "Recursion diagram",
    title: "Break the problem until the base case",
    example: "Example: solve n using n - 1",
    summary:
      "Recursion solves a problem by calling the same logic on a smaller input. It must have a base case that stops the calls.",
    icon: GitBranch,
    steps: [
      {
        title: "Original call",
        badge: "Step 1",
        values: [{ label: "f(4)", tone: "active" }],
        note: "Start with the full problem.",
        boundary: "need smaller answer",
      },
      {
        title: "Recursive call",
        badge: "Step 2",
        values: [{ label: "f(4)" }, { label: "f(3)", tone: "active" }, { label: "f(2)" }],
        note: "Call the same function on a smaller version of the problem.",
        boundary: "problem size decreases",
      },
      {
        title: "Base case",
        badge: "Step 3",
        values: [{ label: "f(1)", tone: "fixed" }, { label: "known" }],
        note: "When the input is small enough, return a direct answer without another recursive call.",
        boundary: "stop condition reached",
      },
      {
        title: "Return upward",
        badge: "Step 4",
        values: [{ label: "f(1)", tone: "fixed" }, { label: "f(2)", tone: "fixed" }, { label: "f(3)", tone: "fixed" }, { label: "f(4)", tone: "fixed" }],
        note: "Each waiting call uses the smaller answer and returns its own answer.",
        boundary: "final answer returned",
      },
    ],
  },
  hashing: {
    label: "Hashing diagram",
    title: "Use a key to find data quickly",
    example: "Example: seen values",
    summary:
      "Hashing stores data by key. It is useful when you need fast lookup, duplicate detection, or frequency counting.",
    icon: Hash,
    steps: [
      {
        title: "Read key",
        badge: "Step 1",
        values: [{ label: "4", tone: "active" }, { label: "2" }, { label: "4" }],
        note: "Read one value and treat it as a key.",
        boundary: "key = 4",
      },
      {
        title: "Check table",
        badge: "Step 2",
        values: [{ label: "seen", tone: "active" }, { label: "{}" }],
        note: "Ask whether the key already exists in the table or set.",
        boundary: "4 not found",
      },
      {
        title: "Store key",
        badge: "Step 3",
        values: [{ label: "seen", tone: "fixed" }, { label: "{4}", tone: "active" }],
        note: "Store the key so future steps can find it quickly.",
        boundary: "remember 4",
      },
      {
        title: "Fast lookup",
        badge: "Step 4",
        values: [{ label: "4", tone: "fixed" }, { label: "found", tone: "fixed" }],
        note: "When 4 appears again, lookup tells you immediately that it was already seen.",
        boundary: "duplicate detected",
      },
    ],
  },
  complexity: {
    label: "Complexity diagram",
    title: "Count how work grows with input size",
    example: "Example: n = 4",
    summary:
      "Complexity ignores machine speed and focuses on growth. Count the repeated operation and describe how it changes when input size grows.",
    icon: CircleDot,
    steps: [
      {
        title: "Input size",
        badge: "Step 1",
        values: [{ label: "n", tone: "active" }, { label: "items" }],
        note: "Choose what n means: number of items, nodes, edges, digits, or operations.",
        boundary: "define n first",
      },
      {
        title: "Repeated work",
        badge: "Step 2",
        values: [{ label: "loop", tone: "active" }, { label: "compare" }, { label: "update" }],
        note: "Find the operation that repeats as n grows.",
        boundary: "dominant operation",
      },
      {
        title: "Growth pattern",
        badge: "Step 3",
        values: [{ label: "n", tone: "fixed" }, { label: "n^2", tone: "active" }, { label: "log n" }],
        note: "Decide whether the work grows linearly, quadratically, logarithmically, or another way.",
        boundary: "choose notation",
      },
      {
        title: "Final bound",
        badge: "Step 4",
        values: [{ label: "O(...)", tone: "fixed" }, { label: "space", tone: "fixed" }],
        note: "State time and space complexity with the reason, not just the symbol.",
        boundary: "explain the dominant term",
      },
    ],
  },
  string: {
    label: "String diagram",
    title: "Process characters in order",
    example: "Example: text = racecar",
    summary:
      "String problems are usually array problems over characters. Track indexes, characters, and any window or frequency state.",
    icon: Braces,
    steps: [
      {
        title: "Characters",
        badge: "Step 1",
        values: [{ label: "r", tone: "active" }, { label: "a" }, { label: "c" }, { label: "e" }],
        note: "A string is a sequence of characters. Each character has an index.",
        boundary: "index = 0",
      },
      {
        title: "Compare or count",
        badge: "Step 2",
        values: [{ label: "r", tone: "active" }, { label: "..." }, { label: "r", tone: "active" }],
        note: "Many string rules compare characters, count frequencies, or move a window.",
        boundary: "track current characters",
      },
      {
        title: "Move pointers",
        badge: "Step 3",
        values: [{ label: "left", tone: "fixed" }, { label: "text" }, { label: "right", tone: "fixed" }],
        note: "Update indexes carefully so no character is skipped accidentally.",
        boundary: "state changes by index",
      },
      {
        title: "Return result",
        badge: "Step 4",
        values: [{ label: "valid", tone: "fixed" }, { label: "answer", tone: "fixed" }],
        note: "The final answer follows from all character checks made so far.",
        boundary: "string rule satisfied",
      },
    ],
  },
  generic: {
    label: "Concept diagram",
    title: "Read input, update state, verify output",
    example: "Example: one small trace",
    summary:
      "Every DSA topic becomes easier when you separate input, changing state, repeated rule, and final verification.",
    icon: Split,
    steps: [
      {
        title: "Input",
        badge: "Step 1",
        values: [{ label: "data", tone: "active" }, { label: "goal" }],
        note: "Identify what is given and what output is required.",
        boundary: "problem understood",
      },
      {
        title: "State",
        badge: "Step 2",
        values: [{ label: "state", tone: "active" }, { label: "answer" }],
        note: "Write down what changes after each step.",
        boundary: "state is visible",
      },
      {
        title: "Rule",
        badge: "Step 3",
        values: [{ label: "rule", tone: "active" }, { label: "update" }],
        note: "Apply the same rule consistently.",
        boundary: "repeat safely",
      },
      {
        title: "Verify",
        badge: "Step 4",
        values: [{ label: "check", tone: "fixed" }, { label: "output", tone: "fixed" }],
        note: "Check why the final state answers the original question.",
        boundary: "answer is justified",
      },
    ],
  },
};

export function LessonVisualizationPanel({ lesson }: { lesson: Lesson }) {
  const model = buildLearningModel(lesson);
  const diagram = patternDiagrams[model.pattern] ?? patternDiagrams.generic;

  return (
    <section id="visualization" className="scroll-mt-28 rounded-xl border border-border bg-card p-3 shadow-sm">
      <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-300">Concept picture</p>
          <h2 className="mt-1 font-semibold">{isBubbleSortLesson(lesson) ? "Bubble Sort" : model.topic}</h2>
        </div>
        <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">Beginner friendly</span>
      </div>

      <div className="space-y-3">
        {isBubbleSortLesson(lesson) ? <BubbleSortConceptDiagram /> : <PatternConceptDiagram diagram={diagram} />}
        <div className="grid gap-2 md:grid-cols-3">
          <ConceptNote label="State" value={model.state} />
          <ConceptNote label="Rule" value={model.rule} />
          <ConceptNote label="Remember" value={model.invariant} />
        </div>
      </div>
    </section>
  );
}

const bubblePasses = [
  {
    title: "Start",
    values: [5, 1, 4, 2],
    highlight: [0, 1],
    note: "Compare the first neighboring pair: 5 and 1.",
    boundary: "Nothing is sorted yet.",
  },
  {
    title: "Swap 5 and 1",
    values: [1, 5, 4, 2],
    highlight: [1, 2],
    note: "5 is bigger, so it moves one step right. Now compare 5 and 4.",
    boundary: "Still searching for the largest value.",
  },
  {
    title: "Swap 5 and 4",
    values: [1, 4, 5, 2],
    highlight: [2, 3],
    note: "5 is still bigger than its neighbor, so it moves right again.",
    boundary: "5 is almost at the end.",
  },
  {
    title: "Pass 1 complete",
    values: [1, 4, 2, 5],
    highlight: [3],
    note: "5 reached the last position. This position is now fixed.",
    boundary: "Sorted right side: [5]",
  },
];

function BubbleSortConceptDiagram() {
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <div className="rounded-xl border border-border bg-[linear-gradient(90deg,rgba(16,185,129,0.08),transparent_42%),linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:100%_100%,48px_48px,48px_48px] p-4">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-300">Bubble sort diagram</p>
            <h3 className="mt-1 text-base font-semibold">Largest value bubbles to the right</h3>
          </div>
          <div className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
            Example: [5, 1, 4, 2]
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          {bubblePasses.map((pass, passIndex) => (
            <div key={pass.title} className="rounded-xl border border-border bg-card p-3">
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-sm font-semibold">{pass.title}</p>
                <span className="rounded-full bg-muted px-2 py-1 text-[11px] text-muted-foreground">Step {passIndex + 1}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {pass.values.map((value, index) => {
                  const active = pass.highlight.includes(index);
                  const fixed = passIndex === 3 && index === 3;

                  return (
                    <div key={`${pass.title}-${index}`} className="text-center">
                      <div
                        className={cn(
                          "grid h-12 w-12 place-items-center rounded-xl border text-base font-bold",
                          fixed
                            ? "border-emerald-400 bg-emerald-500 text-slate-950"
                            : active
                              ? "border-sky-300 bg-sky-400 text-slate-950"
                              : "border-border bg-background text-foreground",
                        )}
                      >
                        {value}
                      </div>
                      <p className="mt-1 text-[10px] text-muted-foreground">i={index}</p>
                    </div>
                  );
                })}
              </div>
              <p className="mt-3 text-xs leading-5 text-muted-foreground">{pass.note}</p>
              <p className="mt-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium">{pass.boundary}</p>
            </div>
          ))}
        </div>

        <div className="mt-3 rounded-xl border border-emerald-500/25 bg-emerald-50 p-3 text-xs leading-5 text-emerald-950 dark:bg-emerald-400/10 dark:text-emerald-100">
          One pass does not fully sort the array. It only guarantees that the largest unsorted value is now fixed on the right. Bubble Sort repeats this pass on the remaining left part.
        </div>
      </div>
    </div>
  );
}

function PatternConceptDiagram({ diagram }: { diagram: PatternDiagram }) {
  const Icon = diagram.icon;

  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <div className="rounded-xl border border-border bg-[linear-gradient(90deg,rgba(16,185,129,0.08),transparent_42%),linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:100%_100%,48px_48px,48px_48px] p-4">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
              <Icon aria-hidden={true} size={19} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-300">{diagram.label}</p>
              <h3 className="mt-1 text-base font-semibold">{diagram.title}</h3>
            </div>
          </div>
          <div className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">{diagram.example}</div>
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          {diagram.steps.map((step) => (
            <div key={step.title} className="rounded-xl border border-border bg-card p-3">
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-sm font-semibold">{step.title}</p>
                <span className="rounded-full bg-muted px-2 py-1 text-[11px] text-muted-foreground">{step.badge}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {step.values.map((value, index) => (
                  <ValueTile key={`${step.title}-${value.label}-${index}`} label={value.label} tone={value.tone} />
                ))}
              </div>
              <p className="mt-3 text-xs leading-5 text-muted-foreground">{step.note}</p>
              <p className="mt-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium">{step.boundary}</p>
            </div>
          ))}
        </div>

        <div className="mt-3 rounded-xl border border-emerald-500/25 bg-emerald-50 p-3 text-xs leading-5 text-emerald-950 dark:bg-emerald-400/10 dark:text-emerald-100">
          {diagram.summary}
        </div>
      </div>
    </div>
  );
}

function ValueTile({ label, tone = "muted" }: { label: string; tone?: "active" | "fixed" | "muted" }) {
  return (
    <div
      className={cn(
        "grid min-h-12 min-w-12 place-items-center whitespace-pre-line rounded-xl border px-3 text-center text-sm font-bold leading-5",
        tone === "fixed"
          ? "border-emerald-400 bg-emerald-500 text-slate-950"
          : tone === "active"
            ? "border-sky-300 bg-sky-400 text-slate-950"
            : "border-border bg-background text-foreground",
      )}
    >
      {label}
    </div>
  );
}

function ConceptNote({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-700 dark:text-emerald-300">{label}</p>
      <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{value}</p>
    </div>
  );
}
