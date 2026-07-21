import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { MarkdownContent } from "@/components/MarkdownContent";
import { site } from "@/content/site";
import { isPageEnabled } from "@/content/pages";
import { getPageHeader, getPageBody } from "@/content/pageContent";

const header = getPageHeader("quem-sou");

export const Route = createFileRoute("/quem-sou")({
  beforeLoad: () => {
    if (!isPageEnabled("quem-sou")) throw notFound();
  },
  head: () => ({
    meta: [
      { title: "Quem Sou — Luciani Heindrickson da Silva" },
      {
        name: "description",
        content:
          "Trajetória de Luciani Heindrickson da Silva: escrita, literatura de resistência, memória local, pesquisa e produção cultural na tríplice fronteira.",
      },
      { property: "og:title", content: "Quem Sou — Luciani Heindrickson da Silva" },
      {
        property: "og:description",
        content: "Narrativa biográfica da autora, escritora e produtora cultural de Foz do Iguaçu.",
      },
    ],
  }),
  component: QuemSou,
});

function QuemSou() {
  return (
    <>
      <PageHeader kicker={header.kicker} title={header.title} lead={header.lead} />
      <article className="mx-auto max-w-3xl px-6 pb-24 font-serif text-lg leading-relaxed text-foreground/90 space-y-6">
        <p className="drop-cap">{site.presentation}</p>
        <MarkdownContent>{getPageBody("quem-sou")}</MarkdownContent>
      </article>
    </>
  );
}
