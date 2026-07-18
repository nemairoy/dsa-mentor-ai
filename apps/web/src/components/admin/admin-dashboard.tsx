import { AdminStatCard } from "@/components/admin/admin-stat-card";
import type { AdminOverview } from "@/core/admin/domain/admin";

export function AdminDashboard({ overview }: { overview: AdminOverview }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="Users" value={overview.users} />
        <AdminStatCard label="Lessons" value={overview.lessons} />
        <AdminStatCard label="Practice Problems" value={overview.practiceProblems} />
        <AdminStatCard label="AI Usage" value={overview.aiUsage} />
        <AdminStatCard label="Chapters" value={overview.chapters} />
        <AdminStatCard label="Animations" value={overview.animations} />
        <AdminStatCard label="RAG Chunks" value={overview.ragChunks} />
        <AdminStatCard label="Indexed Lessons" value={overview.indexedLessons} />
      </div>
      <section className="rounded-lg border border-border bg-card p-3">
        <h2 className="font-semibold">System Health</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <Status label="PostgreSQL" value="Connected" />
          <Status label="ChromaDB" value={overview.ragChunks ? "Indexed" : "Needs Index"} />
          <Status label="Gemini" value="Configured" />
        </div>
      </section>
      <section className="rounded-lg border border-border bg-card p-3">
        <h2 className="font-semibold">Recent Activity</h2>
        <div className="mt-4 space-y-2">
          {overview.recentActivity.length ? (
            overview.recentActivity.map((item) => (
              <div key={`${item.action}-${item.createdAt}`} className="rounded-md border border-border p-3 text-sm">
                <span className="font-medium">{item.action}</span>
                <span className="ml-2 text-muted-foreground">{item.entityType}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No audit events yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}

function Status({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border p-3">
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}
