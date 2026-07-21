import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { MarkdownContent } from "@/components/MarkdownContent";
import { isPageEnabled } from "@/content/pages";
import { getPageHeader } from "@/content/pageContent";
import { pillars } from "@/content/contribuicao";

const header = getPageHeader("contribuicao");

export const Route = createFileRoute("/contribuicao")({
  beforeLoad: () => {
    if (!isPageEnabled("contribuicao")) throw notFound();
  },
  head: () => ({
    meta: [
      { title: "Contribuição Cultural — Luciani Heindrickson da Silva" },
      {
        name: "description",
        content:
          "Como a atuação da autora contribui para a preservação da memória, o fortalecimento da literatura, a valorização das mulheres e a democratização da cultura.",
      },
      { property: "og:title", content: "Contribuição Cultural — Luciani Heindrickson da Silva" },
      {
        property: "og:description",
        content:
          "Uma reflexão sobre a contribuição da autora à memória, literatura e cultura regional.",
      },
    ],
  }),
  component: Contribuicao,
});

function Contribuicao() {
  return (
    <>
      <PageHeader kicker={header.kicker} title={header.title} lead={header.lead} />
      <section className="mx-auto max-w-3xl px-6 pb-24 space-y-14">
        {pillars.map((p) => (
          <article key={p.kicker} className="grid grid-cols-[64px_1fr] gap-6">
            <div className="font-display text-5xl text-clay leading-none">{p.kicker}</div>
            <div>
              <h3 className="font-display text-2xl">{p.title}</h3>
              <div className="mt-3 font-serif text-lg leading-relaxed text-foreground/90">
                <MarkdownContent>{p.text}</MarkdownContent>
              </div>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
