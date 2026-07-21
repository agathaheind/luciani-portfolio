# Luciani Heindrickson da Silva — Portfólio Cultural

Site institucional de Luciani Heindrickson da Silva: escritora, pesquisadora
da memória local e produtora cultural. Publicado em
**https://agathaheind.github.io/luciani-portfolio/**.

This README has two audiences: anyone editing the site's **text and photos**
(no coding needed — see [Editing content](#editing-content) below), and
anyone working on the **code** (see [Development](#development)).

## Editing content

Every piece of text, photo, and document on the site lives in the
top-level `content/` folder (and `public/media/` for the actual image/PDF
files) — never inside `src/`. Edit a file, commit, push to `master`, and
the live site rebuilds and republishes automatically within a couple of
minutes (see [How publishing works](#how-publishing-works)).

You can edit any of these files directly in GitHub's web editor (click the
pencil icon on the file's page) — no local setup required for text changes.

### Site-wide info — `content/site.yaml`

Name, contact details, tagline, the four homepage stats, and the homepage's
three "chapter" cards:

```yaml
author: Luciani Heindrickson da Silva
role: Escritora · Pesquisadora da memória local · Produtora Cultural
city: Santa Terezinha de Itaipu, Paraná — Brasil
email: contato@lucianiheindrickson.com.br
phone: "+55 (45) 90000-0000"
instagram: "@lucianiheindrickson"
tagline: >-
  Escrita, memória e produção cultural na fronteira...
presentation: >-
  Luciani Heindrickson da Silva é brasileira...
presentationHeading: Uma escrita entre memória, literatura e fronteira.
indicators:
  - label: Participações em eventos
    value: "24+"
homeChapters:
  - to: /trajetoria
    kicker: Capítulo I
    title: Trajetória cultural
    desc: Uma linha do tempo comentada...
```

Change any value and save — `role`, for example, updates both the homepage
hero and the footer on every page, since they both read from this one file.

### Showing/hiding pages — `content/pages.yaml`

Every page in the navigation menu is one entry here:

```yaml
- key: contribuicao
  to: /contribuicao
  label: Contribuição
  enabled: true
  order: 8
```

Set `enabled: false` to remove a page from the menu and make it return "not
found" if visited directly — no code changes needed. `order` controls its
position in the menu (lower numbers first). The homepage is always shown
and isn't listed here.

### Page titles and intro text — `content/pages/*.md`

Each page's title, kicker (small label above the title), and one-line intro
live in a file named after the page, e.g. `content/pages/contato.md`:

```markdown
---
kicker: Correspondência
title: Contato
lead: Para propostas culturais, colaborações editoriais e convites institucionais.
---
```

Two pages also have longer text in the body, below the `---`:

- **`content/pages/quem-sou.md`** — the "Quem sou" biography. Write in
  plain paragraphs separated by a blank line; use `**text**` for bold and
  `*text*` for italic.
- **`content/pages/dossie.md`** — the "Currículo condensado" paragraph on
  the Dossiê page. This file has no `kicker`/`title`/`lead` (the Dossiê
  page has its own layout) — just the paragraph text.

### Content collections

These are lists that appear on their own pages. Each item is one Markdown
file in the matching folder. To add an item, copy an existing file in the
folder, rename it, and change the contents. To remove an item, delete its
file. Everything after the second `---` is free text (can be several
sentences).

| Folder | Appears on | Fields | Example |
|---|---|---|---|
| `content/books/*.md` | Produção literária | `title`, `category` (`livro`, `coletanea`, `cronica`, `poesia`, `artigo`, `revista`, `capitulo`), `year`, `status` (`Publicado`, `No prelo`, `Em produção`) + synopsis | `content/books/vozes-de-fronteira.md` |
| `content/competencies/*.md` | Competências | `title` + description | `content/competencies/01-pesquisa-cultural.md` |
| `content/timeline/*.md` | Trajetória | `year`, `title`, `institution` (optional), `city` (optional), `certificate` (optional) + description | `content/timeline/2025-antologia-psique.md` |
| `content/projects/*.md` | Projetos | `title`, `subtitle` (optional), `year`, `summary`, `objectives`/`activities`/`results` (lists), `photoPrefix`, `documentPrefix` + longer context text | `content/projects/feira-do-livro.md` |
| `content/contribuicao/*.md` | Contribuição | `kicker` (roman numeral "I"–"V"), `title` + statement text | `content/contribuicao/01-preservacao-da-memoria.md` |
| `content/media/photos/*.md` | Galeria | `file` (a label, doesn't need to be a real filename), `image` (the actual filename in `public/media/photos/`), `category`, `caption` (optional) | `content/media/photos/clube-leitura.md` |
| `content/media/documents/*.md` | Certificados | `file` (a label), `title`, `institution`, `year`, `url` (optional, defaults to `#` until a PDF is uploaded) | `content/media/documents/certificado-antologia-psique.md` |

**Ordering:** competencies and contribuição pillars display in filename
order (hence the `01-`, `02-`, ... prefixes) — to reorder them, rename the
files. Books and timeline entries sort by `year` automatically; projects
too.

**Naming files:** use the same pattern as the existing files in that
folder (lowercase, hyphens instead of spaces/accents) — the filename
itself isn't shown anywhere on the site, so it just needs to be unique.

### Adding a new photo or document

1. Drop the actual image/PDF file into `public/media/photos/` or
   `public/media/documents/`.
2. Add a matching `.md` file in `content/media/photos/` or
   `content/media/documents/` (see the table above) with `image` (or a PDF
   `url`) pointing at the filename you just added.

A photo/document only appears on a project's own page automatically if its
`file` label starts with that project's `photoPrefix`/`documentPrefix`
(set in the project's own `content/projects/*.md` file) — otherwise it only
shows up in the general Galeria/Certificados pages.

## How publishing works

Every push to the `master` branch on GitHub triggers a GitHub Actions
workflow (`.github/workflows/deploy-pages.yml`) that rebuilds the site and
publishes it to GitHub Pages automatically — nothing needs to be run by
hand. A build/publish run typically finishes in 1–2 minutes; you can watch
its progress under the repo's **Actions** tab.

## Development

Requirements: [Bun](https://bun.sh) (this project uses `bun`, not `npm`).

```bash
bun install       # install dependencies
bun run dev       # start the local dev server (http://localhost:8080)
bun run build     # production build (Cloudflare/Node target)
bun run lint      # check code style
bun run format    # auto-format with Prettier
```

### Building the static GitHub Pages export locally

```bash
bun run build:github-pages
```

This produces a fully static export in `dist/client/` — every route
prerendered to a real `.html` file, base path set to `/luciani-portfolio/`,
plus a `404.html` fallback for deep links (GitHub Pages has no
server-side router). You normally don't need to run this yourself; it's
what the deploy workflow runs automatically on every push.

### Tech stack

[TanStack Start](https://tanstack.com/start) (React) on [Vite](https://vite.dev),
content parsed from Markdown/YAML with `gray-matter`/`js-yaml`/`zod`
(see `src/content/*.ts` for the loaders, `src/content/_lib/parse.ts` for the
shared parsing/validation helpers), long-form content rendered with
`react-markdown`. No test runner is configured — verification is `bun run
build` + `bun run lint` plus manual checks in the dev server.
