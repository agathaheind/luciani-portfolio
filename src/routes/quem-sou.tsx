import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { site } from "@/content/site";

export const Route = createFileRoute("/quem-sou")({
  head: () => ({
    meta: [
      { title: "Quem Sou — Luciani Heindrickson" },
      {
        name: "description",
        content:
          "Trajetória de Luciani Heindrickson: escrita, literatura de resistência, memória local, pesquisa e produção cultural na tríplice fronteira.",
      },
      { property: "og:title", content: "Quem Sou — Luciani Heindrickson" },
      {
        property: "og:description",
        content:
          "Narrativa biográfica da autora, escritora e produtora cultural de Foz do Iguaçu.",
      },
    ],
  }),
  component: QuemSou,
});

function QuemSou() {
  return (
    <>
      <PageHeader
        kicker="Capítulo I · Biografia"
        title="Quem sou"
        lead="Uma vida entre livros, palavras e o rio que atravessa três países."
      />
      <article className="mx-auto max-w-3xl px-6 pb-24 font-serif text-lg leading-relaxed text-foreground/90 space-y-6">
        <p className="drop-cap">
          {site.presentation}
        </p>
        <p>
          Nasci em <strong className="font-medium">Foz do Iguaçu</strong>, cidade
          de fronteira onde as línguas se cruzam e onde a paisagem — o rio, a
          mata, as pontes — sempre pediu palavra. A literatura chegou cedo, como
          escuta: primeiro, das mulheres da família; depois, dos livros que
          descobria na biblioteca pública e nas estantes emprestadas.
        </p>
        <p>
          Formei-me em <strong className="font-medium">Letras
          Português/Espanhol pela UNIOESTE</strong> e, mais tarde, avancei
          para o mestrado, dedicando minha pesquisa à representação feminina na
          literatura contemporânea. Foi ali que compreendi que escrever, para
          mim, seria também um gesto de organização coletiva: reunir, editar,
          publicar e criar espaços para que outras vozes emergissem.
        </p>
        <p>
          Ao longo dos últimos anos, tenho articulado três frentes:
          <em> escrita autoral </em> — em poesia, crônica e ensaio —,
          <em> pesquisa da memória local </em> em torno das mulheres da
          fronteira, e <em> produção cultural </em>, através da concepção
          e coordenação de oficinas, seminários, feiras do livro e coletâneas.
        </p>
        <p>
          Minha atuação parte do entendimento de que a literatura é
          patrimônio: preserva, atravessa e devolve identidade a comunidades
          que raramente se veem representadas. Por isso, cada projeto é também
          um documento — um modo de guardar a cidade e as pessoas que a
          escrevem, todos os dias, sem necessariamente ocupar páginas.
        </p>
        <p>
          Este portfólio reúne parte desse percurso. Foi organizado para
          servir como leitura sensível e, ao mesmo tempo, como material
          institucional a comissões de editais públicos de fomento à cultura.
        </p>
      </article>
    </>
  );
}