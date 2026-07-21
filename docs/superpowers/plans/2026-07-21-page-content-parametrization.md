# Page Content & Copy Parametrization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move every remaining hardcoded page header (kicker/title/lead) and long-form prose block (biography, dossiê resumo, contribuição pillars) out of `.tsx` files into the `content/` directory, reusing the existing loader pattern (`parseYamlFile`/`parseMarkdownCollection`), so a non-technical editor can change page copy without touching code.

**Architecture:** A new `content/pages/*.md` collection (one file per page, frontmatter `kicker`/`title`/`lead` + optional Markdown body) is read by a new `src/content/pageContent.ts` loader exposing `getPageHeader(key)` and `getPageBody(key)`. A new `content/contribuicao/*.md` collection (same shape as `content/competencies/*.md`) holds the 5 "pillars". `react-markdown` renders the new long-form bodies (paragraphs + `**bold**`/`*italic*`) through a small shared `MarkdownContent` component — verified by hand (rendered to static HTML) to produce sibling `<p>` tags with no wrapping element, so it composes correctly with the existing `space-y-6` container classes. No test runner exists in this project — verification follows the established convention: `bun run build`, `bun run lint`, and a dev-server smoke test with `curl`.

**Tech Stack:** TanStack Start, Vite 8, `react-markdown` (new), `zod`/`gray-matter` (existing, via `src/content/_lib/parse.ts`).

## Global Constraints

- Every value transcribed into a new content file must exactly match the current hardcoded string in the `.tsx` file it replaces — this is a lossless migration, not a copy rewrite.
- Dossiê's 7 numbered section titles ("1. Resumo da trajetória", etc.) and all UI microcopy/CTA labels ("Gerar portfólio em PDF", "Abrir capítulo →", "Início", etc.) stay hardcoded — out of scope (confirmed in the spec).
- Existing single-paragraph content bodies (`book.synopsis`, `project.context`, `competency.description`) are untouched — `MarkdownContent` is used only for the new bodies this plan introduces.
- No `git push`. Each task ends with exactly one commit in this repo.
- Spec: `docs/superpowers/specs/2026-07-21-page-content-parametrization-design.md`

---

### Task 1: `pageContent.ts` loader + the 7 simplest page headers

**Files:**
- Create: `content/pages/certificados.md`, `content/pages/competencias.md`, `content/pages/contato.md`, `content/pages/galeria.md`, `content/pages/producao-literaria.md`, `content/pages/projetos.md`, `content/pages/trajetoria.md`
- Create: `src/content/pageContent.ts`
- Modify: `src/routes/certificados.tsx`, `src/routes/competencias.tsx`, `src/routes/contato.tsx`, `src/routes/galeria.tsx`, `src/routes/producao-literaria.tsx`, `src/routes/projetos.tsx`, `src/routes/trajetoria.tsx`

**Interfaces:**
- Consumes: `parseMarkdownCollection` from `src/content/_lib/parse.ts` (existing).
- Produces: `getPageHeader(key: string): { kicker: string; title: string; lead: string }` (throws if the file is missing or any of the three fields is absent) and `getPageBody(key: string): string` (returns `""` if absent) from `src/content/pageContent.ts` — every later task in this plan imports from here.

- [ ] **Step 1: Create the 7 page-header content files**

Create `content/pages/certificados.md`:
```markdown
---
kicker: Biblioteca Documental
title: Certificados
lead: Documentos oficiais, diplomas e declarações — organizados para consulta rápida por comissões de editais.
---
```

Create `content/pages/competencias.md`:
```markdown
---
kicker: Capacidades Técnicas
title: Competências
lead: Um conjunto de saberes desenvolvidos entre a universidade, a escrita e a produção cultural na fronteira.
---
```

Create `content/pages/contato.md`:
```markdown
---
kicker: Correspondência
title: Contato
lead: Para propostas culturais, colaborações editoriais e convites institucionais.
---
```

Create `content/pages/galeria.md`:
```markdown
---
kicker: Registro Visual
title: Galeria
lead: Um catálogo visual da atuação cultural, organizado por categoria.
---
```

Create `content/pages/producao-literaria.md`:
```markdown
---
kicker: Capítulo III · Estante
title: Produção literária
lead: A estante da autora — livros, antologias, crônicas, poesia, artigos e capítulos.
---
```

Create `content/pages/projetos.md`:
```markdown
---
kicker: Capítulo IV · Realizações
title: Projetos culturais
lead: Iniciativas em literatura, memória e patrimônio — cada projeto reúne contexto, atividades, resultados e documentos.
---
```

Create `content/pages/trajetoria.md`:
```markdown
---
kicker: Capítulo II · Cronologia
title: Trajetória cultural
lead: Uma linha do tempo comentada — formação, publicações, projetos e participações.
---
```

- [ ] **Step 2: Create `src/content/pageContent.ts`**

Create `src/content/pageContent.ts`:
```typescript
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
```

- [ ] **Step 3: Update the 7 route files to use `getPageHeader`**

`src/routes/certificados.tsx` — replace:
```typescript
import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { documents } from "@/content/media";
import { FileText } from "lucide-react";
import { isPageEnabled } from "@/content/pages";
```
With:
```typescript
import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { documents } from "@/content/media";
import { FileText } from "lucide-react";
import { isPageEnabled } from "@/content/pages";
import { getPageHeader } from "@/content/pageContent";

const header = getPageHeader("certificados");
```
And replace:
```typescript
      <PageHeader
        kicker="Biblioteca Documental"
        title="Certificados"
        lead="Documentos oficiais, diplomas e declarações — organizados para consulta rápida por comissões de editais."
      />
```
With:
```typescript
      <PageHeader kicker={header.kicker} title={header.title} lead={header.lead} />
```

`src/routes/competencias.tsx` — replace:
```typescript
import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { competencies } from "@/content/competencies";
import { isPageEnabled } from "@/content/pages";
```
With:
```typescript
import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { competencies } from "@/content/competencies";
import { isPageEnabled } from "@/content/pages";
import { getPageHeader } from "@/content/pageContent";

const header = getPageHeader("competencias");
```
And replace:
```typescript
      <PageHeader
        kicker="Capacidades Técnicas"
        title="Competências"
        lead="Um conjunto de saberes desenvolvidos entre a universidade, a escrita e a produção cultural na fronteira."
      />
```
With:
```typescript
      <PageHeader kicker={header.kicker} title={header.title} lead={header.lead} />
```

`src/routes/contato.tsx` — replace:
```typescript
import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { site } from "@/content/site";
import { isPageEnabled } from "@/content/pages";
```
With:
```typescript
import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { site } from "@/content/site";
import { isPageEnabled } from "@/content/pages";
import { getPageHeader } from "@/content/pageContent";

const header = getPageHeader("contato");
```
And replace:
```typescript
      <PageHeader
        kicker="Correspondência"
        title="Contato"
        lead="Para propostas culturais, colaborações editoriais e convites institucionais."
      />
```
With:
```typescript
      <PageHeader kicker={header.kicker} title={header.title} lead={header.lead} />
```

`src/routes/galeria.tsx` — replace:
```typescript
import { createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { photos, photosByCategory, type Photo } from "@/content/media";
import { isPageEnabled } from "@/content/pages";
```
With:
```typescript
import { createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { photos, photosByCategory, type Photo } from "@/content/media";
import { isPageEnabled } from "@/content/pages";
import { getPageHeader } from "@/content/pageContent";

const header = getPageHeader("galeria");
```
And replace:
```typescript
      <PageHeader
        kicker="Registro Visual"
        title="Galeria"
        lead="Um catálogo visual da atuação cultural, organizado por categoria."
      />
```
With:
```typescript
      <PageHeader kicker={header.kicker} title={header.title} lead={header.lead} />
```

`src/routes/producao-literaria.tsx` — replace:
```typescript
import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { books, bookCategoryLabel } from "@/content/books";
import { isPageEnabled } from "@/content/pages";
```
With:
```typescript
import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { books, bookCategoryLabel } from "@/content/books";
import { isPageEnabled } from "@/content/pages";
import { getPageHeader } from "@/content/pageContent";

const header = getPageHeader("producao-literaria");
```
And replace:
```typescript
      <PageHeader
        kicker="Capítulo III · Estante"
        title="Produção literária"
        lead="A estante da autora — livros, antologias, crônicas, poesia, artigos e capítulos."
      />
```
With:
```typescript
      <PageHeader kicker={header.kicker} title={header.title} lead={header.lead} />
```

`src/routes/projetos.tsx` — replace:
```typescript
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { projects } from "@/content/projects";
import { isPageEnabled } from "@/content/pages";
```
With:
```typescript
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { projects } from "@/content/projects";
import { isPageEnabled } from "@/content/pages";
import { getPageHeader } from "@/content/pageContent";

const header = getPageHeader("projetos");
```
And replace:
```typescript
      <PageHeader
        kicker="Capítulo IV · Realizações"
        title="Projetos culturais"
        lead="Iniciativas em literatura, memória e patrimônio — cada projeto reúne contexto, atividades, resultados e documentos."
      />
```
With:
```typescript
      <PageHeader kicker={header.kicker} title={header.title} lead={header.lead} />
```

`src/routes/trajetoria.tsx` — replace:
```typescript
import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { timeline } from "@/content/timeline";
import { isPageEnabled } from "@/content/pages";
```
With:
```typescript
import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { timeline } from "@/content/timeline";
import { isPageEnabled } from "@/content/pages";
import { getPageHeader } from "@/content/pageContent";

const header = getPageHeader("trajetoria");
```
And replace:
```typescript
      <PageHeader
        kicker="Capítulo II · Cronologia"
        title="Trajetória cultural"
        lead="Uma linha do tempo comentada — formação, publicações, projetos e participações."
      />
```
With:
```typescript
      <PageHeader kicker={header.kicker} title={header.title} lead={header.lead} />
```

- [ ] **Step 4: Verify**

Run:
```bash
cd /home/inasc/projects/luciani-portfolio
bun run build
bun run lint
bun run dev > /tmp/dev.log 2>&1 &
echo $! > /tmp/dev.pid
sleep 5
curl -s http://localhost:3000/certificados | grep -a -o "Biblioteca Documental"
curl -s http://localhost:3000/contato | grep -a -o "Para propostas culturais, colaborações editoriais e convites institucionais."
curl -s http://localhost:3000/trajetoria | grep -a -o "Capítulo II · Cronologia"
kill "$(cat /tmp/dev.pid)"
rm /tmp/dev.pid /tmp/dev.log
```
Expected: build/lint exit 0; all three `grep -a -o` calls print their match, confirming the header content now flows through `content/pages/*.md` → `getPageHeader` → `PageHeader` unchanged.

- [ ] **Step 5: Commit**

```bash
cd /home/inasc/projects/luciani-portfolio
git add -A
git commit -m "Move 7 page headers to content/pages/*.md"
```

---

### Task 2: `quem-sou` — biography via `MarkdownContent`

**Files:**
- Create: `content/pages/quem-sou.md`
- Create: `src/components/MarkdownContent.tsx`
- Modify: `package.json` (add `react-markdown` dependency)
- Modify: `src/routes/quem-sou.tsx`

**Interfaces:**
- Consumes: `getPageHeader`, `getPageBody` from Task 1 (`src/content/pageContent.ts`).
- Produces: `MarkdownContent` component (`src/components/MarkdownContent.tsx`), signature `({ children }: { children: string }) => JSX.Element` — renders `children` as Markdown, with `<strong>` styled via `font-medium` to match the site's existing bold-text convention. Later tasks (contribuição, dossiê) import this same component.

- [ ] **Step 1: Install `react-markdown`**

Run: `cd /home/inasc/projects/luciani-portfolio && bun add react-markdown`

Expected: exits 0; `package.json` lists `react-markdown` under `dependencies`.

- [ ] **Step 2: Create `src/components/MarkdownContent.tsx`**

Create `src/components/MarkdownContent.tsx`:
```typescript
import ReactMarkdown from "react-markdown";
import type { ReactNode } from "react";

export function MarkdownContent({ children }: { children: string }) {
  return (
    <ReactMarkdown
      components={{
        strong: ({ children }: { children?: ReactNode }) => (
          <strong className="font-medium">{children}</strong>
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
```
This has been hand-verified (rendered via `react-dom/server` to static HTML) to output sibling `<p>` tags with no wrapping element — it composes correctly with the `space-y-6` container in `quem-sou.tsx`.

- [ ] **Step 3: Create `content/pages/quem-sou.md`**

Create `content/pages/quem-sou.md`:
```markdown
---
kicker: Capítulo I · Biografia
title: Quem sou
lead: Uma vida entre livros, palavras e o rio que atravessa três países.
---
Nasci em **Foz do Iguaçu**, cidade de fronteira onde as línguas se cruzam e
onde a paisagem — o rio, a mata, as pontes — sempre pediu palavra. A
literatura chegou cedo, como escuta: primeiro, das mulheres da família;
depois, dos livros que descobria na biblioteca pública e nas estantes
emprestadas.

Formei-me em **Letras Português/Espanhol pela UNIOESTE** e, mais tarde,
avancei para o mestrado, dedicando minha pesquisa à representação feminina
na literatura contemporânea. Foi ali que compreendi que escrever, para mim,
seria também um gesto de organização coletiva: reunir, editar, publicar e
criar espaços para que outras vozes emergissem.

Ao longo dos últimos anos, tenho articulado três frentes: *escrita autoral*
— em poesia, crônica e ensaio —, *pesquisa da memória local* em torno das
mulheres da fronteira, e *produção cultural*, através da concepção e
coordenação de oficinas, seminários, feiras do livro e coletâneas.

Minha atuação parte do entendimento de que a literatura é patrimônio:
preserva, atravessa e devolve identidade a comunidades que raramente se veem
representadas. Por isso, cada projeto é também um documento — um modo de
guardar a cidade e as pessoas que a escrevem, todos os dias, sem
necessariamente ocupar páginas.

Este portfólio reúne parte desse percurso. Foi organizado para servir como
leitura sensível e, ao mesmo tempo, como material institucional a comissões
de editais públicos de fomento à cultura.
```

- [ ] **Step 4: Update `src/routes/quem-sou.tsx`**

Replace:
```typescript
import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { site } from "@/content/site";
import { isPageEnabled } from "@/content/pages";
```
With:
```typescript
import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { MarkdownContent } from "@/components/MarkdownContent";
import { site } from "@/content/site";
import { isPageEnabled } from "@/content/pages";
import { getPageHeader, getPageBody } from "@/content/pageContent";

const header = getPageHeader("quem-sou");
```

Replace the entire `QuemSou` function body:
```typescript
function QuemSou() {
  return (
    <>
      <PageHeader
        kicker="Capítulo I · Biografia"
        title="Quem sou"
        lead="Uma vida entre livros, palavras e o rio que atravessa três países."
      />
      <article className="mx-auto max-w-3xl px-6 pb-24 font-serif text-lg leading-relaxed text-foreground/90 space-y-6">
        <p className="drop-cap">{site.presentation}</p>
        <p>
          Nasci em <strong className="font-medium">Foz do Iguaçu</strong>, cidade de fronteira onde
          as línguas se cruzam e onde a paisagem — o rio, a mata, as pontes — sempre pediu palavra.
          A literatura chegou cedo, como escuta: primeiro, das mulheres da família; depois, dos
          livros que descobria na biblioteca pública e nas estantes emprestadas.
        </p>
        <p>
          Formei-me em{" "}
          <strong className="font-medium">Letras Português/Espanhol pela UNIOESTE</strong> e, mais
          tarde, avancei para o mestrado, dedicando minha pesquisa à representação feminina na
          literatura contemporânea. Foi ali que compreendi que escrever, para mim, seria também um
          gesto de organização coletiva: reunir, editar, publicar e criar espaços para que outras
          vozes emergissem.
        </p>
        <p>
          Ao longo dos últimos anos, tenho articulado três frentes:
          <em> escrita autoral </em> — em poesia, crônica e ensaio —,
          <em> pesquisa da memória local </em> em torno das mulheres da fronteira, e{" "}
          <em> produção cultural </em>, através da concepção e coordenação de oficinas, seminários,
          feiras do livro e coletâneas.
        </p>
        <p>
          Minha atuação parte do entendimento de que a literatura é patrimônio: preserva, atravessa
          e devolve identidade a comunidades que raramente se veem representadas. Por isso, cada
          projeto é também um documento — um modo de guardar a cidade e as pessoas que a escrevem,
          todos os dias, sem necessariamente ocupar páginas.
        </p>
        <p>
          Este portfólio reúne parte desse percurso. Foi organizado para servir como leitura
          sensível e, ao mesmo tempo, como material institucional a comissões de editais públicos de
          fomento à cultura.
        </p>
      </article>
    </>
  );
}
```
With:
```typescript
function QuemSou() {
  return (
    <>
      <PageHeader kicker={header.kicker} title={header.title} lead={header.lead} />
      <article className="mx-auto max-w-3xl px-6 pb-24 font-serif text-lg leading-relaxed text-foreground/90 space-y-6">
        <p className="drop-cap">{site.presentation}</p>
        <MarkdownContent>{getPageBody("quem-sou")}</MarkdownContent>
      </article>
    </>
  );
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
curl -s http://localhost:3000/quem-sou | grep -a -o "<strong[^>]*>Foz do Iguaçu</strong>"
curl -s http://localhost:3000/quem-sou | grep -a -o "<em>escrita autoral</em>"
curl -s http://localhost:3000/quem-sou | grep -a -c "<p"
kill "$(cat /tmp/dev.pid)"
rm /tmp/dev.pid /tmp/dev.log
```
Expected: build/lint exit 0; both `<strong>`/`<em>` matches print exactly once each (confirming Markdown emphasis rendered, `font-medium` class present on the bold term); the `<p` count is at least 6 (1 drop-cap + 5 biography paragraphs).

- [ ] **Step 6: Commit**

```bash
cd /home/inasc/projects/luciani-portfolio
git add -A
git commit -m "Move quem-sou biography to content/pages/quem-sou.md via MarkdownContent"
```

---

### Task 3: `contribuicao` — header + pillars collection

**Files:**
- Create: `content/pages/contribuicao.md`
- Create: `content/contribuicao/01-preservacao-da-memoria.md`, `content/contribuicao/02-fortalecimento-da-literatura.md`, `content/contribuicao/03-valorizacao-das-mulheres.md`, `content/contribuicao/04-identidade-regional.md`, `content/contribuicao/05-democratizacao-da-cultura.md`
- Create: `src/content/contribuicao.ts`
- Modify: `src/routes/contribuicao.tsx`

**Interfaces:**
- Consumes: `getPageHeader` from Task 1; `parseMarkdownCollection` (existing); `MarkdownContent` from Task 2.
- Produces: `pillars: { kicker: string; title: string; text: string }[]` from `src/content/contribuicao.ts`, sorted by filename (roman-numeral order I–V).

- [ ] **Step 1: Create `content/pages/contribuicao.md`**

Create `content/pages/contribuicao.md`:
```markdown
---
kicker: Manifesto
title: Contribuição cultural
lead: Cinco eixos que orientam a atuação da autora e sua relação com a política pública de cultura.
---
```

- [ ] **Step 2: Create the 5 pillar files**

Create `content/contribuicao/01-preservacao-da-memoria.md`:
```markdown
---
kicker: "I"
title: Preservação da memória
---
Cada projeto é também um arquivo: registrar histórias de vida, cadernos,
fotografias e cartas é impedir que a cidade esqueça de si mesma.
```

Create `content/contribuicao/02-fortalecimento-da-literatura.md`:
```markdown
---
kicker: "II"
title: Fortalecimento da literatura
---
A publicação de coletâneas, a mediação de leituras e a formação de
escritoras iniciantes ampliam a rede literária regional e a circulação de
novos autores.
```

Create `content/contribuicao/03-valorizacao-das-mulheres.md`:
```markdown
---
kicker: "III"
title: Valorização das mulheres
---
Perspectivas femininas são o eixo da pesquisa e da escrita — mulheres da
fronteira, mães, avós, professoras, poetas — narradoras, todas.
```

Create `content/contribuicao/04-identidade-regional.md`:
```markdown
---
kicker: "IV"
title: Identidade regional
---
A tríplice fronteira é território literário: sua paisagem, suas línguas e
suas travessias compõem uma identidade cultural que precisa de espaço
público.
```

Create `content/contribuicao/05-democratizacao-da-cultura.md`:
```markdown
---
kicker: "V"
title: Democratização da cultura
---
Ações gratuitas, acessíveis e realizadas em espaços públicos garantem que a
literatura chegue a quem, historicamente, esteve fora do circuito cultural
formal.
```

- [ ] **Step 3: Create `src/content/contribuicao.ts`**

Create `src/content/contribuicao.ts`:
```typescript
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
```

- [ ] **Step 4: Update `src/routes/contribuicao.tsx`**

Replace the entire file contents:
```typescript
import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { MarkdownContent } from "@/components/MarkdownContent";
import { isPageEnabled } from "@/content/pages";
import { getPageHeader } from "@/content/pageContent";
import { pillars } from "@/content/contribuicao";

const header = getPageHeader("contribuicao");

export const Route = createFileRoute("/contribuicao")({
  beforeLoad: () => {
    if (!isPageEnabled("contribuicao")) throw notFound();
  },
  head: () => ({
    meta: [
      { title: "Contribuição Cultural — Luciani Heindrickson da Silva" },
      {
        name: "description",
        content:
          "Como a atuação da autora contribui para a preservação da memória, o fortalecimento da literatura, a valorização das mulheres e a democratização da cultura.",
      },
      { property: "og:title", content: "Contribuição Cultural — Luciani Heindrickson da Silva" },
      {
        property: "og:description",
        content:
          "Uma reflexão sobre a contribuição da autora à memória, literatura e cultura regional.",
      },
    ],
  }),
  component: Contribuicao,
});

function Contribuicao() {
  return (
    <>
      <PageHeader kicker={header.kicker} title={header.title} lead={header.lead} />
      <section className="mx-auto max-w-3xl px-6 pb-24 space-y-14">
        {pillars.map((p) => (
          <article key={p.kicker} className="grid grid-cols-[64px_1fr] gap-6">
            <div className="font-display text-5xl text-clay leading-none">{p.kicker}</div>
            <div>
              <h3 className="font-display text-2xl">{p.title}</h3>
              <div className="mt-3 font-serif text-lg leading-relaxed text-foreground/90">
                <MarkdownContent>{p.text}</MarkdownContent>
              </div>
            </div>
          </article>
        ))}
      </section>
    </>
  );
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
curl -s http://localhost:3000/contribuicao | grep -a -o "Manifesto"
curl -s http://localhost:3000/contribuicao | grep -a -o "Preservação da memória"
curl -s http://localhost:3000/contribuicao | grep -a -o "Democratização da cultura"
kill "$(cat /tmp/dev.pid)"
rm /tmp/dev.pid /tmp/dev.log
```
Expected: build/lint exit 0; all three matches print; on the page, "Preservação da memória" (pillar I) appears before "Democratização da cultura" (pillar V) — confirming filename-based sort order is preserved.

- [ ] **Step 6: Commit**

```bash
cd /home/inasc/projects/luciani-portfolio
git add -A
git commit -m "Move contribuicao header and pillars to content/"
```

---

### Task 4: `dossie` — resumo paragraph via `MarkdownContent`

**Files:**
- Create: `content/pages/dossie.md`
- Modify: `src/routes/dossie.tsx`

**Interfaces:**
- Consumes: `getPageBody` from Task 1; `MarkdownContent` from Task 2. (`dossie` has no `PageHeader` — its frontmatter is intentionally empty, only `body` is used.)

- [ ] **Step 1: Create `content/pages/dossie.md`**

Create `content/pages/dossie.md`:
```markdown
---
---
Formada em Letras Português/Espanhol pela UNIOESTE, com mestrado em Letras.
Atua há mais de uma década na articulação entre escrita autoral, pesquisa
da memória local e produção cultural, tendo organizado seminários, feiras
do livro, oficinas de escrita e coletâneas literárias voltadas à
valorização das narrativas femininas e do patrimônio da tríplice
fronteira.
```
(Empty frontmatter block — hand-verified with `gray-matter` to parse as `data: {}` and the remaining text as `body`.)

- [ ] **Step 2: Update `src/routes/dossie.tsx`**

Replace:
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
import { getPageBody } from "@/content/pageContent";
import { MarkdownContent } from "@/components/MarkdownContent";
import { Printer } from "lucide-react";
```

Replace:
```typescript
      <Section title="7. Currículo condensado">
        <p className="font-serif leading-relaxed">
          Formada em Letras Português/Espanhol pela UNIOESTE, com mestrado em Letras. Atua há mais
          de uma década na articulação entre escrita autoral, pesquisa da memória local e produção
          cultural, tendo organizado seminários, feiras do livro, oficinas de escrita e coletâneas
          literárias voltadas à valorização das narrativas femininas e do patrimônio da tríplice
          fronteira.
        </p>
      </Section>
```
With:
```typescript
      <Section title="7. Currículo condensado">
        <div className="font-serif leading-relaxed">
          <MarkdownContent>{getPageBody("dossie")}</MarkdownContent>
        </div>
      </Section>
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
curl -s http://localhost:3000/dossie | grep -a -o "Currículo condensado"
curl -s http://localhost:3000/dossie | grep -a -o "Atua há mais de uma década"
kill "$(cat /tmp/dev.pid)"
rm /tmp/dev.pid /tmp/dev.log
```
Expected: build/lint exit 0; both matches print — the numbered section title (still hardcoded, per scope) and the resumo text (now sourced from content) both render correctly on the same page.

- [ ] **Step 4: Commit**

```bash
cd /home/inasc/projects/luciani-portfolio
git add -A
git commit -m "Move dossie resumo paragraph to content/pages/dossie.md"
```

---

### Task 5: Homepage — `site.yaml` additions + role bug fix

**Files:**
- Modify: `content/site.yaml`
- Modify: `src/content/site.ts`
- Modify: `src/routes/index.tsx`

**Interfaces:**
- Consumes: `parseYamlFile` (existing).
- Produces: `site.presentationHeading: string` and `homeChapters: { to: string; kicker: string; title: string; desc: string }[]`, new exports from `src/content/site.ts`, alongside the existing `site`/`indicators` exports (unchanged).

- [ ] **Step 1: Add the two new fields to `content/site.yaml`**

Append to `content/site.yaml` (after the existing `indicators:` block):
```yaml
presentationHeading: Uma escrita entre memória, literatura e fronteira.
homeChapters:
  - to: /trajetoria
    kicker: Capítulo I
    title: Trajetória cultural
    desc: Uma linha do tempo comentada: formação, projetos, publicações e participações.
  - to: /producao-literaria
    kicker: Capítulo II
    title: Produção literária
    desc: A estante da autora — livros, antologias, crônicas, poesia e artigos.
  - to: /projetos
    kicker: Capítulo III
    title: Projetos culturais
    desc: Iniciativas realizadas, com contexto, atividades, resultados e documentos.
```

- [ ] **Step 2: Update `src/content/site.ts`**

Replace:
```typescript
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
```
With:
```typescript
const IndicatorSchema = z.object({
  label: z.string(),
  value: z.string(),
});

const HomeChapterSchema = z.object({
  to: z.string(),
  kicker: z.string(),
  title: z.string(),
  desc: z.string(),
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
  presentationHeading: z.string(),
  indicators: z.array(IndicatorSchema),
  homeChapters: z.array(HomeChapterSchema),
});
```

Replace:
```typescript
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
With:
```typescript
export const site = {
  author: data.author,
  role: data.role,
  city: data.city,
  email: data.email,
  phone: data.phone,
  instagram: data.instagram,
  tagline: data.tagline,
  presentation: data.presentation,
  presentationHeading: data.presentationHeading,
};

export const indicators: { label: string; value: string }[] = data.indicators;

export const homeChapters: { to: string; kicker: string; title: string; desc: string }[] =
  data.homeChapters;
```

- [ ] **Step 3: Update `src/routes/index.tsx`**

Replace:
```typescript
import { createFileRoute, Link } from "@tanstack/react-router";
import heroImage from "@/assets/hero-library.jpg";
import { indicators, site } from "@/content/site";
```
With:
```typescript
import { createFileRoute, Link } from "@tanstack/react-router";
import heroImage from "@/assets/hero-library.jpg";
import { homeChapters, indicators, site } from "@/content/site";
```

Replace:
```typescript
            <p
              className="mt-6 font-serif italic text-lg sm:text-xl"
              style={{ color: "var(--sand)" }}
            >
              Escritora · Pesquisadora da memória local · Produtora Cultural
            </p>
```
With:
```typescript
            <p
              className="mt-6 font-serif italic text-lg sm:text-xl"
              style={{ color: "var(--sand)" }}
            >
              {site.role}
            </p>
```

Replace:
```typescript
        <h2 className="mt-6 text-center font-display text-4xl md:text-5xl">
          Uma escrita entre memória, literatura e fronteira.
        </h2>
```
With:
```typescript
        <h2 className="mt-6 text-center font-display text-4xl md:text-5xl">
          {site.presentationHeading}
        </h2>
```

Replace:
```typescript
          {[
            {
              to: "/trajetoria",
              kicker: "Capítulo I",
              title: "Trajetória cultural",
              desc: "Uma linha do tempo comentada: formação, projetos, publicações e participações.",
            },
            {
              to: "/producao-literaria",
              kicker: "Capítulo II",
              title: "Produção literária",
              desc: "A estante da autora — livros, antologias, crônicas, poesia e artigos.",
            },
            {
              to: "/projetos",
              kicker: "Capítulo III",
              title: "Projetos culturais",
              desc: "Iniciativas realizadas, com contexto, atividades, resultados e documentos.",
            },
          ].map((c) => (
```
With:
```typescript
          {homeChapters.map((c) => (
```

- [ ] **Step 4: Verify**

Run:
```bash
cd /home/inasc/projects/luciani-portfolio
bun run build
bun run lint
bun run dev > /tmp/dev.log 2>&1 &
echo $! > /tmp/dev.pid
sleep 5
curl -s http://localhost:3000/ | grep -a -o "Escritora · Pesquisadora da memória local · Produtora Cultural"
curl -s http://localhost:3000/ | grep -a -o "Uma escrita entre memória, literatura e fronteira."
curl -s http://localhost:3000/ | grep -a -o "Trajetória cultural"
kill "$(cat /tmp/dev.pid)"
rm /tmp/dev.pid /tmp/dev.log
```
Expected: build/lint exit 0; all three strings still render on the homepage (now sourced from `site.role`/`site.presentationHeading`/`homeChapters` instead of hardcoded JSX).

- [ ] **Step 5: Commit**

```bash
cd /home/inasc/projects/luciani-portfolio
git add -A
git commit -m "Move homepage copy to content/site.yaml; fix duplicated hero subtitle"
```

---

## Out of scope (per spec)

- Dossiê's 7 numbered section titles
- UI microcopy / CTA labels ("Gerar portfólio em PDF", "Abrir capítulo →", "Início", etc.)
- Markdown rendering for existing single-paragraph bodies (`book.synopsis`, `project.context`, `competency.description`)
