import matter from "gray-matter";
import * as yaml from "js-yaml";
import type { z } from "zod";

export function parseYamlFile<T>(raw: string, schema: z.ZodType<T>, path: string): T {
  const data = yaml.load(raw);
  const result = schema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid content file ${path}:\n${issues}`);
  }
  return result.data;
}

export function parseMarkdownCollection<T>(
  rawFiles: Record<string, string>,
  schema: z.ZodType<T>,
): (T & { slug: string })[] {
  return Object.entries(rawFiles).map(([path, raw]) => {
    const filename = path.split("/").pop() ?? path;
    const slug = filename.replace(/\.md$/, "");
    const { data, content } = matter(raw);
    const result = schema.safeParse({ ...data, body: content.trim() });
    if (!result.success) {
      const issues = result.error.issues
        .map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`)
        .join("\n");
      throw new Error(`Invalid content file ${path}:\n${issues}`);
    }
    return { ...result.data, slug };
  });
}
