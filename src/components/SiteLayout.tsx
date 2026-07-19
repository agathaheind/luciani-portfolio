import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { site } from "@/content/site";

const nav = [
  { to: "/", label: "Início" },
  { to: "/quem-sou", label: "Quem Sou" },
  { to: "/trajetoria", label: "Trajetória" },
  { to: "/producao-literaria", label: "Produção" },
  { to: "/projetos", label: "Projetos" },
  { to: "/galeria", label: "Galeria" },
  { to: "/certificados", label: "Certificados" },
  { to: "/competencias", label: "Competências" },
  { to: "/contribuicao", label: "Contribuição" },
  { to: "/dossie", label: "Dossiê" },
  { to: "/contato", label: "Contato" },
] as const;

export function SiteLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="paper-bg min-h-dvh flex flex-col">
      <header className="no-print sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto max-w-7xl grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-6 py-4">
          <Link
            to="/"
            className="min-w-0 flex flex-col leading-tight"
            onClick={() => setOpen(false)}
          >
            <span className="font-display text-xl tracking-wide text-coffee truncate">
              {site.author}
            </span>
            <span className="font-serif italic text-[11px] tracking-[0.22em] uppercase text-clay">
              Portfólio Cultural
            </span>
          </Link>
          <nav className="hidden lg:flex items-center gap-6 text-[13px] tracking-wide">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                activeOptions={{ exact: n.to === "/" }}
                activeProps={{ className: "text-coffee font-medium" }}
                inactiveProps={{ className: "text-muted-foreground hover:text-cocoa" }}
                className="transition-colors"
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <button
            type="button"
            className="lg:hidden shrink-0 rounded-sm border border-border p-2 text-cocoa"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
        {open && (
          <nav className="lg:hidden border-t border-border/70 bg-background">
            <ul className="mx-auto max-w-7xl grid grid-cols-2 gap-x-6 gap-y-3 px-6 py-5 text-sm">
              {nav.map((n) => (
                <li key={n.to}>
                  <Link
                    to={n.to}
                    onClick={() => setOpen(false)}
                    activeOptions={{ exact: n.to === "/" }}
                    activeProps={{ className: "text-coffee font-medium" }}
                    inactiveProps={{ className: "text-muted-foreground" }}
                  >
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="no-print mt-24 border-t border-border/70 bg-sand/40">
        <div className="mx-auto max-w-7xl px-6 py-12 grid gap-10 md:grid-cols-3 text-sm">
          <div>
            <div className="font-display text-2xl text-coffee">{site.author}</div>
            <p className="mt-3 font-serif italic text-muted-foreground">
              Escritora · Pesquisadora da memória local · Produtora Cultural
            </p>
          </div>
          <div>
            <div className="rule-ornament">Contato</div>
            <ul className="mt-3 space-y-1 text-muted-foreground">
              <li>{site.city}</li>
              <li>
                <a className="hover:text-cocoa" href={`mailto:${site.email}`}>
                  {site.email}
                </a>
              </li>
              <li>{site.phone}</li>
              <li>
                <a
                  className="hover:text-cocoa"
                  href={`https://instagram.com/${site.instagram.replace("@", "")}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {site.instagram}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <div className="rule-ornament">Navegação</div>
            <ul className="mt-3 grid grid-cols-2 gap-y-1 text-muted-foreground">
              {nav.slice(1, 9).map((n) => (
                <li key={n.to}>
                  <Link to={n.to} className="hover:text-cocoa">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-border/60">
          <div className="mx-auto max-w-7xl px-6 py-5 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
            <span>
              © {new Date().getFullYear()} {site.author}. Todos os direitos reservados.
            </span>
            <span className="font-serif italic">
              Portfólio institucional — editais de fomento à cultura
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
