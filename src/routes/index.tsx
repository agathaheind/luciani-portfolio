import { createFileRoute, Link } from "@tanstack/react-router";
import heroImage from "@/assets/hero-library.jpg";
import { indicators, site } from "@/content/site";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <>
      {/* HERO */}
      <section className="relative isolate min-h-[92vh] flex items-end overflow-hidden">
        <img
          src={heroImage}
          alt="Biblioteca com estantes de livros antigos e luz dourada entrando pela janela"
          width={1920}
          height={1280}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, oklch(0.30 0.03 45 / 0.35) 0%, oklch(0.25 0.03 45 / 0.55) 55%, oklch(0.20 0.03 45 / 0.85) 100%)",
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl w-full px-6 pb-20 pt-40 text-paper">
          <div className="max-w-3xl">
            <span className="rule-ornament" style={{ color: "var(--sand)" }}>
              Portfólio Cultural — 2025
            </span>
            <h1
              className="mt-6 font-display text-5xl sm:text-6xl md:text-7xl leading-[0.95]"
              style={{ color: "var(--paper)" }}
            >
              {site.author}
            </h1>
            <p
              className="mt-6 font-serif italic text-lg sm:text-xl"
              style={{ color: "var(--sand)" }}
            >
              Escritora · Pesquisadora da memória local · Produtora Cultural
            </p>
            <p className="mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-paper/90">
              {site.tagline}
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                to="/quem-sou"
                className="inline-flex items-center gap-2 border border-paper/70 bg-transparent px-6 py-3 font-serif text-sm tracking-widest uppercase text-paper transition-colors hover:bg-paper hover:text-coffee"
              >
                Conheça minha trajetória
              </Link>
              <Link
                to="/dossie"
                className="inline-flex items-center gap-2 px-6 py-3 font-serif italic text-sm tracking-wide text-sand underline underline-offset-4 hover:text-paper"
              >
                Dossiê para editais →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* INDICADORES */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border/70 border border-border/70">
          {indicators.map((it) => (
            <div
              key={it.label}
              className="bg-background px-6 py-10 text-center flex flex-col justify-center"
            >
              <div className="font-display text-5xl text-coffee">{it.value}</div>
              <div className="mt-3 font-serif italic text-xs sm:text-sm tracking-wider uppercase text-muted-foreground">
                {it.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* APRESENTAÇÃO */}
      <section className="mx-auto max-w-3xl px-6 pb-24">
        <div className="text-center">
          <span className="rule-ornament">Apresentação</span>
        </div>
        <h2 className="mt-6 text-center font-display text-4xl md:text-5xl">
          Uma escrita entre memória, literatura e fronteira.
        </h2>
        <p className="drop-cap mt-10 font-serif text-lg leading-relaxed text-foreground/90">
          {site.presentation}
        </p>
        <div className="mt-10 text-center">
          <Link
            to="/quem-sou"
            className="font-serif italic text-cocoa underline underline-offset-4 hover:text-coffee"
          >
            Ler biografia completa →
          </Link>
        </div>
      </section>

      {/* NAVEGAÇÃO EDITORIAL */}
      <section className="border-t border-border/60 bg-sand/40">
        <div className="mx-auto max-w-6xl px-6 py-20 grid gap-10 md:grid-cols-3">
          {[
            {
              to: "/trajetoria",
              kicker: "Capítulo I",
              title: "Trajetória cultural",
              desc: "Uma linha do tempo comentada: formação, projetos, publicações e participações.",
            },
            {
              to: "/producao-literaria",
              kicker: "Capítulo II",
              title: "Produção literária",
              desc: "A estante da autora — livros, antologias, crônicas, poesia e artigos.",
            },
            {
              to: "/projetos",
              kicker: "Capítulo III",
              title: "Projetos culturais",
              desc: "Iniciativas realizadas, com contexto, atividades, resultados e documentos.",
            },
          ].map((c) => (
            <Link
              key={c.to}
              to={c.to}
              className="group block border border-border/70 bg-background p-8 transition-shadow hover:shadow-[var(--shadow-book)]"
            >
              <div className="font-serif italic text-xs tracking-[0.22em] uppercase text-clay">
                {c.kicker}
              </div>
              <h3 className="mt-3 font-display text-2xl">{c.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{c.desc}</p>
              <span className="mt-6 inline-block font-serif italic text-cocoa group-hover:text-coffee">
                Abrir capítulo →
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
