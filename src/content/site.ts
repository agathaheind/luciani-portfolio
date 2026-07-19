import { z } from "zod";
import { parseYamlFile } from "./_lib/parse";

const IndicatorSchema = z.object({
  label: z.string(),
  value: z.string(),
});

const SiteSchema = z.object({
  author: z.string(),
  role: z.string(),
  city: z.string(),
  email: z.string(),
  phone: z.string(),
  instagram: z.string(),
  tagline: z.string(),
  presentation: z.string(),
  indicators: z.array(IndicatorSchema),
});

const raw = import.meta.glob("/content/site.yaml", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

const data = parseYamlFile(raw["/content/site.yaml"], SiteSchema, "content/site.yaml");

export const site = {
  author: data.author,
  role: data.role,
  city: data.city,
  email: data.email,
  phone: data.phone,
  instagram: data.instagram,
  tagline: data.tagline,
  presentation: data.presentation,
};

export const indicators: { label: string; value: string }[] = data.indicators;
