import { z } from "zod";
import { parseMarkdownCollection } from "./_lib/parse";

export type Project = {
  slug: string;
  title: string;
  subtitle?: string;
  year: string;
  cover?: string;
  summary: string;
  context: string;
  objectives: string[];
  activities: string[];
  results: string[];
  photoPrefix: string;
  documentPrefix: string;
};

const ProjectSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  year: z.string(),
  cover: z.string().optional(),
  summary: z.string(),
  objectives: z.array(z.string()),
  activities: z.array(z.string()),
  results: z.array(z.string()),
  photoPrefix: z.string(),
  documentPrefix: z.string(),
  body: z.string(),
});

const rawFiles = import.meta.glob("/content/projects/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

export const projects: Project[] = parseMarkdownCollection(rawFiles, ProjectSchema)
  .map(
    ({
      slug,
      title,
      subtitle,
      year,
      cover,
      summary,
      objectives,
      activities,
      results,
      photoPrefix,
      documentPrefix,
      body,
    }) => ({
      slug,
      title,
      subtitle,
      year,
      cover,
      summary,
      context: body,
      objectives,
      activities,
      results,
      photoPrefix,
      documentPrefix,
    }),
  )
  .sort((a, b) => Number(b.year) - Number(a.year));

export const projectsBySlug = Object.fromEntries(projects.map((p) => [p.slug, p]));
