import { Bot, FileText, HelpCircle, MessageSquare, Network } from "lucide-react";

const tools = [
  { label: "AI Explain", icon: Bot },
  { label: "AI Chat", icon: MessageSquare },
  { label: "AI Quiz", icon: HelpCircle },
  { label: "AI Summary", icon: FileText },
  { label: "Interactive Visualization", icon: Network },
];

export function DisabledAiTools() {
  return (
    <section className="rounded-lg border border-border bg-card p-3.5" aria-label="Future AI learning tools">
      <h2 className="text-sm font-semibold uppercase text-muted-foreground">Coming Later</h2>
      <div className="mt-4 grid gap-2">
        {tools.map((tool) => {
          const Icon = tool.icon;

          return (
            <button
              key={tool.label}
              type="button"
              disabled
              className="flex h-9 items-center gap-2 rounded-md border border-border px-3 text-left text-xs text-muted-foreground opacity-80"
            >
              <Icon aria-hidden="true" size={16} />
              {tool.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
