"use client";

import { cpp } from "@codemirror/lang-cpp";
import { java } from "@codemirror/lang-java";
import { python } from "@codemirror/lang-python";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";

import type { CodeEditorLanguage, SmartCodeEditorProps } from "@/components/code-editor/smart-code-editor";

const languageExtensions = {
  python: python(),
  java: java(),
  cpp: cpp(),
} satisfies Record<CodeEditorLanguage, ReturnType<typeof python>>;

const editorTheme = EditorView.theme({
  "&": {
    backgroundColor: "#0b1220",
    color: "#e2e8f0",
    fontSize: "13px",
  },
  "&.cm-focused": {
    outline: "2px solid rgb(16 185 129)",
    outlineOffset: "-1px",
  },
  ".cm-scroller": {
    fontFamily: "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    lineHeight: "1.5rem",
    overflow: "auto",
  },
  ".cm-content": {
    caretColor: "#34d399",
    padding: "0.75rem 0",
  },
  ".cm-cursor, .cm-dropCursor": { borderLeftColor: "#34d399" },
  ".cm-gutters": {
    backgroundColor: "#0f172a",
    borderRight: "1px solid #334155",
    color: "#64748b",
  },
  ".cm-activeLine, .cm-activeLineGutter": { backgroundColor: "#172033" },
  ".cm-selectionBackground, &.cm-focused .cm-selectionBackground, ::selection": { backgroundColor: "#155e75" },
  ".cm-matchingBracket": { backgroundColor: "#065f46", outline: "1px solid #34d399" },
  ".cm-tooltip": { border: "1px solid #334155", backgroundColor: "#111827", color: "#e2e8f0" },
  ".cm-tooltip-autocomplete > ul > li[aria-selected]": { backgroundColor: "#065f46", color: "white" },
});

export function CodeMirrorEditor({
  id,
  value,
  language,
  onChange,
  disabled = false,
  ariaLabel = "Code editor",
  placeholder = "Write your code here…",
  minHeight = "360px",
}: SmartCodeEditorProps) {
  return (
    <div
      id={id}
      className={`overflow-hidden rounded-xl border border-slate-700 bg-[#0b1220] ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
      style={{ minHeight }}
    >
      <CodeMirror
        value={value}
        onChange={onChange}
        extensions={[
          languageExtensions[language],
          editorTheme,
          EditorView.contentAttributes.of({ "aria-label": ariaLabel, "aria-multiline": "true" }),
        ]}
        theme="dark"
        minHeight={minHeight}
        placeholder={placeholder}
        readOnly={disabled}
        editable={!disabled}
        indentWithTab
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          highlightActiveLine: true,
          highlightActiveLineGutter: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          history: true,
          indentOnInput: true,
          syntaxHighlighting: true,
          searchKeymap: true,
          foldKeymap: true,
          completionKeymap: true,
        }}
      />
    </div>
  );
}
