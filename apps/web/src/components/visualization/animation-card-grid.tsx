import Link from "next/link";
import { ImageIcon } from "lucide-react";

import type { AnimationRegistryEntry } from "@/core/visualization/registry/animation-registry";

export function AnimationCardGrid({ animations }: { animations: AnimationRegistryEntry[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {animations.map((animation) => (
        <Link
          key={animation.id}
          href={`/visualizations/${animation.id}`}
          className="rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
              <ImageIcon aria-hidden="true" size={18} />
            </div>
            <div>
              <h2 className="font-semibold">{animation.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">Concept picture</p>
              <p className="mt-3 text-xs uppercase text-muted-foreground">
                {animation.status} / {animation.category}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
