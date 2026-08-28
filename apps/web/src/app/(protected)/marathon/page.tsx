import { PageHeader } from "@/components/layout/page-header";
import { MarathonWorkspace } from "@/components/marathon/marathon-workspace";

export default function MarathonPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Coding Marathon"
        description="Ask AI for a fresh DSA challenge, solve it in the compiler, and verify every sample without leaving the workspace."
        eyebrow="AI problem setter + code executor"
      />
      <MarathonWorkspace />
    </div>
  );
}
