"use client";

import { Check, Clipboard, Download, Maximize2, Minimize2 } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";

type ProfessionalCodeBlockProps = {
  code: string;
  language: string;
  filename?: string;
};

export function ProfessionalCodeBlock({ code, language, filename = `example.${language}` }: ProfessionalCodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const lines = useMemo(() => code.split("\n"), [code]);
  const lineCount = lines.length;

  async function copyCode() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  function downloadCode() {
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <figure className="overflow-hidden rounded-2xl border border-border bg-[#111827] text-slate-100">
      <div className="flex items-center justify-between border-b border-slate-700 bg-slate-800 px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="rounded bg-primary px-2 py-1 text-xs font-medium uppercase text-primary-foreground">
            {language}
          </span>
          <figcaption className="truncate text-sm text-slate-300">
            {filename} / {lineCount} lines
          </figcaption>
        </div>
        <div className="flex items-center gap-1">
          <Button type="button" variant="ghost" size="icon" onClick={copyCode} title="Copy code">
            {copied ? <Check aria-hidden={true} size={16} /> : <Clipboard aria-hidden={true} size={16} />}
          </Button>
          <Button type="button" variant="ghost" size="icon" onClick={downloadCode} title="Download code">
            <Download aria-hidden={true} size={16} />
          </Button>
          <Button type="button" variant="ghost" size="icon" onClick={() => setExpanded((value) => !value)} title="Expand code">
            {expanded ? <Minimize2 aria-hidden={true} size={16} /> : <Maximize2 aria-hidden={true} size={16} />}
          </Button>
        </div>
      </div>
      <div className={expanded ? "max-h-none overflow-auto" : "max-h-96 overflow-auto"}>
        <pre className="m-0 min-w-full p-4 text-[13px] leading-6">
          <code>
            {lines.map((line, index) => (
              <span key={`${filename}-line-${index}`} className="grid grid-cols-[2.75rem_1fr] gap-3">
                <span className="select-none text-right text-slate-500">{index + 1}</span>
                <span className="whitespace-pre text-slate-100">{line || " "}</span>
              </span>
            ))}
          </code>
        </pre>
      </div>
    </figure>
  );
}
