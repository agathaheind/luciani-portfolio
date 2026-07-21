import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { timeline } from "@/content/timeline";
import { isPageEnabled } from "@/content/pages";
import { getPageHeader } from "@/content/pageContent";

const header = getPageHeader("trajetoria");

export const Route = createFileRoute("/trajetoria")({
  beforeLoad: () => {
    if (!isPageEnabled("trajetoria")) throw notFound();
  },
  head: () => ({
    meta: [
      { title: "Trajetória Cultural — Luciani Heindrickson da Silva" },
      {
        name: "description",
        content:
          "Linha do tempo comentada da trajetória cultural de Luciani Heindrickson da Silva: formação, publicações, projetos e participações.",
      },
      { property: "og:title", content: "Trajetória Cultural — Luciani Heindrickson da Silva" },
      {
        property: "og:description",
        content: "Cronologia da produção literária e cultural da autora.",
      },
    ],
  }),
  component: Trajetoria,
});

function Trajetoria() {
  return (
    <>
      <PageHeader kicker={header.kicker} title={header.title} lead={header.lead} />
      <section className="mx-auto max-w-4xl px-6 pb-24">
        <ol className="relative border-l border-border/70 pl-8 md:pl-12 space-y-14">
          {timeline.map((item, i) => (
            <li key={i} className="relative">
              <span className="absolute -left-[9px] top-2 h-4 w-4 rounded-full border border-cocoa bg-background" />
              <div className="font-display text-3xl text-clay">{item.year}</div>
              <h3 className="mt-1 font-display text-2xl">{item.title}</h3>
              {(item.institution || item.city) && (
                <div className="mt-1 font-serif italic text-sm text-muted-foreground">
                  {[item.institution, item.city].filter(Boolean).join(" · ")}
                </div>
              )}
              <p className="mt-3 font-serif text-base leading-relaxed text-foreground/90">
                {item.description}
              </p>
              {item.certificate && (
                <div className="mt-3 inline-flex items-center gap-2 text-xs tracking-widest uppercase text-cocoa">
                  <span className="h-px w-6 bg-cocoa" />
                  {item.certificate}
                </div>
              )}
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
