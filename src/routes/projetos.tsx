import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { projects } from "@/content/projects";

export const Route = createFileRoute("/projetos")({
  head: () => ({
    meta: [
      { title: "Projetos Culturais — Luciani Heindrickson da Silva" },
      {
        name: "description",
        content:
          "Projetos culturais concebidos, coordenados e executados pela autora — literatura, memória e patrimônio.",
      },
      { property: "og:title", content: "Projetos Culturais — Luciani Heindrickson da Silva" },
      {
        property: "og:description",
        content:
          "Projetos culturais em literatura, memória e patrimônio, com resultados e documentos.",
      },
    ],
  }),
  component: Projetos,
});

function Projetos() {
  return (
    <>
      <PageHeader
        kicker="Capítulo IV · Realizações"
        title="Projetos culturais"
        lead="Iniciativas em literatura, memória e patrimônio — cada projeto reúne contexto, atividades, resultados e documentos."
      />
      <section className="mx-auto max-w-5xl px-6 pb-24 space-y-8">
        {projects.map((p) => (
          <Link
            key={p.slug}
            to="/projetos/$slug"
            params={{ slug: p.slug }}
            className="group grid gap-8 md:grid-cols-[220px_1fr] items-start border border-border/70 bg-background p-8 transition-shadow hover:shadow-[var(--shadow-book)]"
          >
            <div
              className="aspect-[4/5] w-full relative overflow-hidden"
              style={{
                background: "linear-gradient(160deg, var(--sand), var(--clay) 70%, var(--cocoa))",
              }}
            >
              <div className="absolute inset-4 border border-paper/40" />
              <div className="absolute inset-0 flex flex-col justify-end p-5">
                <div className="font-display text-4xl text-paper">{p.year}</div>
                <div className="font-serif italic text-[11px] tracking-[0.22em] uppercase text-paper/85">
                  Projeto
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-display text-3xl leading-tight">{p.title}</h3>
              {p.subtitle && (
                <div className="mt-1 font-serif italic text-muted-foreground">{p.subtitle}</div>
              )}
              <p className="mt-4 font-serif text-base leading-relaxed text-foreground/90">
                {p.summary}
              </p>
              <span className="mt-5 inline-block font-serif italic text-cocoa group-hover:text-coffee">
                Abrir dossiê do projeto →
              </span>
            </div>
          </Link>
        ))}
      </section>
    </>
  );
}
