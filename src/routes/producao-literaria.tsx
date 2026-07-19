import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { books, bookCategoryLabel } from "@/content/books";

export const Route = createFileRoute("/producao-literaria")({
  head: () => ({
    meta: [
      { title: "Produção Literária — Luciani Heindrickson" },
      {
        name: "description",
        content:
          "Estante virtual da autora — livros, antologias, crônicas, poesia, artigos e capítulos publicados.",
      },
      { property: "og:title", content: "Produção Literária — Luciani Heindrickson" },
      {
        property: "og:description",
        content: "Estante literária e publicações da autora.",
      },
    ],
  }),
  component: Producao,
});

function Producao() {
  return (
    <>
      <PageHeader
        kicker="Capítulo III · Estante"
        title="Produção literária"
        lead="A estante da autora — livros, antologias, crônicas, poesia, artigos e capítulos."
      />
      <section className="mx-auto max-w-6xl px-6 pb-24 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {books.map((b) => (
          <article
            key={b.title}
            className="group flex flex-col border border-border/70 bg-background transition-shadow hover:shadow-[var(--shadow-book)]"
          >
            <div
              className="aspect-[3/4] w-full relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, var(--cocoa), var(--coffee) 60%, var(--ink))",
              }}
            >
              <div className="absolute inset-6 border border-paper/30" />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                <div className="font-serif italic text-[11px] tracking-[0.25em] uppercase text-sand/80">
                  {bookCategoryLabel[b.category]}
                </div>
                <div className="mt-4 font-display text-2xl leading-tight text-paper">{b.title}</div>
                <div className="mt-6 h-px w-10 bg-sand/60" />
                <div className="mt-4 font-serif italic text-sand/80 text-sm">{b.year}</div>
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex items-center justify-between text-xs tracking-widest uppercase text-muted-foreground">
                <span>{bookCategoryLabel[b.category]}</span>
                <span>{b.status}</span>
              </div>
              <h3 className="mt-3 font-display text-xl leading-snug">{b.title}</h3>
              <p className="mt-3 font-serif text-sm leading-relaxed text-foreground/85 flex-1">
                {b.synopsis}
              </p>
              {b.link && (
                <a
                  href={b.link}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 font-serif italic text-sm text-cocoa hover:text-coffee"
                >
                  Acessar publicação →
                </a>
              )}
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
