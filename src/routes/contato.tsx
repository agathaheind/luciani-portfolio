import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { site } from "@/content/site";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato — Luciani Heindrickson" },
      {
        name: "description",
        content:
          "Fale com Luciani Heindrickson — escritora, pesquisadora da memória local e produtora cultural.",
      },
      { property: "og:title", content: "Contato — Luciani Heindrickson" },
      {
        property: "og:description",
        content: "Canais de contato para propostas culturais, editoriais e institucionais.",
      },
    ],
  }),
  component: Contato,
});

function Contato() {
  const rows: [string, string, string?][] = [
    ["Cidade", site.city],
    ["E-mail", site.email, `mailto:${site.email}`],
    ["Telefone", site.phone, `tel:${site.phone.replace(/\D/g, "")}`],
    ["Instagram", site.instagram, `https://instagram.com/${site.instagram.replace("@", "")}`],
  ];
  return (
    <>
      <PageHeader
        kicker="Correspondência"
        title="Contato"
        lead="Para propostas culturais, colaborações editoriais e convites institucionais."
      />
      <section className="mx-auto max-w-xl px-6 pb-24">
        <dl className="divide-y divide-border/70 border-y border-border/70">
          {rows.map(([label, value, href]) => (
            <div key={label} className="grid grid-cols-[120px_1fr] gap-4 py-5 items-baseline">
              <dt className="font-serif italic text-sm uppercase tracking-widest text-clay">
                {label}
              </dt>
              <dd className="font-display text-lg text-coffee break-words">
                {href ? (
                  <a href={href} className="hover:underline">
                    {value}
                  </a>
                ) : (
                  value
                )}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}