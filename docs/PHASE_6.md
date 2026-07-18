# Phase 6: Visualization Framework

## Scope

Phase 6 adds a JSON-driven visualization framework. It does not add GIFs, videos, Lottie, recommendation logic, admin tooling, CMS, or hundreds of custom animations.

## Architecture

```text
Animation JSON
  -> AnimationJsonParser
  -> AnimationRegistry
  -> AnimationLoader
  -> AnimationEngine
  -> useAnimationController
  -> AnimationPlayer
  -> SVG Renderer
  -> Framer Motion
```

## Modules

- `core/visualization/schema`: JSON schema and TypeScript types
- `core/visualization/engine`: engine, parser, event system
- `core/visualization/registry`: implemented and planned animation registry
- `core/visualization/loader`: metadata-aware animation loading
- `core/visualization/theme`: reusable animation theme tokens
- `core/visualization/animations`: sample JSON definitions
- `components/visualization/player`: reusable player and synchronized panels
- `components/visualization/svg`: SVG renderer
- `hooks/use-animation-controller.ts`: player state and keyboard controller

## Step Model

Each animation step includes:

- current state
- highlighted elements
- explanation
- current variables
- pseudocode line
- code line
- animation duration

## Implemented Samples

- Array Traversal
- Linear Search
- Binary Search
- Bubble Sort
- Selection Sort
- Insertion Sort
- Stack Push
- Stack Pop
- Queue Enqueue
- Queue Dequeue
- Linked List Traversal
- Tree Traversal
- DFS
- BFS

## Registry

The registry contains implemented samples plus planned entries for future algorithms such as Quick Sort, Merge Sort, Heap, Trie, Dijkstra, Bellman-Ford, Union Find, Segment Tree, and Fenwick Tree.

## Player

Player features:

- play
- pause
- resume
- reset
- replay
- previous step
- next step
- jump to any step
- timeline
- progress
- speed controls: 0.25x, 0.5x, 1x, 2x, 4x
- fullscreen
- synchronized pseudocode
- synchronized code
- keyboard navigation

## AI Integration

The resolver API maps AI/user intent to registered animations:

```text
POST /api/visualizations/resolve
```

The route returns a visualization URL such as `/visualizations/bubble-sort`.

