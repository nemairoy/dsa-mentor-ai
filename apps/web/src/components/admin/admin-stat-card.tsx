export function AdminStatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <section className="rounded-lg border border-border bg-card p-3">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1.5 text-lg font-semibold">{value}</p>
    </section>
  );
}
