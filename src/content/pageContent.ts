import { z } from "zod";
import { parseMarkdownCollection } from "./_lib/parse";

const PageContentSchema = z.object({
  kicker: z.string().optional(),
  title: z.string().optional(),
  lead: z.string().optional(),
  body: z.string(),
});

type PageContentEntry = z.infer<typeof PageContentSchema> & { slug: string };

const rawFiles = import.meta.glob("/content/pages/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

const entries: PageContentEntry[] = parseMarkdownCollection(rawFiles, PageContentSchema);

const bySlug: Record<string, PageContentEntry> = Object.fromEntries(
  entries.map((e) => [e.slug, e]),
);

export function getPageHeader(key: string): { kicker: string; title: string; lead: string } {
  const entry = bySlug[key];
  if (!entry?.kicker || !entry.title || !entry.lead) {
    throw new Error(`content/pages/${key}.md is missing kicker/title/lead frontmatter`);
  }
  return { kicker: entry.kicker, title: entry.title, lead: entry.lead };
}

export function getPageBody(key: string): string {
  return bySlug[key]?.body ?? "";
}
