export type BookCategory =
  | "livro"
  | "coletanea"
  | "cronica"
  | "poesia"
  | "artigo"
  | "revista"
  | "capitulo";

export type Book = {
  title: string;
  category: BookCategory;
  year: string;
  status: "Publicado" | "No prelo" | "Em produção";
  synopsis: string;
  cover?: string;
  link?: string;
};

export const books: Book[] = [
  {
    title: "PSIQUÊ — E-Antologia Poética",
    category: "coletanea",
    year: "2025",
    status: "Publicado",
    synopsis:
      "Antologia poética contemporânea que reúne vozes femininas em torno da psique, do corpo e da memória. Publicação organizada pela Editora Fênixart.",
  },
  {
    title: "Vozes de Fronteira",
    category: "livro",
    year: "2024",
    status: "No prelo",
    synopsis:
      "Ensaio literário sobre memória, língua e mulheres da tríplice fronteira, articulando história oral e literatura de resistência.",
  },
  {
    title: "Cadernos de Memória I",
    category: "cronica",
    year: "2023",
    status: "Publicado",
    synopsis:
      "Reunião de crônicas curtas sobre paisagens afetivas de Foz do Iguaçu — infância, rio, biblioteca e travessia.",
  },
  {
    title: "Mulheres que Escrevem a Cidade",
    category: "artigo",
    year: "2022",
    status: "Publicado",
    synopsis:
      "Artigo acadêmico publicado em revista universitária, discutindo autoria feminina, território e produção literária no oeste do Paraná.",
  },
  {
    title: "Fio d'água",
    category: "poesia",
    year: "2021",
    status: "Publicado",
    synopsis:
      "Reunião de poemas dedicados à água, à travessia e ao silêncio — primeiro livro solo da autora.",
  },
  {
    title: "Antologia Literária Regional — vol. II",
    category: "capitulo",
    year: "2020",
    status: "Publicado",
    synopsis:
      "Capítulo em coletânea regional que reúne autores do sul do Brasil em torno da paisagem, do trabalho e da memória.",
  },
];

export const bookCategoryLabel: Record<BookCategory, string> = {
  livro: "Livro",
  coletanea: "Coletânea",
  cronica: "Crônicas",
  poesia: "Poesia",
  artigo: "Artigo",
  revista: "Revista",
  capitulo: "Capítulo",
};
