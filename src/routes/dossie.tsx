import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { indicators, site } from "@/content/site";
import { timeline } from "@/content/timeline";
import { books, bookCategoryLabel } from "@/content/books";
import { projects } from "@/content/projects";
import { documents } from "@/content/media";
import { competencies } from "@/content/competencies";
import { Printer } from "lucide-react";

export const Route = createFileRoute("/dossie")({
  head: () => ({
    meta: [
      { title: "Dossiê para Editais — Luciani Heindrickson da Silva" },
      {
        name: "description",
        content:
          "Dossiê institucional consolidado para editais públicos de cultura — trajetória, produção, projetos, certificados e competências.",
      },
      { property: "og:title", content: "Dossiê para Editais — Luciani Heindrickson da Silva" },
      {
        property: "og:description",
        content: "Documento único de apresentação institucional para editais de fomento à cultura.",
      },
    ],
  }),
  component: Dossie,
});

function Dossie() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="no-print flex flex-wrap justify-between items-center gap-4 mb-10">
        <Link to="/" className="font-serif italic text-cocoa">
          ← Início
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 border border-coffee bg-coffee text-paper px-5 py-3 font-serif text-sm tracking-widest uppercase hover:bg-cocoa"
        >
          <Printer size={16} /> Gerar portfólio em PDF
        </button>
      </div>

      <header className="text-center border-y border-cocoa/40 py-10">
        <div className="font-serif italic text-xs tracking-[0.3em] uppercase text-clay">
          Portfólio Institucional
        </div>
        <h1 className="mt-4 font-display text-5xl md:text-6xl">{site.author}</h1>
        <div className="mt-3 font-serif italic text-muted-foreground">{site.role}</div>
        <div className="mt-2 text-sm text-muted-foreground">
          {site.city} · {site.email} · {site.phone}
        </div>
      </header>

      <Section title="1. Resumo da trajetória">
        <p className="drop-cap font-serif text-lg leading-relaxed">{site.presentation}</p>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {indicators.map((it) => (
            <div key={it.label} className="border border-border p-4 text-center">
              <div className="font-display text-3xl text-coffee">{it.value}</div>
              <div className="mt-1 font-serif italic text-xs uppercase tracking-widest text-muted-foreground">
                {it.label}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="2. Produção literária">
        <ul className="divide-y divide-border/70 border-y border-border/70">
          {books.map((b) => (
            <li key={b.title} className="py-4">
              <div className="flex justify-between gap-4 flex-wrap">
                <div>
                  <div className="font-display text-lg">{b.title}</div>
                  <div className="font-serif italic text-sm text-muted-foreground">
                    {bookCategoryLabel[b.category]} · {b.year} · {b.status}
                  </div>
                </div>
              </div>
              <p className="mt-2 font-serif text-sm text-foreground/85">{b.synopsis}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="3. Projetos culturais">
        <ul className="space-y-6">
          {projects.map((p) => (
            <li key={p.slug}>
              <div className="font-display text-xl">
                {p.year} · {p.title}
              </div>
              {p.subtitle && (
                <div className="font-serif italic text-sm text-muted-foreground">{p.subtitle}</div>
              )}
              <p className="mt-2 font-serif text-sm text-foreground/85">{p.summary}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="4. Eventos e participações">
        <ul className="divide-y divide-border/70">
          {timeline.map((t) => (
            <li key={t.year + t.title} className="py-3 grid grid-cols-[70px_1fr] gap-4">
              <div className="font-display text-lg text-clay">{t.year}</div>
              <div>
                <div className="font-display">{t.title}</div>
                <div className="font-serif italic text-sm text-muted-foreground">
                  {[t.institution, t.city].filter(Boolean).join(" · ")}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="5. Certificados e comprovações">
        <ul className="divide-y divide-border/70 border-y border-border/70">
          {documents.map((d) => (
            <li key={d.file} className="py-3 flex flex-wrap justify-between gap-2">
              <span className="font-display">{d.title}</span>
              <span className="font-serif italic text-sm text-muted-foreground">
                {d.institution} · {d.year}
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="6. Competências">
        <ul className="grid gap-3 sm:grid-cols-2">
          {competencies.map((c) => (
            <li key={c.title} className="border border-border p-4">
              <div className="font-display">{c.title}</div>
              <div className="font-serif italic text-xs text-muted-foreground mt-1">
                {c.description}
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="7. Currículo condensado">
        <p className="font-serif leading-relaxed">
          Formada em Letras Português/Espanhol pela UNIOESTE, com mestrado em Letras. Atua há mais
          de uma década na articulação entre escrita autoral, pesquisa da memória local e produção
          cultural, tendo organizado seminários, feiras do livro, oficinas de escrita e coletâneas
          literárias voltadas à valorização das narrativas femininas e do patrimônio da tríplice
          fronteira.
        </p>
      </Section>

      <footer className="mt-16 pt-8 border-t border-border text-center font-serif italic text-sm text-muted-foreground">
        Dossiê gerado a partir do portfólio digital de {site.author}. Documento institucional para
        editais públicos de fomento à cultura.
      </footer>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-14">
      <h2 className="font-display text-3xl border-b border-cocoa/40 pb-2">{title}</h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}
