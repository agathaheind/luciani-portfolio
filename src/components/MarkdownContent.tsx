import ReactMarkdown from "react-markdown";
import type { ReactNode } from "react";

export function MarkdownContent({ children }: { children: string }) {
  return (
    <ReactMarkdown
      components={{
        strong: ({ children }: { children?: ReactNode }) => (
          <strong className="font-medium">{children}</strong>
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
