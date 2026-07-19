import { z } from "zod";
import { parseMarkdownCollection } from "./_lib/parse";

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
};

const BookSchema = z.object({
  title: z.string(),
  category: z.enum(["livro", "coletanea", "cronica", "poesia", "artigo", "revista", "capitulo"]),
  year: z.string(),
  status: z.enum(["Publicado", "No prelo", "Em produção"]),
  body: z.string(),
});

const rawFiles = import.meta.glob("/content/books/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

export const books: Book[] = parseMarkdownCollection(rawFiles, BookSchema)
  .map(({ title, category, year, status, body }) => ({
    title,
    category,
    year,
    status,
    synopsis: body,
  }))
  .sort((a, b) => Number(b.year) - Number(a.year));

export const bookCategoryLabel: Record<BookCategory, string> = {
  livro: "Livro",
  coletanea: "Coletânea",
  cronica: "Crônicas",
  poesia: "Poesia",
  artigo: "Artigo",
  revista: "Revista",
  capitulo: "Capítulo",
};
