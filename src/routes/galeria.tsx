import { createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { photos, photosByCategory, type Photo } from "@/content/media";
import { isPageEnabled } from "@/content/pages";
import { getPageHeader } from "@/content/pageContent";

const header = getPageHeader("galeria");

export const Route = createFileRoute("/galeria")({
  beforeLoad: () => {
    if (!isPageEnabled("galeria")) throw notFound();
  },
  head: () => ({
    meta: [
      { title: "Galeria — Luciani Heindrickson da Silva" },
      {
        name: "description",
        content:
          "Registro visual da atuação cultural: eventos, palestras, oficinas, comunidade e literatura.",
      },
      { property: "og:title", content: "Galeria — Luciani Heindrickson da Silva" },
      {
        property: "og:description",
        content: "Registro fotográfico da atuação cultural da autora.",
      },
    ],
  }),
  component: Galeria,
});

function Galeria() {
  const grouped = photosByCategory();
  const categories = Object.keys(grouped);
  const [active, setActive] = useState<string>("Todas");
  const [lightbox, setLightbox] = useState<Photo | null>(null);

  const list = active === "Todas" ? photos : (grouped[active as keyof typeof grouped] ?? []);

  return (
    <>
      <PageHeader kicker={header.kicker} title={header.title} lead={header.lead} />

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {["Todas", ...categories].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setActive(c)}
              className={`px-4 py-2 font-serif italic text-sm tracking-wide border transition-colors ${
                active === c
                  ? "bg-coffee text-paper border-coffee"
                  : "border-border/70 text-muted-foreground hover:text-cocoa"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {list.length === 0 ? (
          <div className="border border-dashed border-border/70 bg-sand/30 p-16 text-center font-serif italic text-muted-foreground">
            Fotografias em breve — as imagens serão adicionadas conforme envio.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((p) => (
              <button
                key={p.file}
                type="button"
                onClick={() => setLightbox(p)}
                className="group text-left bg-sand/50 p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-cocoa"
              >
                <img
                  src={p.url}
                  alt={p.caption ?? p.file}
                  loading="lazy"
                  className="w-full h-64 object-cover transition-transform group-hover:scale-[1.01]"
                />
                <div className="mt-2 px-1 pb-1 flex items-center justify-between">
                  <span className="font-serif italic text-sm text-muted-foreground">
                    {p.caption ?? p.file}
                  </span>
                  <span className="text-[10px] tracking-widest uppercase text-clay">
                    {p.category}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-50 bg-ink/90 flex items-center justify-center p-6 cursor-zoom-out"
        >
          <figure className="max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={lightbox.url}
              alt={lightbox.caption ?? lightbox.file}
              className="w-full max-h-[80vh] object-contain bg-paper p-2"
            />
            <figcaption className="mt-3 text-center font-serif italic text-sand">
              {lightbox.caption ?? lightbox.file}
            </figcaption>
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setLightbox(null)}
                className="text-paper/80 underline underline-offset-4 font-serif italic"
              >
                fechar
              </button>
            </div>
          </figure>
        </div>
      )}
    </>
  );
}
