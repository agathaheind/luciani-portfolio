import type { ReactNode } from "react";

export function PageHeader({
  kicker,
  title,
  lead,
  children,
}: {
  kicker: string;
  title: string;
  lead?: string;
  children?: ReactNode;
}) {
  return (
    <header className="mx-auto max-w-5xl px-6 pt-24 pb-12 text-center">
      <span className="rule-ornament">{kicker}</span>
      <h1 className="mt-6 font-display text-5xl md:text-6xl leading-[1.02]">{title}</h1>
      {lead && (
        <p className="mx-auto mt-6 max-w-2xl font-serif italic text-lg text-muted-foreground">
          {lead}
        </p>
      )}
      {children}
    </header>
  );
}
