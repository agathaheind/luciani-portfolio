import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/contribuicao")({
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

const pillars = [
  {
    kicker: "I",
    title: "Preservação da memória",
    text: "Cada projeto é também um arquivo: registrar histórias de vida, cadernos, fotografias e cartas é impedir que a cidade esqueça de si mesma.",
  },
  {
    kicker: "II",
    title: "Fortalecimento da literatura",
    text: "A publicação de coletâneas, a mediação de leituras e a formação de escritoras iniciantes ampliam a rede literária regional e a circulação de novos autores.",
  },
  {
    kicker: "III",
    title: "Valorização das mulheres",
    text: "Perspectivas femininas são o eixo da pesquisa e da escrita — mulheres da fronteira, mães, avós, professoras, poetas — narradoras, todas.",
  },
  {
    kicker: "IV",
    title: "Identidade regional",
    text: "A tríplice fronteira é território literário: sua paisagem, suas línguas e suas travessias compõem uma identidade cultural que precisa de espaço público.",
  },
  {
    kicker: "V",
    title: "Democratização da cultura",
    text: "Ações gratuitas, acessíveis e realizadas em espaços públicos garantem que a literatura chegue a quem, historicamente, esteve fora do circuito cultural formal.",
  },
];

function Contribuicao() {
  return (
    <>
      <PageHeader
        kicker="Manifesto"
        title="Contribuição cultural"
        lead="Cinco eixos que orientam a atuação da autora e sua relação com a política pública de cultura."
      />
      <section className="mx-auto max-w-3xl px-6 pb-24 space-y-14">
        {pillars.map((p) => (
          <article key={p.kicker} className="grid grid-cols-[64px_1fr] gap-6">
            <div className="font-display text-5xl text-clay leading-none">{p.kicker}</div>
            <div>
              <h3 className="font-display text-2xl">{p.title}</h3>
              <p className="mt-3 font-serif text-lg leading-relaxed text-foreground/90">{p.text}</p>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
