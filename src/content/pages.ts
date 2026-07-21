import { z } from "zod";
import { parseYamlFile } from "./_lib/parse";

export type PageEntry = {
  key: string;
  to: string;
  label: string;
  enabled: boolean;
  order: number;
};

const PageEntrySchema = z.object({
  key: z.string(),
  to: z.string(),
  label: z.string(),
  enabled: z.boolean(),
  order: z.number(),
});

const PagesSchema = z.array(PageEntrySchema);

const raw = import.meta.glob("/content/pages.yaml", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

const data = parseYamlFile(raw["/content/pages.yaml"], PagesSchema, "content/pages.yaml");

export const pages: PageEntry[] = [...data].sort((a, b) => a.order - b.order);

const enabledByKey: Record<string, boolean> = Object.fromEntries(
  pages.map((p) => [p.key, p.enabled]),
);

export function isPageEnabled(key: string): boolean {
  return enabledByKey[key] ?? false;
}
