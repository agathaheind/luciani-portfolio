# Content Architecture & Page Visibility Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move all editable content out of `src/content/*.ts` TypeScript literals into plain Markdown+YAML files under a new top-level `content/` directory, and make page visibility configurable, without changing what routes/components import from `src/content/*`.

**Architecture:** Each `src/content/*.ts` module is rewritten as a thin loader: `import.meta.glob` reads raw file text from `content/`, a shared parsing helper (`gray-matter` for Markdown+frontmatter, `js-yaml` for pure YAML) turns it into validated objects (`zod`), and the loader exports the exact same names/shapes the codebase already imports. No test runner exists in this project (no vitest/jest in package.json) — verification follows the project's existing convention: `bun run build`, `bun run lint`, and a dev-server smoke test confirming real content renders.

**Tech Stack:** TanStack Start, Vite 8, `gray-matter` (new), `js-yaml` (new), `zod` (existing).

## Global Constraints

- Every `src/content/*.ts` file's exported names, types, and function signatures stay **identical** to today: `site`, `indicators` (site.ts); `competencies` (competencies.ts); `books`, `bookCategoryLabel` (books.ts); `timeline` (timeline.ts); `projects`, `projectsBySlug` (projects.ts); `photos`, `documents`, `photosByCategory`, `photosByPrefix`, `documentsByPrefix` (media.ts). No route or component file changes except where this plan explicitly says so (Task 7 only).
- `content/` lives at the repo root, a sibling of `src/`, not nested inside it.
- All data values transcribed into new files must exactly match the current `src/content/*.ts` values (already-corrected name/city from the prior rebuild) — this is a lossless migration, not a content rewrite.
- No `git push`. Each task ends with exactly one commit in this repo.
- Spec: `docs/superpowers/specs/2026-07-19-content-architecture-design.md`

---

### Task 1: Shared content-parsing helpers + site.yaml migration

**Files:**
- Create: `content/site.yaml`
- Create: `src/content/_lib/parse.ts`
- Modify: `src/content/site.ts`
- Modify: `package.json` (add `gray-matter`, `js-yaml` deps; `@types/js-yaml` devDep)

**Interfaces:**
- Produces: `parseYamlFile<T>(raw: string, schema: z.ZodType<T>, path: string): T` and
  `parseMarkdownCollection<T>(rawFiles: Record<string,string>, schema: z.ZodType<T>): (T & { slug: string })[]`
  in `src/content/_lib/parse.ts` — every later task's loader imports from here.
- Produces: `site: { author, role, city, email, phone, instagram, tagline, presentation }` and
  `indicators: { label: string; value: string }[]` from `src/content/site.ts`, unchanged shape.

- [ ] **Step 1: Install dependencies**

Run: `cd /home/inasc/projects/luciani-portfolio && bun add gray-matter js-yaml && bun add -d @types/js-yaml`

Expected: exits 0; `package.json` now lists `gray-matter` and `js-yaml` under `dependencies` and `@types/js-yaml` under `devDependencies`.

- [ ] **Step 2: Create the shared parsing helpers**

Create `src/content/_lib/parse.ts`:
```typescript
import matter from "gray-matter";
import yaml from "js-yaml";
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
```

- [ ] **Step 3: Create `content/site.yaml`**

Create `content/site.yaml` at the repo root (sibling of `src/`) with exactly:
```yaml
author: Luciani Heindrickson da Silva
role: Escritora · Pesquisadora da memória local · Produtora Cultural
city: Santa Terezinha de Itaipu, Paraná — Brasil
email: contato@lucianiheindrickson.com.br
phone: "+55 (45) 90000-0000"
instagram: "@lucianiheindrickson"
tagline: >-
  Escrita, memória e produção cultural na fronteira. Um portfólio
  institucional para editais públicos de fomento à cultura.
presentation: >-
  Luciani Heindrickson da Silva é brasileira, natural de Foz do Iguaçu (PR),
  formada em Letras Português/Espanhol pela UNIOESTE. Dedica-se à literatura
  de resistência, às perspectivas femininas e à pesquisa da memória local,
  articulando escrita, produção editorial e projetos culturais em torno da
  valorização das narrativas de mulheres e do patrimônio da tríplice
  fronteira.
indicators:
  - label: Participações em eventos
    value: "24+"
  - label: Produções literárias
    value: "07"
  - label: Projetos culturais
    value: "12"
  - label: Publicações & antologias
    value: "15"
```

Note the `>-` YAML block scalar (folded, no trailing newline) joins the wrapped
lines with single spaces — the resulting `tagline`/`presentation` strings must
be byte-identical to the current `src/content/site.ts` values. Verify this in
Step 5.

- [ ] **Step 4: Rewrite `src/content/site.ts` as a loader**

Replace the entire contents of `src/content/site.ts` with:
```typescript
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
```

- [ ] **Step 5: Verify content matches exactly**

Run:
```bash
cd /home/inasc/projects/luciani-portfolio
bun run build
bun run lint
```
Expected: both exit 0.

Then start the dev server and confirm the exact strings render:
```bash
bun run dev > /tmp/dev.log 2>&1 &
echo $! > /tmp/dev.pid
sleep 5
cat /tmp/dev.log   # find the Local: URL, e.g. http://localhost:3000
curl -s http://localhost:3000/ | grep -a -o "Santa Terezinha de Itaipu, Paraná — Brasil"
curl -s http://localhost:3000/ | grep -a -o "Participações em eventos"
curl -s http://localhost:3000/ | grep -a -o "24+"
kill "$(cat /tmp/dev.pid)"
rm /tmp/dev.pid /tmp/dev.log
```
Expected: each `grep -a -o` prints the matched string exactly once (indicator
label/value confirm `indicators` round-tripped correctly through YAML→zod).

- [ ] **Step 6: Commit**

```bash
cd /home/inasc/projects/luciani-portfolio
git add -A
git commit -m "Move site identity/indicators content to content/site.yaml"
```

---

### Task 2: Competencies migration

**Files:**
- Create: `content/competencies/01-pesquisa-cultural.md` through `content/competencies/10-patrimonio-cultural.md` (10 files)
- Modify: `src/content/competencies.ts`

**Interfaces:**
- Consumes: `parseMarkdownCollection` from Task 1 (`src/content/_lib/parse.ts`).
- Produces: `competencies: { title: string; description: string }[]`, unchanged shape and order.

- [ ] **Step 1: Create the 10 competency files**

Create `content/competencies/01-pesquisa-cultural.md`:
```markdown
---
title: Pesquisa Cultural
---
Investigação de acervos, memória social e patrimônio, articulando fontes
documentais e trabalho de campo.
```

Create `content/competencies/02-historia-oral.md`:
```markdown
---
title: História Oral
---
Escuta, registro e curadoria de narrativas de vida, com atenção ética às
fontes e ao território.
```

Create `content/competencies/03-escrita-criativa.md`:
```markdown
---
title: Escrita Criativa
---
Prática autoral em poesia, prosa e crônica, com foco em literatura de
resistência e vozes femininas.
```

Create `content/competencies/04-producao-editorial.md`:
```markdown
---
title: Produção Editorial
---
Curadoria, preparação e edição de textos para publicação em livros,
antologias e revistas.
```

Create `content/competencies/05-literatura.md`:
```markdown
---
title: Literatura
---
Mediação e formação de público leitor, com base em formação universitária
em Letras Português/Espanhol.
```

Create `content/competencies/06-producao-cultural.md`:
```markdown
---
title: Produção Cultural
---
Concepção, coordenação e execução de projetos culturais, com gestão de
equipes, parcerias e cronogramas.
```

Create `content/competencies/07-comunicacao.md`:
```markdown
---
title: Comunicação
---
Elaboração de materiais institucionais, memorial descritivo e comunicação
pública de projetos culturais.
```

Create `content/competencies/08-organizacao-de-eventos.md`:
```markdown
---
title: Organização de Eventos
---
Planejamento e execução de feiras, seminários, saraus, oficinas e
lançamentos.
```

Create `content/competencies/09-mediacao-cultural.md`:
```markdown
---
title: Mediação Cultural
---
Facilitação de rodas de leitura, mesas literárias e oficinas voltadas a
diferentes públicos.
```

Create `content/competencies/10-patrimonio-cultural.md`:
```markdown
---
title: Patrimônio Cultural
---
Diálogo com práticas de salvaguarda, memória local e identidade regional da
tríplice fronteira.
```

- [ ] **Step 2: Rewrite `src/content/competencies.ts` as a loader**

Replace the entire contents of `src/content/competencies.ts` with:
```typescript
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
```

- [ ] **Step 3: Verify**

Run:
```bash
cd /home/inasc/projects/luciani-portfolio
bun run build
bun run lint
bun run dev > /tmp/dev.log 2>&1 &
echo $! > /tmp/dev.pid
sleep 5
curl -s http://localhost:3000/competencias | grep -a -o "Pesquisa Cultural"
curl -s http://localhost:3000/competencias | grep -a -o "Patrimônio Cultural"
curl -s http://localhost:3000/competencias | grep -a -c "font-display"  # sanity: page rendered, not empty
kill "$(cat /tmp/dev.pid)"
rm /tmp/dev.pid /tmp/dev.log
```
Expected: `bun run build`/`bun run lint` exit 0; both `grep -a -o` calls print
their match; the `/competencias` page lists all 10 in the same order as the
original array (01 through 10 by filename).

- [ ] **Step 4: Commit**

```bash
cd /home/inasc/projects/luciani-portfolio
git add -A
git commit -m "Move competencies content to content/competencies/*.md"
```

---

### Task 3: Books migration

**Files:**
- Create: `content/books/psique-e-antologia-poetica.md`, `content/books/vozes-de-fronteira.md`,
  `content/books/cadernos-de-memoria-i.md`, `content/books/mulheres-que-escrevem-a-cidade.md`,
  `content/books/fio-dagua.md`, `content/books/antologia-literaria-regional-vol-ii.md` (6 files)
- Modify: `src/content/books.ts`

**Interfaces:**
- Consumes: `parseMarkdownCollection` from Task 1.
- Produces: `books: Book[]` (`{ title, category, year, status, synopsis }`) sorted by `year`
  descending, and `bookCategoryLabel: Record<BookCategory, string>` — both unchanged shape.

- [ ] **Step 1: Create the 6 book files**

Create `content/books/psique-e-antologia-poetica.md`:
```markdown
---
title: PSIQUÊ — E-Antologia Poética
category: coletanea
year: "2025"
status: Publicado
---
Antologia poética contemporânea que reúne vozes femininas em torno da
psique, do corpo e da memória. Publicação organizada pela Editora Fênixart.
```

Create `content/books/vozes-de-fronteira.md`:
```markdown
---
title: Vozes de Fronteira
category: livro
year: "2024"
status: No prelo
---
Ensaio literário sobre memória, língua e mulheres da tríplice fronteira,
articulando história oral e literatura de resistência.
```

Create `content/books/cadernos-de-memoria-i.md`:
```markdown
---
title: Cadernos de Memória I
category: cronica
year: "2023"
status: Publicado
---
Reunião de crônicas curtas sobre paisagens afetivas de Foz do Iguaçu —
infância, rio, biblioteca e travessia.
```

Create `content/books/mulheres-que-escrevem-a-cidade.md`:
```markdown
---
title: Mulheres que Escrevem a Cidade
category: artigo
year: "2022"
status: Publicado
---
Artigo acadêmico publicado em revista universitária, discutindo autoria
feminina, território e produção literária no oeste do Paraná.
```

Create `content/books/fio-dagua.md`:
```markdown
---
title: Fio d'água
category: poesia
year: "2021"
status: Publicado
---
Reunião de poemas dedicados à água, à travessia e ao silêncio — primeiro
livro solo da autora.
```

Create `content/books/antologia-literaria-regional-vol-ii.md`:
```markdown
---
title: Antologia Literária Regional — vol. II
category: capitulo
year: "2020"
status: Publicado
---
Capítulo em coletânea regional que reúne autores do sul do Brasil em torno
da paisagem, do trabalho e da memória.
```

- [ ] **Step 2: Rewrite `src/content/books.ts` as a loader**

Replace the entire contents of `src/content/books.ts` with:
```typescript
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
```

- [ ] **Step 3: Verify**

Run:
```bash
cd /home/inasc/projects/luciani-portfolio
bun run build
bun run lint
bun run dev > /tmp/dev.log 2>&1 &
echo $! > /tmp/dev.pid
sleep 5
curl -s http://localhost:3000/producao-literaria | grep -a -o "PSIQUÊ — E-Antologia Poética"
curl -s http://localhost:3000/producao-literaria | grep -a -o "Antologia Literária Regional — vol. II"
kill "$(cat /tmp/dev.pid)"
rm /tmp/dev.pid /tmp/dev.log
```
Expected: build/lint exit 0; both titles found; on the page, 2025's PSIQUÊ
entry appears before 2020's Antologia Regional entry (year-descending order
preserved).

- [ ] **Step 4: Commit**

```bash
cd /home/inasc/projects/luciani-portfolio
git add -A
git commit -m "Move books content to content/books/*.md"
```

---

### Task 4: Timeline migration

**Files:**
- Create: `content/timeline/2025-antologia-psique.md`, `content/timeline/2024-mentoria-escrita.md`,
  `content/timeline/2023-projeto-taup.md`, `content/timeline/2022-extensao-teatro-unila.md`,
  `content/timeline/2021-mencao-honrosa.md`, `content/timeline/2019-clube-de-leitura.md`,
  `content/timeline/2018-mestrado.md`, `content/timeline/2015-graduacao.md` (8 files)
- Modify: `src/content/timeline.ts`

**Interfaces:**
- Consumes: `parseMarkdownCollection` from Task 1.
- Produces: `timeline: TimelineItem[]` sorted by `year` descending, unchanged shape
  (`{ year, title, description, institution?, city?, image?, certificate? }`).

- [ ] **Step 1: Create the 8 timeline files**

Create `content/timeline/2025-antologia-psique.md`:
```markdown
---
year: "2025"
title: E-Antologia Poética PSIQUÊ
institution: Editora Fênixart
city: Brasil
certificate: Certificado de Participação — PSIQUÊ
---
Participação como poeta convidada na antologia PSIQUÊ, publicada pela
Editora e Produtora Fênixart, reunindo vozes contemporâneas em torno da
psique feminina.
```

Create `content/timeline/2024-mentoria-escrita.md`:
```markdown
---
year: "2024"
title: Mentoria em Escrita Criativa
institution: Programa independente
city: Foz do Iguaçu, PR
certificate: Declaração de Mentoria
---
Mentoria voltada à formação de novas vozes literárias, com foco em escrita
autoral, revisão e preparação para publicação.
```

Create `content/timeline/2023-projeto-taup.md`:
```markdown
---
year: "2023"
title: Projeto TAUP — Territórios da palavra
institution: TAUP
city: Região Oeste do Paraná
certificate: Declaração TAUP
---
Colaboração em projeto de mediação de leitura e escuta ativa, articulando
literatura, memória oral e território.
```

Create `content/timeline/2022-extensao-teatro-unila.md`:
```markdown
---
year: "2022"
title: Extensão universitária em teatro — UNILA
institution: UNILA
city: Foz do Iguaçu, PR
image: ensaio-teatro-unila
certificate: Certificado PROEX — Teatro
---
Participação em ensaios e processos formativos junto ao grupo de teatro da
UNILA, integrando escrita, dramaturgia e criação coletiva.
```

Create `content/timeline/2021-mencao-honrosa.md`:
```markdown
---
year: "2021"
title: Menção Honrosa em Concurso Literário
institution: Concurso Literário Nacional
certificate: Certificado de Menção Honrosa
---
Reconhecimento a texto autoral inscrito em concurso literário nacional, com
destaque para a densidade poética e o compromisso com narrativas femininas.
```

Create `content/timeline/2019-clube-de-leitura.md`:
```markdown
---
year: "2019"
title: Clube de Leitura — Encontros de outubro
institution: Clube de Leitura
city: Foz do Iguaçu, PR
image: clube-leitura
---
Mediação e participação em rodas de leitura voltadas à formação de público
leitor e ao debate sobre literatura brasileira contemporânea.
```

Create `content/timeline/2018-mestrado.md`:
```markdown
---
year: "2018"
title: Mestrado em Letras
institution: Pós-graduação em Letras
certificate: Diploma de Mestrado
---
Formação em nível de mestrado com pesquisa dedicada à literatura, memória e
representações femininas.
```

Create `content/timeline/2015-graduacao.md`:
```markdown
---
year: "2015"
title: Graduação em Letras Português/Espanhol
institution: UNIOESTE
city: Paraná
certificate: Diploma de Graduação
---
Formação acadêmica na UNIOESTE, base para o interesse pela literatura de
resistência e pelas perspectivas femininas na escrita.
```

Note: the `image` field (present on 2 of the 8 entries) is carried through
unchanged but is not currently rendered by `src/routes/trajetoria.tsx` —
confirmed by reading that file, it never references `item.image`. This is
pre-existing dead data, not something to fix in this task.

- [ ] **Step 2: Rewrite `src/content/timeline.ts` as a loader**

Replace the entire contents of `src/content/timeline.ts` with:
```typescript
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
```

- [ ] **Step 3: Verify**

Run:
```bash
cd /home/inasc/projects/luciani-portfolio
bun run build
bun run lint
bun run dev > /tmp/dev.log 2>&1 &
echo $! > /tmp/dev.pid
sleep 5
curl -s http://localhost:3000/trajetoria | grep -a -o "E-Antologia Poética PSIQUÊ"
curl -s http://localhost:3000/trajetoria | grep -a -o "Graduação em Letras Português/Espanhol"
kill "$(cat /tmp/dev.pid)"
rm /tmp/dev.pid /tmp/dev.log
```
Expected: build/lint exit 0; both titles found; 2025 entry appears before
2015 entry on the page (year-descending preserved).

- [ ] **Step 4: Commit**

```bash
cd /home/inasc/projects/luciani-portfolio
git add -A
git commit -m "Move timeline content to content/timeline/*.md"
```

---

### Task 5: Projects migration

**Files:**
- Create: `content/projects/mulheres-que-escrevem.md`, `content/projects/feira-do-livro.md`,
  `content/projects/seminario-literatura.md`, `content/projects/oficina-escrita.md` (4 files)
- Modify: `src/content/projects.ts`

**Interfaces:**
- Consumes: `parseMarkdownCollection` from Task 1.
- Produces: `projects: Project[]` and `projectsBySlug: Record<string, Project>`, unchanged
  shape (`{ slug, title, subtitle?, year, summary, context, objectives[], activities[], results[], photoPrefix, documentPrefix }`).
  `slug` now comes from the filename instead of an explicit frontmatter field.

- [ ] **Step 1: Create the 4 project files**

Create `content/projects/mulheres-que-escrevem.md`:
```markdown
---
title: Mulheres que Escrevem
subtitle: Escrita, escuta e memória feminina
year: "2024"
summary: >-
  Ciclo de oficinas de escrita criativa voltado a mulheres da tríplice
  fronteira, com foco em narrativas de vida, memória e território.
objectives:
  - Oferecer formação em escrita criativa e revisão de textos autorais
  - Reunir e organizar narrativas femininas do território
  - Publicar uma coletânea final impressa e digital
  - Fortalecer redes de leitoras e escritoras locais
activities:
  - 8 oficinas presenciais de escrita criativa
  - Rodas de leitura mediadas
  - Curadoria e edição colaborativa dos textos
  - Lançamento público com sarau e distribuição gratuita da coletânea
results:
  - 32 mulheres participantes ao longo do ciclo
  - Coletânea publicada em formato impresso e e-book
  - Formação de rede permanente de escrita feminina na região
photoPrefix: Projeto_Mulheres_
documentPrefix: Certificado_Projeto_Mulheres_
---
O projeto nasce da constatação de que muitas mulheres da região mantêm
memórias, cadernos e cartas sem espaço institucional de circulação.
Propõe-se um lugar de escuta, escrita e publicação coletiva, aliando
literatura e produção editorial comunitária.
```

Create `content/projects/feira-do-livro.md`:
```markdown
---
title: Feira do Livro — Palavras da Fronteira
subtitle: Curadoria literária e mediação de público
year: "2023"
summary: >-
  Curadoria, produção e mediação de mesas de uma feira do livro dedicada a
  autoras e autores da região oeste do Paraná.
objectives:
  - Fomentar o mercado editorial regional
  - Aproximar autores e leitores em ambiente público e gratuito
  - Realizar mesas temáticas sobre literatura, memória e território
activities:
  - Curadoria de 12 autoras e autores convidados
  - Mediação de 6 mesas públicas
  - Oficinas paralelas de escrita e leitura
results:
  - Mais de 1.500 pessoas atendidas em três dias
  - Registro fotográfico e audiovisual do evento
  - Publicação de catálogo com biografia de autores convidados
photoPrefix: Feira_do_Livro_
documentPrefix: Certificado_Feira_
---
Iniciativa criada para dar visibilidade à produção literária local e
ampliar o acesso do público leitor a livros publicados por editoras
independentes da fronteira Brasil–Paraguai–Argentina.
```

Create `content/projects/seminario-literatura.md`:
```markdown
---
title: Seminário de Literatura e Memória
subtitle: Encontro acadêmico e formativo
year: "2022"
summary: >-
  Organização de seminário reunindo pesquisadoras, escritoras e mediadoras
  culturais em torno da relação entre literatura, memória oral e
  patrimônio.
objectives:
  - Debater metodologias de história oral aplicadas à literatura
  - Formar mediadoras culturais e professoras da rede pública
  - Publicar anais do seminário
activities:
  - Conferências e mesas-redondas
  - Oficinas de escrita e escuta
  - Publicação de anais em formato digital
results:
  - Participação de 120 inscritos
  - Anais publicados e disponibilizados em acesso aberto
  - Consolidação de rede regional de pesquisa em literatura e memória
photoPrefix: Seminario_Literatura_
documentPrefix: Certificado_Seminario_
---
Espaço de troca entre universidade, escola pública e coletivos culturais,
articulando pesquisa e prática em torno da memória social.
```

Create `content/projects/oficina-escrita.md`:
```markdown
---
title: Oficina de Escrita Criativa
subtitle: Formação de novas vozes
year: "2022"
summary: >-
  Ciclo continuado de oficinas de escrita criativa para adultos, dedicado à
  formação de novas vozes literárias na região.
objectives:
  - Desenvolver competências técnicas de escrita literária
  - Estimular a publicação de textos autorais
  - Construir comunidade de leitura crítica entre pares
activities:
  - Encontros semanais de escrita
  - Leituras compartilhadas e devolutivas
  - Produção de portfólio literário individual
results:
  - 20 participantes concluintes
  - 5 textos preparados para publicação em coletânea
  - Formação continuada de rede de escritoras iniciantes
photoPrefix: Oficina_Escrita_
documentPrefix: Certificado_Oficina_
---
Ação de formação livre para pessoas interessadas em desenvolver projetos
autorais, com acompanhamento individual e coletivo.
```

Note: the filename for each becomes the `slug`, matching today's explicit
`slug` values exactly (`mulheres-que-escrevem`, `feira-do-livro`,
`seminario-literatura`, `oficina-escrita`) — the route
`src/routes/projetos.$slug.tsx` needs no change.

- [ ] **Step 2: Rewrite `src/content/projects.ts` as a loader**

Replace the entire contents of `src/content/projects.ts` with:
```typescript
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
  .map(({ slug, title, subtitle, year, cover, summary, objectives, activities, results, photoPrefix, documentPrefix, body }) => ({
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
  }))
  .sort((a, b) => Number(b.year) - Number(a.year));

export const projectsBySlug = Object.fromEntries(projects.map((p) => [p.slug, p]));
```

- [ ] **Step 3: Verify**

Run:
```bash
cd /home/inasc/projects/luciani-portfolio
bun run build
bun run lint
bun run dev > /tmp/dev.log 2>&1 &
echo $! > /tmp/dev.pid
sleep 5
curl -s http://localhost:3000/projetos | grep -a -o "Mulheres que Escrevem"
curl -s http://localhost:3000/projetos/mulheres-que-escrevem | grep -a -o "32 mulheres participantes ao longo do ciclo"
curl -s http://localhost:3000/projetos/mulheres-que-escrevem | grep -a -o "O projeto nasce da constatação"
kill "$(cat /tmp/dev.pid)"
rm /tmp/dev.pid /tmp/dev.log
```
Expected: build/lint exit 0; the list page shows the project; the detail
page at `/projetos/mulheres-que-escrevem` renders both a `results` list item
and the `context` body text — confirming the slug-from-filename routing and
the frontmatter/body split both work.

- [ ] **Step 4: Commit**

```bash
cd /home/inasc/projects/luciani-portfolio
git add -A
git commit -m "Move projects content to content/projects/*.md"
```

---

### Task 6: Media (photos + documents) migration

**Files:**
- Create: `public/media/photos/clube-leitura.jpg`, `public/media/photos/ensaio-teatro-unila.jpg`
  (copied from `src/assets/media/`)
- Delete: `src/assets/media/clube-leitura.jpg`, `src/assets/media/ensaio-teatro-unila.jpg`
- Create: `content/media/photos/clube-leitura.md`, `content/media/photos/ensaio-teatro-unila.md`
- Create: `content/media/documents/certificado-antologia-psique.md`,
  `content/media/documents/certificado-mencao-honrosa.md`,
  `content/media/documents/certificado-proex-teatro.md`,
  `content/media/documents/declaracao-taup.md`,
  `content/media/documents/declaracao-mentoria.md`,
  `content/media/documents/diploma-graduacao.md`,
  `content/media/documents/diploma-mestrado.md` (7 files)
- Modify: `src/content/media.ts`

**Interfaces:**
- Consumes: `parseMarkdownCollection` from Task 1.
- Produces: `photos: Photo[]`, `documents: Document[]`, `photosByPrefix(prefix)`,
  `documentsByPrefix(prefix)`, `photosByCategory()` — all unchanged signatures. `Photo.url` and
  `Document.url` are now plain `/media/...` string paths instead of Vite asset imports.

- [ ] **Step 1: Move the two photo files to `public/`**

Run:
```bash
cd /home/inasc/projects/luciani-portfolio
mkdir -p public/media/photos
git mv src/assets/media/clube-leitura.jpg public/media/photos/clube-leitura.jpg
git mv src/assets/media/ensaio-teatro-unila.jpg public/media/photos/ensaio-teatro-unila.jpg
```

Expected: both files now live under `public/media/photos/`; `src/assets/media/`
is empty (leave the empty directory — do not force-remove it, git doesn't
track empty directories so it will simply disappear from `git status`).

- [ ] **Step 2: Create the 2 photo content files**

Create `content/media/photos/clube-leitura.md`:
```markdown
---
file: Clube_Leitura_01.jpg
image: clube-leitura.jpg
category: Comunidade
caption: Encontro do Clube de Leitura — outubro de 2019
---
```

Create `content/media/photos/ensaio-teatro-unila.md`:
```markdown
---
file: Ensaio_Teatro_UNILA_01.jpg
image: ensaio-teatro-unila.jpg
category: Produção Cultural
caption: Ensaio do grupo de teatro — UNILA
---
```

Note two distinct filename-like fields, both intentional: `file` keeps the
original descriptive-prefix convention used to match a photo to its project
(e.g. `Feira_do_Livro_01.jpg`, matched against `photoPrefix`) — it is
metadata, not a real path. `image` is the actual filename of the image as
dropped into `public/media/photos/` (including its real extension — jpg,
png, whatever she uploads), used to build the real `url`. This also means a
non-technical editor never has to figure out a "slug" — she just writes the
filename she used.

- [ ] **Step 3: Create the 7 document content files**

Create `content/media/documents/certificado-antologia-psique.md`:
```markdown
---
file: Certificado_Antologia_Psique.pdf
title: Certificado de Participação — E-Antologia PSIQUÊ
institution: Editora Fênixart
year: "2025"
---
```

Create `content/media/documents/certificado-mencao-honrosa.md`:
```markdown
---
file: Certificado_Mencao_Honrosa.pdf
title: Certificado de Menção Honrosa
institution: Concurso Literário Nacional
year: "2021"
---
```

Create `content/media/documents/certificado-proex-teatro.md`:
```markdown
---
file: Certificado_PROEX_Teatro.pdf
title: Certificado PROEX — Teatro UNILA
institution: UNILA — Pró-Reitoria de Extensão
year: "2022"
---
```

Create `content/media/documents/declaracao-taup.md`:
```markdown
---
file: Declaracao_TAUP.pdf
title: Declaração TAUP
institution: Projeto TAUP
year: "2023"
---
```

Create `content/media/documents/declaracao-mentoria.md`:
```markdown
---
file: Declaracao_Mentoria.pdf
title: Declaração de Mentoria
institution: Programa independente
year: "2024"
---
```

Create `content/media/documents/diploma-graduacao.md`:
```markdown
---
file: Diploma_Graduacao.pdf
title: Diploma — Graduação em Letras
institution: UNIOESTE
year: "2015"
---
```

Create `content/media/documents/diploma-mestrado.md`:
```markdown
---
file: Diploma_Mestrado.pdf
title: Diploma — Mestrado em Letras
institution: Pós-graduação em Letras
year: "2018"
---
```

All 7 keep `url: "#"` (no PDF uploaded yet) — handled as a schema default in
Step 4, not written into every file.

- [ ] **Step 4: Rewrite `src/content/media.ts` as a loader**

Replace the entire contents of `src/content/media.ts` with:
```typescript
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
```

- [ ] **Step 5: Verify**

Run:
```bash
cd /home/inasc/projects/luciani-portfolio
bun run build
bun run lint
bun run dev > /tmp/dev.log 2>&1 &
echo $! > /tmp/dev.pid
sleep 5
curl -s http://localhost:3000/galeria | grep -a -o "Encontro do Clube de Leitura"
curl -s http://localhost:3000/certificados | grep -a -o "Certificado de Participação — E-Antologia PSIQUÊ"
curl -sI http://localhost:3000/media/photos/clube-leitura.jpg | head -1
kill "$(cat /tmp/dev.pid)"
rm /tmp/dev.pid /tmp/dev.log
```
Expected: build/lint exit 0; both content strings found; the `curl -sI`
image request returns `HTTP/1.1 200 OK` (confirms the `public/media/photos/`
file is actually served at the URL the loader constructs).

- [ ] **Step 6: Commit**

```bash
cd /home/inasc/projects/luciani-portfolio
git add -A
git commit -m "Move media (photos, documents) content to content/media/*.md"
```

---

### Task 7: Page visibility (pages.yaml, nav, route guards, sitemap)

**Files:**
- Create: `content/pages.yaml`
- Create: `src/content/pages.ts`
- Modify: `src/components/SiteLayout.tsx`
- Modify: `src/routes/quem-sou.tsx`, `src/routes/trajetoria.tsx`, `src/routes/producao-literaria.tsx`,
  `src/routes/certificados.tsx`, `src/routes/galeria.tsx`, `src/routes/projetos.tsx`,
  `src/routes/competencias.tsx`, `src/routes/dossie.tsx`, `src/routes/contribuicao.tsx`,
  `src/routes/contato.tsx` (10 route files — one `beforeLoad` line each)
- Modify: `src/routes/sitemap[.]xml.ts`

**Interfaces:**
- Consumes: `parseYamlFile` from Task 1.
- Produces: `pages: { key: string; to: string; label: string; enabled: boolean; order: number }[]`
  (sorted by `order`), `isPageEnabled(key: string): boolean` from `src/content/pages.ts`.

- [ ] **Step 1: Create `content/pages.yaml`**

Create `content/pages.yaml` with every page currently in the nav, all
enabled, in their current display order:
```yaml
- key: quem-sou
  to: /quem-sou
  label: Quem Sou
  enabled: true
  order: 1
- key: trajetoria
  to: /trajetoria
  label: Trajetória
  enabled: true
  order: 2
- key: producao-literaria
  to: /producao-literaria
  label: Produção
  enabled: true
  order: 3
- key: projetos
  to: /projetos
  label: Projetos
  enabled: true
  order: 4
- key: galeria
  to: /galeria
  label: Galeria
  enabled: true
  order: 5
- key: certificados
  to: /certificados
  label: Certificados
  enabled: true
  order: 6
- key: competencias
  to: /competencias
  label: Competências
  enabled: true
  order: 7
- key: contribuicao
  to: /contribuicao
  label: Contribuição
  enabled: true
  order: 8
- key: dossie
  to: /dossie
  label: Dossiê
  enabled: true
  order: 9
- key: contato
  to: /contato
  label: Contato
  enabled: true
  order: 10
```

- [ ] **Step 2: Create `src/content/pages.ts`**

Create `src/content/pages.ts`:
```typescript
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
```

- [ ] **Step 3: Update `SiteLayout.tsx` to use the config-driven nav**

In `src/components/SiteLayout.tsx`, replace:
```typescript
import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { site } from "@/content/site";

const nav = [
  { to: "/", label: "Início" },
  { to: "/quem-sou", label: "Quem Sou" },
  { to: "/trajetoria", label: "Trajetória" },
  { to: "/producao-literaria", label: "Produção" },
  { to: "/projetos", label: "Projetos" },
  { to: "/galeria", label: "Galeria" },
  { to: "/certificados", label: "Certificados" },
  { to: "/competencias", label: "Competências" },
  { to: "/contribuicao", label: "Contribuição" },
  { to: "/dossie", label: "Dossiê" },
  { to: "/contato", label: "Contato" },
] as const;
```

With:
```typescript
import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { site } from "@/content/site";
import { pages } from "@/content/pages";

const nav = [
  { to: "/", label: "Início" },
  ...pages.filter((p) => p.enabled).map((p) => ({ to: p.to, label: p.label })),
];
```

No other line in `SiteLayout.tsx` changes — `nav.map(...)` (desktop nav,
mobile nav) and `nav.slice(1, 9)` (footer) already work against whatever
`nav` contains; with fewer enabled pages the footer's `slice(1, 9)` simply
includes fewer real entries, which is correct behavior (not a bug to fix
here).

- [ ] **Step 4: Add a `beforeLoad` guard to each of the 10 toggleable routes**

All 10 files share the exact same `createFileRoute("/path")({ head: () =>
({...}), component: X });` shape (confirmed by reading every one of them) —
each edit inserts one `beforeLoad` line between `head: () => ({...}),` and
`component: X,`, plus one new import line. Given below as a complete
before/after per file.

`src/routes/quem-sou.tsx` — replace:
```typescript
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { site } from "@/content/site";

export const Route = createFileRoute("/quem-sou")({
  head: () => ({
```
With:
```typescript
import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { site } from "@/content/site";
import { isPageEnabled } from "@/content/pages";

export const Route = createFileRoute("/quem-sou")({
  beforeLoad: () => {
    if (!isPageEnabled("quem-sou")) throw notFound();
  },
  head: () => ({
```

`src/routes/trajetoria.tsx` — replace:
```typescript
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { timeline } from "@/content/timeline";

export const Route = createFileRoute("/trajetoria")({
  head: () => ({
```
With:
```typescript
import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { timeline } from "@/content/timeline";
import { isPageEnabled } from "@/content/pages";

export const Route = createFileRoute("/trajetoria")({
  beforeLoad: () => {
    if (!isPageEnabled("trajetoria")) throw notFound();
  },
  head: () => ({
```

`src/routes/producao-literaria.tsx` — replace:
```typescript
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { books, bookCategoryLabel } from "@/content/books";

export const Route = createFileRoute("/producao-literaria")({
  head: () => ({
```
With:
```typescript
import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { books, bookCategoryLabel } from "@/content/books";
import { isPageEnabled } from "@/content/pages";

export const Route = createFileRoute("/producao-literaria")({
  beforeLoad: () => {
    if (!isPageEnabled("producao-literaria")) throw notFound();
  },
  head: () => ({
```

`src/routes/certificados.tsx` — replace:
```typescript
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { documents } from "@/content/media";
import { FileText } from "lucide-react";

export const Route = createFileRoute("/certificados")({
  head: () => ({
```
With:
```typescript
import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { documents } from "@/content/media";
import { FileText } from "lucide-react";
import { isPageEnabled } from "@/content/pages";

export const Route = createFileRoute("/certificados")({
  beforeLoad: () => {
    if (!isPageEnabled("certificados")) throw notFound();
  },
  head: () => ({
```

`src/routes/galeria.tsx` — replace:
```typescript
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { photos, photosByCategory, type Photo } from "@/content/media";

export const Route = createFileRoute("/galeria")({
  head: () => ({
```
With:
```typescript
import { createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { photos, photosByCategory, type Photo } from "@/content/media";
import { isPageEnabled } from "@/content/pages";

export const Route = createFileRoute("/galeria")({
  beforeLoad: () => {
    if (!isPageEnabled("galeria")) throw notFound();
  },
  head: () => ({
```

`src/routes/projetos.tsx` — replace:
```typescript
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { projects } from "@/content/projects";

export const Route = createFileRoute("/projetos")({
  head: () => ({
```
With:
```typescript
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { projects } from "@/content/projects";
import { isPageEnabled } from "@/content/pages";

export const Route = createFileRoute("/projetos")({
  beforeLoad: () => {
    if (!isPageEnabled("projetos")) throw notFound();
  },
  head: () => ({
```

`src/routes/competencias.tsx` — replace:
```typescript
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { competencies } from "@/content/competencies";

export const Route = createFileRoute("/competencias")({
  head: () => ({
```
With:
```typescript
import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { competencies } from "@/content/competencies";
import { isPageEnabled } from "@/content/pages";

export const Route = createFileRoute("/competencias")({
  beforeLoad: () => {
    if (!isPageEnabled("competencias")) throw notFound();
  },
  head: () => ({
```

`src/routes/dossie.tsx` — replace:
```typescript
import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { indicators, site } from "@/content/site";
import { timeline } from "@/content/timeline";
import { books, bookCategoryLabel } from "@/content/books";
import { projects } from "@/content/projects";
import { documents } from "@/content/media";
import { competencies } from "@/content/competencies";
import { Printer } from "lucide-react";

export const Route = createFileRoute("/dossie")({
  head: () => ({
```
With:
```typescript
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { indicators, site } from "@/content/site";
import { timeline } from "@/content/timeline";
import { books, bookCategoryLabel } from "@/content/books";
import { projects } from "@/content/projects";
import { documents } from "@/content/media";
import { competencies } from "@/content/competencies";
import { isPageEnabled } from "@/content/pages";
import { Printer } from "lucide-react";

export const Route = createFileRoute("/dossie")({
  beforeLoad: () => {
    if (!isPageEnabled("dossie")) throw notFound();
  },
  head: () => ({
```

`src/routes/contribuicao.tsx` — replace:
```typescript
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/contribuicao")({
  head: () => ({
```
With:
```typescript
import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { isPageEnabled } from "@/content/pages";

export const Route = createFileRoute("/contribuicao")({
  beforeLoad: () => {
    if (!isPageEnabled("contribuicao")) throw notFound();
  },
  head: () => ({
```

`src/routes/contato.tsx` — replace:
```typescript
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { site } from "@/content/site";

export const Route = createFileRoute("/contato")({
  head: () => ({
```
With:
```typescript
import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { site } from "@/content/site";
import { isPageEnabled } from "@/content/pages";

export const Route = createFileRoute("/contato")({
  beforeLoad: () => {
    if (!isPageEnabled("contato")) throw notFound();
  },
  head: () => ({
```

Note: `/projetos/$slug` is intentionally NOT guarded here — if `projetos`
itself is disabled, hiding the list page is enough; the plan doesn't guard
every dynamic detail page individually, since there's no nav entry pointing
at any of them independently of the list page.

- [ ] **Step 5: Update the sitemap to use the same config**

In `src/routes/sitemap[.]xml.ts`, replace:
```typescript
import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { projects } from "@/content/projects";

const BASE_URL = "";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const staticPaths = [
          "/",
          "/quem-sou",
          "/trajetoria",
          "/producao-literaria",
          "/projetos",
          "/galeria",
          "/certificados",
          "/competencias",
          "/contribuicao",
          "/contato",
          "/dossie",
        ];
        const projectPaths = projects.map((p) => `/projetos/${p.slug}`);
```

With:
```typescript
import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { projects } from "@/content/projects";
import { pages } from "@/content/pages";

const BASE_URL = "";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const staticPaths = ["/", ...pages.filter((p) => p.enabled).map((p) => p.to)];
        const projectPaths = projects.map((p) => `/projetos/${p.slug}`);
```

(`BASE_URL` stays `""` here — the GitHub Pages deployment spec/plan updates
it separately.) Everything below this point in the file (the `.map(...)`
building `urls`, the XML response) is unchanged.

- [ ] **Step 6: Verify**

Run:
```bash
cd /home/inasc/projects/luciani-portfolio
bun run build
bun run lint
bun run dev > /tmp/dev.log 2>&1 &
echo $! > /tmp/dev.pid
sleep 5
curl -s http://localhost:3000/ | grep -a -o "Quem Sou"
curl -s http://localhost:3000/sitemap.xml | grep -a -o "<loc></loc>" # should print nothing (no empty locs)
curl -s http://localhost:3000/sitemap.xml | grep -a -c "<url>"
kill "$(cat /tmp/dev.pid)"
rm /tmp/dev.pid /tmp/dev.log
```
Expected: build/lint exit 0; nav shows "Quem Sou"; sitemap has 15 `<url>`
entries (1 home + 10 pages + 4 project detail pages).

Then test the disable path — temporarily flip one page off, confirm it
disappears and 404s, then restore it:
```bash
cd /home/inasc/projects/luciani-portfolio
sed -i '/key: contribuicao/,/order: 8/ s/enabled: true/enabled: false/' content/pages.yaml
bun run dev > /tmp/dev.log 2>&1 &
echo $! > /tmp/dev.pid
sleep 5
curl -s http://localhost:3000/ | grep -a -c "Contribuição"   # expect 0
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/contribuicao   # expect 404
kill "$(cat /tmp/dev.pid)"
rm /tmp/dev.pid /tmp/dev.log
git checkout -- content/pages.yaml
```
Expected: nav count is `0` (link gone), direct navigation returns `404`,
then the file is restored to all-enabled before committing.

- [ ] **Step 7: Commit**

```bash
cd /home/inasc/projects/luciani-portfolio
git add -A
git commit -m "Add config-driven page visibility (content/pages.yaml)"
```

---

## Out of scope (per spec)

- A generic new-page-type template/builder
- Explicit `project:` reference field replacing filename-prefix media matching
- Live/instant content updates without a rebuild (see the GitHub Pages
  deployment plan for how rebuilds are triggered)
