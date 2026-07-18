import type { AnimationDefinition, VisualEdge, VisualNode } from "@/core/visualization/schema/animation-schema";

function arrayNodes(values: number[], active: number[] = [], visited: number[] = [], found: number | null = null): VisualNode[] {
  return values.map((value, index) => ({
    id: `i${index}`,
    label: String(index),
    value: String(value),
    x: 70 + index * 70,
    y: 130,
    state: found === index ? "found" : active.includes(index) ? "active" : visited.includes(index) ? "visited" : "default",
  }));
}

function treeNodes(active: string[] = [], visited: string[] = []): VisualNode[] {
  return [
    { id: "a", label: "A", value: "8", x: 260, y: 60, state: active.includes("a") ? "active" : visited.includes("a") ? "visited" : "default" },
    { id: "b", label: "B", value: "3", x: 150, y: 150, state: active.includes("b") ? "active" : visited.includes("b") ? "visited" : "default" },
    { id: "c", label: "C", value: "10", x: 370, y: 150, state: active.includes("c") ? "active" : visited.includes("c") ? "visited" : "default" },
    { id: "d", label: "D", value: "1", x: 95, y: 240, state: active.includes("d") ? "active" : visited.includes("d") ? "visited" : "default" },
    { id: "e", label: "E", value: "6", x: 205, y: 240, state: active.includes("e") ? "active" : visited.includes("e") ? "visited" : "default" },
  ];
}

const treeEdges: VisualEdge[] = [
  { id: "a-b", from: "a", to: "b", state: "default", directed: false },
  { id: "a-c", from: "a", to: "c", state: "default", directed: false },
  { id: "b-d", from: "b", to: "d", state: "default", directed: false },
  { id: "b-e", from: "b", to: "e", state: "default", directed: false },
];

function graphNodes(active: string[] = [], visited: string[] = []): VisualNode[] {
  return [
    { id: "a", label: "A", x: 120, y: 90, state: active.includes("a") ? "active" : visited.includes("a") ? "visited" : "default" },
    { id: "b", label: "B", x: 250, y: 70, state: active.includes("b") ? "active" : visited.includes("b") ? "visited" : "default" },
    { id: "c", label: "C", x: 380, y: 120, state: active.includes("c") ? "active" : visited.includes("c") ? "visited" : "default" },
    { id: "d", label: "D", x: 180, y: 240, state: active.includes("d") ? "active" : visited.includes("d") ? "visited" : "default" },
    { id: "e", label: "E", x: 340, y: 250, state: active.includes("e") ? "active" : visited.includes("e") ? "visited" : "default" },
  ];
}

const graphEdges: VisualEdge[] = [
  { id: "a-b", from: "a", to: "b", directed: true, state: "default" },
  { id: "a-d", from: "a", to: "d", directed: true, state: "default" },
  { id: "b-c", from: "b", to: "c", directed: true, state: "default" },
  { id: "d-e", from: "d", to: "e", directed: true, state: "default" },
  { id: "e-c", from: "e", to: "c", directed: true, state: "default" },
];

function baseDefinition(
  id: string,
  componentName: string,
  title: string,
  category: string,
  nodesByStep: VisualNode[][],
  explanations: string[],
  edgesByStep: VisualEdge[][] = nodesByStep.map(() => []),
): AnimationDefinition {
  return {
    id,
    componentName,
    title,
    category,
    description: `${title} driven by reusable JSON steps.`,
    defaultSpeed: 1,
    theme: "system",
    pseudocode: ["initialize state", "inspect current element", "update state", "advance", "finish"],
    code: {
      language: "python",
      lines: ["def animate(items):", "    for item in items:", "        inspect(item)", "        update_state()", "    return result"],
    },
    steps: nodesByStep.map((nodes, index) => ({
      id: `${id}-step-${index}`,
      title: `Step ${index + 1}`,
      explanation: explanations[index] ?? "Advance the algorithm state.",
      durationMs: 850,
      state: { nodes, edges: edgesByStep[index] ?? [], collections: {} },
      highlightedElements: nodes.filter((node) => node.state === "active" || node.state === "compare").map((node) => node.id),
      variables: { step: String(index + 1) },
      pseudocodeLine: Math.min(index + 1, 5),
      codeLine: Math.min(index + 1, 5),
    })),
    metadata: { lessonIds: [], tags: [category], difficulty: "Beginner", aiTriggers: [title.toLowerCase()] },
  };
}

export const implementedAnimations: AnimationDefinition[] = [
  baseDefinition("array-traversal", "ArrayTraversalAnimation", "Array Traversal", "array", [arrayNodes([4, 8, 2], [0]), arrayNodes([4, 8, 2], [1], [0]), arrayNodes([4, 8, 2], [2], [0, 1]), arrayNodes([4, 8, 2], [], [0, 1, 2])], ["Start at index 0.", "Move to index 1.", "Move to index 2.", "Traversal is complete."]),
  baseDefinition("linear-search", "LinearSearchAnimation", "Linear Search", "search", [arrayNodes([7, 3, 9, 5], [0]), arrayNodes([7, 3, 9, 5], [1], [0]), arrayNodes([7, 3, 9, 5], [2], [0, 1], 2)], ["Compare first value.", "Target not found yet.", "Target found at index 2."]),
  baseDefinition("binary-search", "BinarySearchAnimation", "Binary Search", "search", [arrayNodes([1, 3, 5, 7, 9], [2]), arrayNodes([1, 3, 5, 7, 9], [3], [0, 1, 2]), arrayNodes([1, 3, 5, 7, 9], [4], [0, 1, 2, 3], 4)], ["Check the middle.", "Discard the left half.", "Target found."]),
  baseDefinition("bubble-sort", "BubbleSortAnimation", "Bubble Sort", "sorting", [arrayNodes([5, 1, 4], [0, 1]), arrayNodes([1, 5, 4], [1, 2]), arrayNodes([1, 4, 5], [], [0, 1, 2])], ["Compare adjacent values.", "Swap values that are out of order.", "Largest value bubbles to the end."]),
  baseDefinition("selection-sort", "SelectionSortAnimation", "Selection Sort", "sorting", [arrayNodes([4, 2, 7], [0]), arrayNodes([4, 2, 7], [1]), arrayNodes([2, 4, 7], [], [0])], ["Assume first value is minimum.", "Find smaller minimum.", "Swap minimum into position."]),
  baseDefinition("insertion-sort", "InsertionSortAnimation", "Insertion Sort", "sorting", [arrayNodes([3, 1, 4], [1]), arrayNodes([1, 3, 4], [0, 1]), arrayNodes([1, 3, 4], [], [0, 1, 2])], ["Pick next value.", "Insert into sorted prefix.", "Sorted prefix expands."]),
  baseDefinition("stack-push", "StackPushAnimation", "Stack Push", "stack", [arrayNodes([1], [0]), arrayNodes([1, 2], [1], [0]), arrayNodes([1, 2, 3], [2], [0, 1])], ["Push first item.", "Push onto top.", "New value becomes top."]),
  baseDefinition("stack-pop", "StackPopAnimation", "Stack Pop", "stack", [arrayNodes([1, 2, 3], [2]), arrayNodes([1, 2], [1]), arrayNodes([1], [0])], ["Top value is selected.", "Remove top.", "Next value becomes top."]),
  baseDefinition("queue-enqueue", "QueueEnqueueAnimation", "Queue Enqueue", "queue", [arrayNodes([1], [0]), arrayNodes([1, 2], [1], [0]), arrayNodes([1, 2, 3], [2], [0, 1])], ["Insert at rear.", "Rear advances.", "Queue preserves FIFO order."]),
  baseDefinition("queue-dequeue", "QueueDequeueAnimation", "Queue Dequeue", "queue", [arrayNodes([1, 2, 3], [0]), arrayNodes([2, 3], [0]), arrayNodes([3], [0])], ["Front is removed first.", "Next value becomes front.", "FIFO order is preserved."]),
  baseDefinition("linked-list-traversal", "LinkedListTraversalAnimation", "Linked List Traversal", "linked-list", [arrayNodes([10, 20, 30], [0]), arrayNodes([10, 20, 30], [1], [0]), arrayNodes([10, 20, 30], [2], [0, 1])], ["Visit head.", "Follow next pointer.", "Continue until null."]),
  baseDefinition("tree-traversal", "TreeTraversalAnimation", "Tree Traversal", "tree", [treeNodes(["a"]), treeNodes(["b"], ["a"]), treeNodes(["d"], ["a", "b"]), treeNodes(["e"], ["a", "b", "d"])], ["Start at root.", "Move left.", "Visit left child.", "Backtrack to sibling."], [treeEdges, treeEdges, treeEdges, treeEdges]),
  baseDefinition("dfs", "DFSAnimation", "Depth-First Search", "graph", [graphNodes(["a"]), graphNodes(["b"], ["a"]), graphNodes(["c"], ["a", "b"]), graphNodes(["d"], ["a", "b", "c"])], ["Start DFS.", "Go deep to B.", "Continue to C.", "Backtrack and explore D."], [graphEdges, graphEdges, graphEdges, graphEdges]),
  baseDefinition("bfs", "BFSAnimation", "Breadth-First Search", "graph", [graphNodes(["a"]), graphNodes(["b", "d"], ["a"]), graphNodes(["c", "e"], ["a", "b", "d"]), graphNodes([], ["a", "b", "d", "c", "e"])], ["Start BFS.", "Visit neighbors by level.", "Queue next level.", "Traversal complete."], [graphEdges, graphEdges, graphEdges, graphEdges]),
];

