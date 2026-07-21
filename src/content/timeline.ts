import { z } from "zod";
import { parseMarkdownCollection } from "./_lib/parse";

export type TimelineItem = {
  year: string;
  title: string;
  description: string;
  institution?: string;
  city?: string;
  image?: string;
  certificate?: string;
};

const TimelineSchema = z.object({
  year: z.string(),
  title: z.string(),
  institution: z.string().optional(),
  city: z.string().optional(),
  image: z.string().optional(),
  certificate: z.string().optional(),
  body: z.string(),
});

const rawFiles = import.meta.glob("/content/timeline/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

export const timeline: TimelineItem[] = parseMarkdownCollection(rawFiles, TimelineSchema)
  .map(({ year, title, institution, city, image, certificate, body }) => ({
    year,
    title,
    description: body,
    institution,
    city,
    image,
    certificate,
  }))
  .sort((a, b) => Number(b.year) - Number(a.year));
