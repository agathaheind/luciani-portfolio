// -----------------------------------------------------------------------------
// MEDIA REGISTRY — central inventory of uploaded photos and documents.
//
// Naming convention (as agreed with the author):
//   Projeto_Mulheres_01.jpg              -> project "Projeto_Mulheres_" gallery
//   Feira_do_Livro_02.jpg                -> project "Feira_do_Livro_" gallery
//   Certificado_Projeto_Mulheres_01.pdf  -> project "Projeto_Mulheres_" docs
//
// The functions below group items by prefix automatically, so a new upload
// only needs to be added to the `photos` or `documents` arrays with the
// correct filename. It will appear on the matching project page and in the
// global Gallery / Certificates pages.
// -----------------------------------------------------------------------------

export type GalleryCategory =
  | "Eventos"
  | "Palestras"
  | "Livros"
  | "Oficinas"
  | "Produção Cultural"
  | "Comunidade"
  | "Literatura";

export type Photo = {
  file: string; // filename, e.g. "Projeto_Mulheres_01.jpg"
  url: string; // resolvable src (import, /public path or external URL)
  caption?: string;
  category: GalleryCategory;
};

export type Document = {
  file: string; // filename, e.g. "Certificado_Projeto_Mulheres_01.pdf"
  url: string;
  title: string;
  institution: string;
  year: string;
  thumbnail?: string;
};

// -----------------------------------------------------------------------------
// Seeded assets. Replace URLs / add new entries as files are received.
// -----------------------------------------------------------------------------

import clubeLeitura from "@/assets/media/clube-leitura.jpg";
import ensaioTeatro from "@/assets/media/ensaio-teatro-unila.jpg";

export const photos: Photo[] = [
  {
    file: "Clube_Leitura_01.jpg",
    url: clubeLeitura,
    caption: "Encontro do Clube de Leitura — outubro de 2019",
    category: "Comunidade",
  },
  {
    file: "Ensaio_Teatro_UNILA_01.jpg",
    url: ensaioTeatro,
    caption: "Ensaio do grupo de teatro — UNILA",
    category: "Produção Cultural",
  },
];

export const documents: Document[] = [
  {
    file: "Certificado_Antologia_Psique.pdf",
    url: "#",
    title: "Certificado de Participação — E-Antologia PSIQUÊ",
    institution: "Editora Fênixart",
    year: "2025",
  },
  {
    file: "Certificado_Mencao_Honrosa.pdf",
    url: "#",
    title: "Certificado de Menção Honrosa",
    institution: "Concurso Literário Nacional",
    year: "2021",
  },
  {
    file: "Certificado_PROEX_Teatro.pdf",
    url: "#",
    title: "Certificado PROEX — Teatro UNILA",
    institution: "UNILA — Pró-Reitoria de Extensão",
    year: "2022",
  },
  {
    file: "Declaracao_TAUP.pdf",
    url: "#",
    title: "Declaração TAUP",
    institution: "Projeto TAUP",
    year: "2023",
  },
  {
    file: "Declaracao_Mentoria.pdf",
    url: "#",
    title: "Declaração de Mentoria",
    institution: "Programa independente",
    year: "2024",
  },
  {
    file: "Diploma_Graduacao.pdf",
    url: "#",
    title: "Diploma — Graduação em Letras",
    institution: "UNIOESTE",
    year: "2015",
  },
  {
    file: "Diploma_Mestrado.pdf",
    url: "#",
    title: "Diploma — Mestrado em Letras",
    institution: "Pós-graduação em Letras",
    year: "2018",
  },
];

export function photosByPrefix(prefix: string): Photo[] {
  return photos.filter((p) => p.file.startsWith(prefix));
}
export function documentsByPrefix(prefix: string): Document[] {
  return documents.filter((d) => d.file.startsWith(prefix));
}
export function photosByCategory(): Record<GalleryCategory, Photo[]> {
  const out = {} as Record<GalleryCategory, Photo[]>;
  for (const p of photos) {
    (out[p.category] ??= []).push(p);
  }
  return out;
}