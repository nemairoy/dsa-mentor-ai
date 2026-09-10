"use client";

import dynamic from "next/dynamic";

export type CodeEditorLanguage = "python" | "java" | "cpp";

export type SmartCodeEditorProps = {
  id?: string;
  value: string;
  language: CodeEditorLanguage;
  onChange: (value: string) => void;
  disabled?: boolean;
  ariaLabel?: string;
  placeholder?: string;
  minHeight?: string;
};

const CodeMirrorEditor = dynamic(
  () => import("@/components/code-editor/code-mirror-editor").then((module) => module.CodeMirrorEditor),
  {
    ssr: false,
    loading: () => <div className="min-h-[360px] animate-pulse rounded-xl border border-border bg-[#0b1220]" aria-hidden="true" />,
  },
);

export function SmartCodeEditor(props: SmartCodeEditorProps) {
  return <CodeMirrorEditor {...props} />;
}
