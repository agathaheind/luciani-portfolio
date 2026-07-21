import { z } from "zod";
import { parseMarkdownCollection } from "./_lib/parse";

const PillarSchema = z.object({
  kicker: z.string(),
  title: z.string(),
  body: z.string(),
});

export type Pillar = { kicker: string; title: string; text: string };

const rawFiles = import.meta.glob("/content/contribuicao/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

export const pillars: Pillar[] = parseMarkdownCollection(rawFiles, PillarSchema)
  .sort((a, b) => a.slug.localeCompare(b.slug))
  .map(({ kicker, title, body }) => ({ kicker, title, text: body }));
