import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { competencies } from "@/content/competencies";

export const Route = createFileRoute("/competencias")({
  head: () => ({
    meta: [
      { title: "Competências — Luciani Heindrickson" },
      {
        name: "description",
        content:
          "Competências técnicas e culturais da autora: pesquisa, história oral, escrita, produção editorial e mediação cultural.",
      },
      { property: "og:title", content: "Competências — Luciani Heindrickson" },
      {
        property: "og:description",
        content: "Capacidades técnicas e culturais para execução de projetos.",
      },
    ],
  }),
  component: Competencias,
});

function Competencias() {
  return (
    <>
      <PageHeader
        kicker="Capacidades Técnicas"
        title="Competências"
        lead="Um conjunto de saberes desenvolvidos entre a universidade, a escrita e a produção cultural na fronteira."
      />
      <section className="mx-auto max-w-6xl px-6 pb-24 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {competencies.map((c, i) => (
          <article
            key={c.title}
            className="border border-border/70 bg-background p-6 flex flex-col"
          >
            <div className="flex items-baseline gap-3">
              <span className="font-display text-2xl text-clay">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="font-display text-xl leading-tight">{c.title}</h3>
            </div>
            <p className="mt-4 font-serif text-sm leading-relaxed text-foreground/85">
              {c.description}
            </p>
          </article>
        ))}
      </section>
    </>
  );
}