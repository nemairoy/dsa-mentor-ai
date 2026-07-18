import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { ProfessionalCodeBlock } from "@/components/content/professional-code-block";
import { cn } from "@/lib/utils";

type MarkdownContentProps = {
  markdown: string;
};

export function MarkdownContent({ markdown }: MarkdownContentProps) {
  const visibleMarkdown = stripInternalContentNotes(markdown);

  return (
    <article className="prose-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ className, ...props }) => <h1 className={cn("text-lg font-semibold", className)} {...props} />,
          h2: ({ className, ...props }) => <h2 className={cn("mt-6 text-base font-semibold", className)} {...props} />,
          blockquote: ({ className, ...props }) => (
            <blockquote
              className={cn("mt-3 rounded-md border-l-4 border-primary bg-accent p-3 text-xs", className)}
              {...props}
            />
          ),
          table: ({ className, ...props }) => (
            <div className="mt-4 overflow-x-auto">
              <table className={cn("w-full border-collapse text-sm", className)} {...props} />
            </div>
          ),
          th: ({ className, ...props }) => (
            <th className={cn("border border-border bg-muted px-3 py-2 text-left font-semibold", className)} {...props} />
          ),
          td: ({ className, ...props }) => <td className={cn("border border-border px-3 py-2", className)} {...props} />,
          img: ({ className, alt, ...props }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img className={cn("mt-4 rounded-lg border border-border", className)} alt={alt ?? ""} {...props} />
          ),
          p: ({ className, ...props }) => (
            <p className={cn("mt-3 text-sm leading-6 text-foreground", className)} {...props} />
          ),
          ul: ({ className, ...props }) => <ul className={cn("mt-4 list-disc space-y-2 pl-6", className)} {...props} />,
          ol: ({ className, ...props }) => (
            <ol className={cn("mt-4 list-decimal space-y-2 pl-6", className)} {...props} />
          ),
          li: ({ className, ...props }) => <li className={cn("leading-7", className)} {...props} />,
          code: ({ className, children, ...props }) => {
            const language = /language-(\w+)/.exec(className ?? "")?.[1];
            const code = String(children).replace(/\n$/, "");

            if (language) {
              return <ProfessionalCodeBlock code={code} language={language} />;
            }

            return <code className={cn("rounded bg-muted px-1.5 py-0.5 text-sm", className)} {...props}>{children}</code>;
          },
        }}
      >
        {visibleMarkdown}
      </ReactMarkdown>
    </article>
  );
}

function stripInternalContentNotes(markdown: string) {
  return markdown
    .split(/\r?\n/)
    .filter((line) => !line.includes("This lesson is part of the dynamic DSA Mentor AI knowledge base"))
    .join("\n")
    .trim();
}
