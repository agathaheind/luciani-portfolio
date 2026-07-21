import { z } from "zod";
import { parseMarkdownCollection } from "./_lib/parse";

const CompetencySchema = z.object({
  title: z.string(),
  body: z.string(),
});

export type Competency = { title: string; description: string };

const rawFiles = import.meta.glob("/content/competencies/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

export const competencies: Competency[] = parseMarkdownCollection(rawFiles, CompetencySchema)
  .sort((a, b) => a.slug.localeCompare(b.slug))
  .map(({ title, body }) => ({ title, description: body }));
