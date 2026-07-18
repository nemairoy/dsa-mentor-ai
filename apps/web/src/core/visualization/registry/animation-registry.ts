import fs from "fs";
import path from "path";

import { implementedAnimations } from "@/core/visualization/animations/sample-data";
import { AnimationJsonParser } from "@/core/visualization/engine/animation-json-parser";
import type { AnimationDefinition } from "@/core/visualization/schema/animation-schema";

export type AnimationRegistryEntry = {
  id: string;
  componentName: string;
  title: string;
  status: "implemented" | "planned";
  category: string;
  lessonIds: string[];
};

const plannedEntries: AnimationRegistryEntry[] = [
  ["quick-sort", "QuickSortAnimation", "Quick Sort", "sorting"],
  ["merge-sort", "MergeSortAnimation", "Merge Sort", "sorting"],
  ["stack", "StackAnimation", "Stack", "stack"],
  ["queue", "QueueAnimation", "Queue", "queue"],
  ["linked-list", "LinkedListAnimation", "Linked List", "linked-list"],
  ["tree", "TreeAnimation", "Tree", "tree"],
  ["bst", "BSTAnimation", "Binary Search Tree", "tree"],
  ["heap", "HeapAnimation", "Heap", "heap"],
  ["trie", "TrieAnimation", "Trie", "trie"],
  ["graph", "GraphAnimation", "Graph", "graph"],
  ["dijkstra", "DijkstraAnimation", "Dijkstra", "graph"],
  ["bellman-ford", "BellmanFordAnimation", "Bellman-Ford", "graph"],
  ["union-find", "UnionFindAnimation", "Union Find", "dsu"],
  ["segment-tree", "SegmentTreeAnimation", "Segment Tree", "tree"],
  ["fenwick-tree", "FenwickTreeAnimation", "Fenwick Tree", "tree"],
].map(([id, componentName, title, category]) => ({
  id,
  componentName,
  title,
  category,
  status: "planned" as const,
  lessonIds: [],
}));

const aliases: Record<string, string> = {
  ArrayTraversalAnimation: "array-traversal",
  BinarySearchAnimation: "binary-search",
  BubbleSortAnimation: "bubble-sort",
  SelectionSortAnimation: "selection-sort",
  InsertionSortAnimation: "insertion-sort",
  StackPushAnimation: "stack-push",
  StackPopAnimation: "stack-pop",
  QueueEnqueueAnimation: "queue-enqueue",
  QueueDequeueAnimation: "queue-dequeue",
  TreeTraversalAnimation: "tree-traversal",
  DFSAnimation: "dfs",
  BFSAnimation: "bfs",
};

export class AnimationRegistry {
  private readonly parser = new AnimationJsonParser();
  private readonly implemented = new Map(implementedAnimations.map((definition) => [definition.id, definition]));

  list(): AnimationRegistryEntry[] {
    const implementedEntries = implementedAnimations.map((definition) => ({
      id: definition.id,
      componentName: definition.componentName,
      title: definition.title,
      status: "implemented" as const,
      category: definition.category,
      lessonIds: definition.metadata.lessonIds,
    }));

    return [...implementedEntries, ...plannedEntries].toSorted((left, right) => left.title.localeCompare(right.title));
  }

  get(idOrComponent: string): AnimationDefinition | null {
    const id = aliases[idOrComponent] ?? idOrComponent;
    const definition = this.implemented.get(id);
    return definition ? this.parser.parse(definition) : null;
  }

  getFromAnimationMap(animationId: string): AnimationDefinition | null {
    const mapPath = path.resolve(process.cwd(), "..", "..", "content", "animation-map.json");
    if (!fs.existsSync(mapPath)) {
      return this.get(animationId);
    }

    const animationMap = JSON.parse(fs.readFileSync(mapPath, "utf-8")) as Record<string, { animationId: string; component: string }>;
    const entry = Object.values(animationMap).find((item) => item.animationId === animationId || item.component === animationId);
    return this.get(entry?.component ?? animationId);
  }
}

export const animationRegistry = new AnimationRegistry();

