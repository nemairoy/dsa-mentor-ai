"use client";

import { RefreshCw } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export function RagManagementPanel() {
  const [status, setStatus] = useState<string>("");

  async function call(endpoint: string) {
    setStatus("Running...");
    const response = await fetch(endpoint, { method: endpoint.endsWith("status") ? "GET" : "POST" });
    setStatus(JSON.stringify(await response.json()));
  }

  return (
    <section className="rounded-lg border border-border bg-card p-3.5">
      <h2 className="font-semibold">RAG and Search Management</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => call("/api/admin/rag/status")}>
          Status
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => call("/api/admin/rag/incremental")}>
          <RefreshCw aria-hidden="true" size={16} />
          Incremental Index
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => call("/api/admin/rag/rebuild")}>
          Rebuild Knowledge Base
        </Button>
      </div>
      {status ? <pre className="mt-4 whitespace-pre-wrap rounded-md bg-muted p-3 text-sm">{status}</pre> : null}
    </section>
  );
}
