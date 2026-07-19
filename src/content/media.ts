import { z } from "zod";
import { parseMarkdownCollection } from "./_lib/parse";

export type GalleryCategory =
  | "Eventos"
  | "Palestras"
  | "Livros"
  | "Oficinas"
  | "Produção Cultural"
  | "Comunidade"
  | "Literatura";

export type Photo = {
  file: string;
  url: string;
  caption?: string;
  category: GalleryCategory;
};

export type Document = {
  file: string;
  url: string;
  title: string;
  institution: string;
  year: string;
  thumbnail?: string;
};

const GALLERY_CATEGORIES = [
  "Eventos",
  "Palestras",
  "Livros",
  "Oficinas",
  "Produção Cultural",
  "Comunidade",
  "Literatura",
] as const;

const PhotoSchema = z.object({
  file: z.string(),
  image: z.string(),
  category: z.enum(GALLERY_CATEGORIES),
  caption: z.string().optional(),
});

const DocumentSchema = z.object({
  file: z.string(),
  title: z.string(),
  institution: z.string(),
  year: z.string(),
  url: z.string().optional().default("#"),
});

const rawPhotoFiles = import.meta.glob("/content/media/photos/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

const rawDocumentFiles = import.meta.glob("/content/media/documents/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

export const photos: Photo[] = parseMarkdownCollection(rawPhotoFiles, PhotoSchema).map(
  ({ file, image, category, caption }) => ({
    file,
    category,
    caption,
    url: `/media/photos/${image}`,
  }),
);

export const documents: Document[] = parseMarkdownCollection(rawDocumentFiles, DocumentSchema).map(
  ({ file, title, institution, year, url }) => ({
    file,
    title,
    institution,
    year,
    url,
  }),
);

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
