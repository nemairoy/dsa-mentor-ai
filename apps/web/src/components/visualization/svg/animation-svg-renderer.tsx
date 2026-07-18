"use client";

import { memo } from "react";

import type { AnimationDefinition, AnimationStep } from "@/core/visualization/schema/animation-schema";

type AnimationSvgRendererProps = {
  definition: AnimationDefinition;
  step: AnimationStep;
};

export const AnimationSvgRenderer = memo(function AnimationSvgRenderer({ definition }: AnimationSvgRendererProps) {
  const markerId = `concept-arrow-${definition.id.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  return (
    <svg
      viewBox="0 0 760 420"
      role="img"
      aria-label={`${definition.title} concept picture`}
      className="min-h-[280px] w-full rounded-2xl border border-border"
      style={{ backgroundColor: "var(--viz-bg)" }}
    >
      <defs>
        <marker id={markerId} markerWidth="12" markerHeight="12" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,6 L9,3 z" fill="var(--viz-edge)" />
        </marker>
        <filter id={`${markerId}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="var(--viz-shadow)" floodOpacity="0.2" />
        </filter>
        <pattern id={`${markerId}-grid`} width="34" height="34" patternUnits="userSpaceOnUse">
          <path d="M34 0H0V34" fill="none" stroke="var(--viz-grid)" strokeWidth="1" opacity="0.45" />
        </pattern>
      </defs>

      <rect x="0" y="0" width="760" height="420" fill={`url(#${markerId}-grid)`} opacity="0.52" />
      <ConceptDiagram definition={definition} markerId={markerId} shadowId={`${markerId}-shadow`} />
      <Caption text={conceptCaption(definition)} />
    </svg>
  );
});

function ConceptDiagram({ definition, markerId, shadowId }: { definition: AnimationDefinition; markerId: string; shadowId: string }) {
  const title = definition.title.toLowerCase();
  const category = definition.category.toLowerCase();

  if (category === "stack") return <StackDiagram isPop={title.includes("pop")} markerId={markerId} shadowId={shadowId} />;
  if (category === "queue") return <QueueDiagram isDequeue={title.includes("dequeue")} markerId={markerId} shadowId={shadowId} />;
  if (category === "linked-list") return <LinkedListDiagram markerId={markerId} shadowId={shadowId} />;
  if (category === "tree") return <TreeDiagram markerId={markerId} shadowId={shadowId} />;
  if (category === "graph") return <GraphDiagram mode={title.includes("breadth") ? "BFS" : "DFS"} markerId={markerId} shadowId={shadowId} />;
  if (category === "search") return <SearchDiagram isBinary={title.includes("binary")} markerId={markerId} shadowId={shadowId} />;
  if (category === "sorting") return <SortingDiagram title={definition.title} markerId={markerId} shadowId={shadowId} />;
  return <ArrayDiagram markerId={markerId} shadowId={shadowId} />;
}

function StackDiagram({ isPop, markerId, shadowId }: { isPop: boolean; markerId: string; shadowId: string }) {
  return (
    <g filter={`url(#${shadowId})`}>
      <Panel x={54} y={48} width={314} height={286} label="Push operation" />
      <Panel x={392} y={48} width={314} height={286} label="Pop operation" />

      <text x="106" y="112" fill="var(--viz-text)" className="text-[19px] font-bold">
        Add C on top
      </text>
      <Box x={116} y={130} width={50} height={42} text="C" muted />
      <Arrow x1={178} y1={151} x2={222} y2={178} markerId={markerId} curved />
      <Stack x={220} y={178} values={["C", "B", "A"]} />
      <Label x={108} y={234} text="Top" />
      <Arrow x1={152} y1={230} x2={214} y2={196} markerId={markerId} />

      <text x="452" y="112" fill="var(--viz-text)" className="text-[19px] font-bold">
        Remove top
      </text>
      <Stack x={512} y={178} values={isPop ? ["B", "A"] : ["C", "B", "A"]} ghostTop={isPop ? "C" : undefined} />
      <Arrow x1={604} y1={160} x2={652} y2={132} markerId={markerId} curved />
      <Box x={654} y={108} width={50} height={42} text="C" muted={!isPop} />
      <Label x={448} y={234} text="Top" />
      <Arrow x1={492} y1={230} x2={506} y2={196} markerId={markerId} />
    </g>
  );
}

function QueueDiagram({ isDequeue, markerId, shadowId }: { isDequeue: boolean; markerId: string; shadowId: string }) {
  return (
    <g filter={`url(#${shadowId})`}>
      <Panel x={82} y={134} width={596} height={190} label="FIFO order" />
      <text x="126" y="172" fill="var(--viz-text)" className="text-[18px] font-bold">
        Front
      </text>
      <text x="584" y="172" fill="var(--viz-text)" className="text-[18px] font-bold">
        Rear
      </text>
      <Arrow x1={164} y1={184} x2={210} y2={208} markerId={markerId} />
      <Arrow x1={548} y1={208} x2={596} y2={184} markerId={markerId} />
      {["A", "B", "C"].map((value, index) => (
        <Box key={value} x={230 + index * 92} y={192} width={74} height={66} text={value} />
      ))}
      <Arrow x1={486} y1={225} x2={544} y2={225} markerId={markerId} />
      <Box x={560} y={192} width={74} height={66} text="D" muted={isDequeue} />
      <Arrow x1={230} y1={225} x2={178} y2={225} markerId={markerId} />
      <Box x={114} y={192} width={54} height={66} text="A" muted={!isDequeue} />
      <text x="380" y="302" textAnchor="middle" fill="var(--viz-edge)" className="text-[13px] font-semibold">
        Enqueue at rear, dequeue from front
      </text>
    </g>
  );
}

function LinkedListDiagram({ markerId, shadowId }: { markerId: string; shadowId: string }) {
  return (
    <g filter={`url(#${shadowId})`}>
      <Panel x={72} y={132} width={616} height={198} label="Pointer chain" />
      <text x="108" y="226" fill="var(--viz-success-text)" className="text-[18px] font-bold">
        Head
      </text>
      <Arrow x1={162} y1={220} x2={204} y2={220} markerId={markerId} />
      {[10, 20, 30].map((value, index) => (
        <g key={value}>
          <NodeCard x={218 + index * 142} y={182} value={String(value)} label="data" />
          {index < 2 ? <Arrow x1={310 + index * 142} y1={220} x2={358 + index * 142} y2={220} markerId={markerId} /> : null}
        </g>
      ))}
      <Arrow x1={594} y1={220} x2={638} y2={220} markerId={markerId} />
      <text x="650" y="226" fill="var(--viz-edge)" className="text-[17px] font-bold">
        null
      </text>
      <text x="380" y="303" textAnchor="middle" fill="var(--viz-edge)" className="text-[13px] font-semibold">
        Each node stores data and a link to the next node
      </text>
    </g>
  );
}

function TreeDiagram({ markerId, shadowId }: { markerId: string; shadowId: string }) {
  return (
    <g filter={`url(#${shadowId})`}>
      <Panel x={96} y={118} width={568} height={232} label="Hierarchical structure" />
      <CircleNode x={380} y={164} text="8" active />
      <CircleNode x={270} y={244} text="3" />
      <CircleNode x={490} y={244} text="10" />
      <CircleNode x={212} y={310} text="1" />
      <CircleNode x={326} y={310} text="6" />
      <Arrow x1={358} y1={182} x2={294} y2={222} markerId={markerId} />
      <Arrow x1={402} y1={182} x2={466} y2={222} markerId={markerId} />
      <Arrow x1={258} y1={263} x2={224} y2={290} markerId={markerId} />
      <Arrow x1={282} y1={263} x2={314} y2={290} markerId={markerId} />
    </g>
  );
}

function GraphDiagram({ mode, markerId, shadowId }: { mode: "BFS" | "DFS"; markerId: string; shadowId: string }) {
  return (
    <g filter={`url(#${shadowId})`}>
      <Panel x={84} y={122} width={592} height={228} label={`${mode} traversal`} />
      <GraphEdge x1={238} y1={178} x2={368} y2={158} markerId={markerId} />
      <GraphEdge x1={238} y1={178} x2={298} y2={284} markerId={markerId} />
      <GraphEdge x1={368} y1={158} x2={506} y2={212} markerId={markerId} />
      <GraphEdge x1={298} y1={284} x2={462} y2={292} markerId={markerId} />
      <GraphEdge x1={462} y1={292} x2={506} y2={212} markerId={markerId} />
      <CircleNode x={238} y={178} text="A" active />
      <CircleNode x={368} y={158} text="B" />
      <CircleNode x={506} y={212} text="C" />
      <CircleNode x={298} y={284} text="D" />
      <CircleNode x={462} y={292} text="E" />
    </g>
  );
}

function SearchDiagram({ isBinary, markerId, shadowId }: { isBinary: boolean; markerId: string; shadowId: string }) {
  const values = isBinary ? [1, 3, 5, 7, 9] : [7, 3, 9, 5];
  return (
    <g filter={`url(#${shadowId})`}>
      <Panel x={76} y={128} width={608} height={204} label={isBinary ? "Sorted array search" : "Sequential scan"} />
      {values.map((value, index) => (
        <Box key={value} x={178 + index * 82} y={194} width={66} height={64} text={String(value)} active={(isBinary && value === 9) || (!isBinary && value === 9)} />
      ))}
      <text x="116" y="178" fill="var(--viz-text)" className="text-[18px] font-bold">
        Target = 9
      </text>
      {isBinary ? (
        <>
          <Label x={330} y={288} text="mid" />
          <Arrow x1={354} y1={280} x2={354} y2={260} markerId={markerId} />
          <Label x={498} y={288} text="found" />
          <Arrow x1={526} y1={280} x2={526} y2={260} markerId={markerId} />
        </>
      ) : (
        <>
          <Arrow x1={176} y1={172} x2={434} y2={172} markerId={markerId} />
          <text x="304" y="160" textAnchor="middle" fill="var(--viz-edge)" className="text-[13px] font-semibold">
            compare one by one
          </text>
        </>
      )}
      <text x="380" y="306" textAnchor="middle" fill="var(--viz-edge)" className="text-[13px] font-semibold">
        {isBinary ? "Discard half of the sorted range after each comparison" : "Return the first index where the target appears"}
      </text>
    </g>
  );
}

function SortingDiagram({ title, markerId, shadowId }: { title: string; markerId: string; shadowId: string }) {
  return (
    <g filter={`url(#${shadowId})`}>
      <Panel x={74} y={122} width={612} height={228} label={title} />
      <text x="132" y="178" fill="var(--viz-text)" className="text-[17px] font-bold">
        Before
      </text>
      {[5, 1, 4].map((value, index) => (
        <Box key={`before-${value}`} x={210 + index * 78} y={152} width={64} height={58} text={String(value)} active={index < 2} />
      ))}
      <Arrow x1={436} y1={182} x2={514} y2={182} markerId={markerId} />
      <text x="475" y="170" textAnchor="middle" fill="var(--viz-edge)" className="text-[12px] font-semibold">
        reorder
      </text>
      <text x="132" y="275" fill="var(--viz-text)" className="text-[17px] font-bold">
        After
      </text>
      {[1, 4, 5].map((value, index) => (
        <Box key={`after-${value}`} x={210 + index * 78} y={248} width={64} height={58} text={String(value)} />
      ))}
    </g>
  );
}

function ArrayDiagram({ markerId, shadowId }: { markerId: string; shadowId: string }) {
  return (
    <g filter={`url(#${shadowId})`}>
      <Panel x={80} y={136} width={600} height={194} label="Indexed collection" />
      {[4, 8, 2, 6].map((value, index) => (
        <g key={value}>
          <Box x={218 + index * 82} y={190} width={66} height={64} text={String(value)} active={index === 0} />
          <text x={251 + index * 82} y="276" textAnchor="middle" fill="var(--viz-edge)" className="text-[12px] font-semibold">
            {index}
          </text>
        </g>
      ))}
      <Arrow x1={156} y1={222} x2={216} y2={222} markerId={markerId} />
      <text x="116" y="226" fill="var(--viz-text)" className="text-[16px] font-bold">
        scan
      </text>
      <text x="380" y="306" textAnchor="middle" fill="var(--viz-edge)" className="text-[13px] font-semibold">
        Use indexes to read, update, and move through values
      </text>
    </g>
  );
}

function Panel({ x, y, width, height, label }: { x: number; y: number; width: number; height: number; label: string }) {
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} rx="24" fill="var(--viz-surface)" stroke="var(--border)" opacity="0.94" />
      <text x={x + 22} y={y + 30} fill="var(--viz-success-text)" className="text-[12px] font-bold uppercase tracking-[0.14em]">
        {label}
      </text>
    </g>
  );
}

function Stack({ x, y, values, ghostTop }: { x: number; y: number; values: string[]; ghostTop?: string }) {
  const valueStartY = y + 6 + (ghostTop ? 42 : 0);

  return (
    <g>
      <line x1={x} y1={y} x2={x} y2={y + 136} stroke="var(--viz-success-text)" strokeWidth="2" opacity="0.62" />
      <line x1={x + 96} y1={y} x2={x + 96} y2={y + 136} stroke="var(--viz-success-text)" strokeWidth="2" opacity="0.62" />
      <line x1={x} y1={y + 136} x2={x + 96} y2={y + 136} stroke="var(--viz-success-text)" strokeWidth="2" opacity="0.62" />
      {ghostTop ? <Box x={x + 8} y={y + 6} width={80} height={42} text={ghostTop} muted /> : null}
      {values.map((value, index) => (
        <Box key={`${value}-${index}`} x={x + 8} y={valueStartY + index * 42} width={80} height={42} text={value} />
      ))}
    </g>
  );
}

function NodeCard({ x, y, value, label }: { x: number; y: number; value: string; label: string }) {
  return (
    <g>
      <rect x={x} y={y} width="92" height="76" rx="16" fill="var(--viz-node)" stroke="var(--border)" />
      <text x={x + 46} y={y + 35} textAnchor="middle" fill="var(--viz-text)" className="text-[20px] font-bold">
        {value}
      </text>
      <text x={x + 46} y={y + 57} textAnchor="middle" fill="var(--viz-edge)" className="text-[11px] font-semibold">
        {label} | next
      </text>
    </g>
  );
}

function CircleNode({ x, y, text, active = false }: { x: number; y: number; text: string; active?: boolean }) {
  return (
    <g>
      <circle cx={x} cy={y} r="30" fill={active ? "var(--viz-active)" : "var(--viz-node)"} stroke="var(--viz-text)" strokeWidth={active ? 2.2 : 1.4} />
      <text x={x} y={y + 6} textAnchor="middle" fill="var(--viz-text)" className="text-[18px] font-bold">
        {text}
      </text>
    </g>
  );
}

function Box({
  x,
  y,
  text,
  width = 62,
  height = 54,
  active = false,
  muted = false,
}: {
  x: number;
  y: number;
  text: string;
  width?: number;
  height?: number;
  active?: boolean;
  muted?: boolean;
}) {
  return (
    <g opacity={muted ? 0.45 : 1}>
      <rect x={x} y={y} width={width} height={height} rx="8" fill={active ? "var(--viz-active)" : "var(--viz-node)"} stroke="var(--viz-text)" strokeWidth={active ? 2 : 1.2} />
      <text x={x + width / 2} y={y + height / 2 + 7} textAnchor="middle" fill="var(--viz-text)" className="text-[22px] font-bold">
        {text}
      </text>
    </g>
  );
}

function Label({ x, y, text }: { x: number; y: number; text: string }) {
  return (
    <text x={x} y={y} fill="var(--viz-text)" className="text-[18px] font-bold">
      {text}
    </text>
  );
}

function Arrow({ x1, y1, x2, y2, markerId, curved = false }: { x1: number; y1: number; x2: number; y2: number; markerId: string; curved?: boolean }) {
  if (curved) {
    const midX = (x1 + x2) / 2;
    const controlY = Math.min(y1, y2) - 44;
    return <path d={`M ${x1} ${y1} Q ${midX} ${controlY} ${x2} ${y2}`} fill="none" stroke="var(--viz-edge)" strokeWidth="3" strokeLinecap="round" markerEnd={`url(#${markerId})`} />;
  }

  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--viz-edge)" strokeWidth="3" strokeLinecap="round" markerEnd={`url(#${markerId})`} />;
}

function GraphEdge({ x1, y1, x2, y2, markerId }: { x1: number; y1: number; x2: number; y2: number; markerId: string }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--viz-edge)" strokeWidth="2.5" strokeLinecap="round" markerEnd={`url(#${markerId})`} opacity="0.78" />;
}

function Caption({ text }: { text: string }) {
  return (
    <g>
      <rect x="76" y="360" width="608" height="38" rx="14" fill="var(--viz-surface)" stroke="var(--border)" />
      <text x="380" y="384" textAnchor="middle" fill="var(--viz-text)" className="text-[13px] font-semibold">
        {text}
      </text>
    </g>
  );
}

function conceptCaption(definition: AnimationDefinition) {
  const title = definition.title.toLowerCase();
  if (definition.category === "stack") return "Stack follows LIFO: last in, first out.";
  if (definition.category === "queue") return "Queue follows FIFO: first in, first out.";
  if (definition.category === "linked-list") return "Follow next pointers from head until null.";
  if (definition.category === "tree") return "A tree starts at one root and branches into children.";
  if (definition.category === "graph") return title.includes("breadth") ? "Use a queue to explore graph nodes level by level." : "Use recursion or a stack to go deep before backtracking.";
  if (definition.category === "search") return title.includes("binary") ? "Binary search works only on sorted data." : "Linear search checks values from left to right.";
  if (definition.category === "sorting") return "Sorting repeatedly compares and reorders values.";
  return "An array stores values by index in contiguous order.";
}
