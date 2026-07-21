import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { documents } from "@/content/media";
import { FileText } from "lucide-react";
import { isPageEnabled } from "@/content/pages";
import { getPageHeader } from "@/content/pageContent";

const header = getPageHeader("certificados");

export const Route = createFileRoute("/certificados")({
  beforeLoad: () => {
    if (!isPageEnabled("certificados")) throw notFound();
  },
  head: () => ({
    meta: [
      { title: "Certificados — Luciani Heindrickson da Silva" },
      {
        name: "description",
        content:
          "Biblioteca documental de certificados, diplomas e declarações da autora — comprovações para editais culturais.",
      },
      { property: "og:title", content: "Certificados — Luciani Heindrickson da Silva" },
      {
        property: "og:description",
        content: "Certificados, diplomas e declarações para comprovação em editais.",
      },
    ],
  }),
  component: Certificados,
});

function Certificados() {
  return (
    <>
      <PageHeader kicker={header.kicker} title={header.title} lead={header.lead} />

      <section className="mx-auto max-w-5xl px-6 pb-24 grid gap-6 sm:grid-cols-2">
        {documents.map((d) => (
          <article key={d.file} className="flex gap-5 border border-border/70 bg-background p-5">
            <div className="shrink-0 grid h-24 w-20 place-items-center border border-border bg-sand/60 text-clay">
              <FileText size={28} strokeWidth={1.5} />
            </div>
            <div className="min-w-0 flex-1 flex flex-col">
              <h3 className="font-display text-lg leading-tight">{d.title}</h3>
              <div className="mt-1 font-serif italic text-sm text-muted-foreground">
                {d.institution} · {d.year}
              </div>
              <div className="mt-auto pt-4 flex flex-wrap gap-4 text-sm">
                <a
                  className="font-serif italic text-cocoa hover:text-coffee"
                  href={d.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Visualizar →
                </a>
                <a className="font-serif italic text-cocoa hover:text-coffee" href={d.url} download>
                  Download ↓
                </a>
              </div>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
