import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { projects } from "@/content/projects";

const BASE_URL = "";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const staticPaths = [
          "/",
          "/quem-sou",
          "/trajetoria",
          "/producao-literaria",
          "/projetos",
          "/galeria",
          "/certificados",
          "/competencias",
          "/contribuicao",
          "/contato",
          "/dossie",
        ];
        const projectPaths = projects.map((p) => `/projetos/${p.slug}`);
        const urls = [...staticPaths, ...projectPaths]
          .map(
            (p) =>
              `  <url><loc>${BASE_URL}${p}</loc><changefreq>monthly</changefreq></url>`,
          )
          .join("\n");
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});