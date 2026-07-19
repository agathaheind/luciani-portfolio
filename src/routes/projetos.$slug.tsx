import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { projectsBySlug } from "@/content/projects";
import { photosByPrefix, documentsByPrefix } from "@/content/media";
import { useState, type ReactNode } from "react";

export const Route = createFileRoute("/projetos/$slug")({
  loader: ({ params }) => {
    const project = projectsBySlug[params.slug];
    if (!project) throw notFound();
    return { project };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.project.title} — Projeto Cultural` },
          { name: "description", content: loaderData.project.summary },
          { property: "og:title", content: loaderData.project.title },
          { property: "og:description", content: loaderData.project.summary },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
      <h1 className="font-display text-4xl">Projeto não encontrado</h1>
      <p className="mt-4 font-serif italic text-muted-foreground">
        O projeto solicitado não existe ou foi movido.
      </p>
      <Link to="/projetos" className="mt-6 inline-block font-serif italic text-cocoa underline">
        ← Voltar aos projetos
      </Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
      <h1 className="font-display text-3xl">Não foi possível carregar</h1>
      <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
    </div>
  ),
  component: ProjectDetail,
});

type Tab = "contexto" | "galeria" | "documentos";

function ProjectDetail() {
  const { project } = Route.useLoaderData();
  const [tab, setTab] = useState<Tab>("contexto");
  const photos = photosByPrefix(project.photoPrefix);
  const docs = documentsByPrefix(project.documentPrefix);

  return (
    <>
      <PageHeader
        kicker={`Projeto · ${project.year}`}
        title={project.title}
        lead={project.subtitle}
      />

      <div className="mx-auto max-w-4xl px-6">
        <div className="flex flex-wrap justify-center gap-2 border-y border-border/70 py-3">
          {(
            [
              ["contexto", "Contexto & Resultados"],
              ["galeria", `Galeria (${photos.length})`],
              ["documentos", `Documentos (${docs.length})`],
            ] as [Tab, string][]
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`px-4 py-2 font-serif text-sm tracking-wide transition-colors ${
                tab === id ? "bg-coffee text-paper" : "text-muted-foreground hover:text-cocoa"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <section className="mx-auto max-w-3xl px-6 py-16">
        {tab === "contexto" && (
          <div className="space-y-12 font-serif text-lg leading-relaxed text-foreground/90">
            <Block title="Contexto">
              <p>{project.context}</p>
            </Block>
            <Block title="Objetivos">
              <List items={project.objectives} />
            </Block>
            <Block title="Atividades">
              <List items={project.activities} />
            </Block>
            <Block title="Resultados">
              <List items={project.results} />
            </Block>
          </div>
        )}
        {tab === "galeria" && (
          <div>
            {photos.length === 0 ? (
              <EmptyState label="Fotografias em breve — as imagens deste projeto serão adicionadas conforme envio." />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {photos.map((p) => (
                  <figure key={p.file} className="bg-sand/50 p-2">
                    <img
                      src={p.url}
                      alt={p.caption ?? p.file}
                      loading="lazy"
                      className="w-full h-72 object-cover"
                    />
                    {p.caption && (
                      <figcaption className="mt-2 px-2 pb-1 font-serif italic text-sm text-muted-foreground">
                        {p.caption}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            )}
          </div>
        )}
        {tab === "documentos" && (
          <div>
            {docs.length === 0 ? (
              <EmptyState label="Documentos em breve — certificados e comprovações serão anexados aqui." />
            ) : (
              <ul className="divide-y divide-border/70 border border-border/70 bg-background">
                {docs.map((d) => (
                  <li
                    key={d.file}
                    className="flex flex-wrap items-center justify-between gap-3 p-5"
                  >
                    <div>
                      <div className="font-display text-lg">{d.title}</div>
                      <div className="font-serif italic text-sm text-muted-foreground">
                        {d.institution} · {d.year}
                      </div>
                    </div>
                    <a
                      className="font-serif italic text-cocoa hover:text-coffee text-sm"
                      href={d.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Visualizar →
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="mt-16 text-center">
          <Link to="/projetos" className="font-serif italic text-cocoa hover:text-coffee">
            ← Voltar aos projetos
          </Link>
        </div>
      </section>
    </>
  );
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <div className="rule-ornament">{title}</div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="list-none space-y-2">
      {items.map((it) => (
        <li key={it} className="pl-6 relative">
          <span className="absolute left-0 top-3 h-1.5 w-1.5 rounded-full bg-clay" />
          {it}
        </li>
      ))}
    </ul>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="border border-dashed border-border/70 bg-sand/30 p-10 text-center font-serif italic text-muted-foreground">
      {label}
    </div>
  );
}
