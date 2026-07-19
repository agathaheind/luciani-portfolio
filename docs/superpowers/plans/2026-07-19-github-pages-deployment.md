# GitHub Pages Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. **Exception:** the "Deployment rollout" section at the end (branch rename/push, GitHub repo settings) is explicitly NOT a subagent task — see that section for why.

**Goal:** Publish `luciani-portfolio` to `https://agathaheind.github.io/luciani-portfolio/` via GitHub Actions, without breaking the existing local dev/build workflow.

**Architecture:** A `GITHUB_PAGES=true` environment variable gates every GitHub-Pages-specific behavior (Vite `base`, Nitro's `github-pages` preset, the static sitemap generator) behind a new `bun run build:github-pages` script, leaving the existing `bun run dev`/`bun run build` completely untouched for local work and any other deploy target.

**Tech Stack:** Vite 8, Nitro (via `@lovable.dev/vite-tanstack-config`), GitHub Actions.

## Global Constraints

- `bun run dev` and `bun run build` (no env var) must behave exactly as they
  do today — base path `/`, no Nitro preset override, dynamic
  `/sitemap.xml` route still works locally.
- No `git push`. Task commits happen in this repo as usual; the branch
  rename/push described in "Deployment rollout" is a separate, explicitly
  human-confirmed action — never bundled into a task commit.
- Spec: `docs/superpowers/specs/2026-07-19-github-pages-deployment-design.md`

## Findings this plan relies on (confirmed by reading the actual packages, not assumed)

- `@lovable.dev/vite-tanstack-config`'s `nitro` option type is `{ preset?:
  string; output?: {...}; cloudflare?: {...} }` — **no `prerender` key**.
  Nitro's `github-pages` preset hardcodes `prerender.routes: ["/",
  "/404.html"]` internally; there is no supported way to append to that list
  through this wrapper. Consequence: `/sitemap.xml` (a server-handler-only
  route with no HTML page linking to it) cannot be captured via Nitro's
  crawl-based prerendering — it needs a different mechanism (Task 2).
- Nitro's `static`/`github-pages` presets fully replace the server at
  build time: the final output (`.output/public`) is pure static files.
  Anything under `public/` at the repo root is always copied into that
  output regardless of prerendering — this is the mechanism Task 2 relies
  on.
- Vite automatically exposes its configured `base` to app code as
  `import.meta.env.BASE_URL` (already typed via this project's
  `"types": ["vite/client"]` in `tsconfig.json` — confirmed present, no new
  type setup needed) — this is how the router's `basepath` stays in sync
  with the build's `base` without duplicating the value.
- `eslint.config.js`'s prettier rule (`eslintPluginPrettier`, last entry in
  the config array) applies with no `files` restriction, so it also lints
  new files under `scripts/` — the new script must be prettier-clean or
  `bun run lint` fails.

---

### Task 1: Conditional base path + Nitro preset

**Files:**
- Modify: `vite.config.ts`
- Modify: `src/router.tsx`
- Modify: `package.json`

**Interfaces:**
- Produces: a `GITHUB_PAGES=true` env var, read only in `vite.config.ts`,
  that switches `base` to `/luciani-portfolio/` and forces the
  `github-pages` Nitro preset; unset (or any other value) keeps today's
  behavior exactly.

- [ ] **Step 1: Update `vite.config.ts`**

Replace the entire contents of `vite.config.ts` with:
```typescript
// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const isGithubPagesBuild = process.env.GITHUB_PAGES === "true";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    base: isGithubPagesBuild ? "/luciani-portfolio/" : "/",
  },
  nitro: isGithubPagesBuild ? { preset: "github-pages" } : undefined,
});
```

- [ ] **Step 2: Update `src/router.tsx` to use the build's base path**

Replace:
```typescript
  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });
```
With:
```typescript
  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    basepath: import.meta.env.BASE_URL,
  });
```

- [ ] **Step 3: Add the `build:github-pages` script**

In `package.json`, replace:
```json
    "build": "vite build",
    "build:dev": "vite build --mode development",
```
With:
```json
    "build": "vite build",
    "build:dev": "vite build --mode development",
    "build:github-pages": "GITHUB_PAGES=true vite build",
```

- [ ] **Step 4: Verify local dev/build are unaffected**

Run:
```bash
cd /home/inasc/projects/luciani-portfolio
bun run build
bun run lint
```
Expected: both exit 0, exactly as before this task (base path unchanged,
no Nitro preset override active).

```bash
bun run dev > /tmp/dev.log 2>&1 &
echo $! > /tmp/dev.pid
sleep 5
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/quem-sou
kill "$(cat /tmp/dev.pid)"
rm /tmp/dev.pid /tmp/dev.log
```
Expected: both requests return `200` — confirms `basepath: import.meta.env.BASE_URL`
resolves to `/` locally and doesn't break routing.

- [ ] **Step 5: Verify the GitHub Pages build produces a static export with the right base path**

Run:
```bash
cd /home/inasc/projects/luciani-portfolio
bun run build:github-pages
ls .output/public/index.html
grep -o 'src="/luciani-portfolio/[^"]*"' .output/public/index.html | head -3
ls .output/public/.nojekyll
```
Expected: `.output/public/index.html` exists; at least one script/asset tag
references a path starting with `/luciani-portfolio/` (confirms `base` was
applied to the actual build); `.nojekyll` exists (confirms the `github-pages`
preset's `compiled` hook ran).

- [ ] **Step 6: Commit**

```bash
cd /home/inasc/projects/luciani-portfolio
git add -A
git commit -m "Add conditional GitHub Pages build (base path + nitro preset)"
```

---

### Task 2: Static sitemap generator for the GitHub Pages build

**Files:**
- Create: `scripts/generate-sitemap.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: `content/pages.yaml` and the filenames under `content/projects/`
  directly via `node:fs` (this script runs outside Vite's transform
  pipeline, so it cannot use `import.meta.glob` — it duplicates the
  YAML-reading logic in plain Node instead).
- Produces: `public/sitemap.xml`, a static file that Nitro's static build
  copies into `.output/public/sitemap.xml` automatically (see "Findings"
  above) — no Nitro prerender-routes configuration needed.

- [ ] **Step 1: Create `scripts/generate-sitemap.mjs`**

```javascript
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const BASE_URL = "https://agathaheind.github.io/luciani-portfolio";

const pagesRaw = readFileSync(join(rootDir, "content/pages.yaml"), "utf8");
const pages = yaml.load(pagesRaw);
const staticPaths = ["/", ...pages.filter((p) => p.enabled).map((p) => p.to)];

const projectFiles = readdirSync(join(rootDir, "content/projects")).filter((f) =>
  f.endsWith(".md"),
);
const projectPaths = projectFiles.map((f) => `/projetos/${f.replace(/\.md$/, "")}`);

const urls = [...staticPaths, ...projectPaths]
  .map((p) => `  <url><loc>${BASE_URL}${p}</loc><changefreq>monthly</changefreq></url>`)
  .join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

writeFileSync(join(rootDir, "public/sitemap.xml"), xml);
console.log(`Wrote public/sitemap.xml with ${staticPaths.length + projectPaths.length} URLs`);
```

This depends on `content/pages.yaml` and `content/projects/*.md` existing —
i.e. the content-architecture plan's Task 7 and Task 5. If this plan is
implemented first, stub `content/pages.yaml` with the same 10-page list
from that plan's Task 7 Step 1 before running this script.

- [ ] **Step 2: Wire it into the GitHub Pages build**

In `package.json`, replace:
```json
    "build:github-pages": "GITHUB_PAGES=true vite build",
```
With:
```json
    "build:github-pages": "node scripts/generate-sitemap.mjs && GITHUB_PAGES=true vite build",
```

- [ ] **Step 3: Verify**

Run:
```bash
cd /home/inasc/projects/luciani-portfolio
bun run format
bun run lint
node scripts/generate-sitemap.mjs
cat public/sitemap.xml
```
Expected: `bun run lint` exits 0 (the new script is prettier-clean); the
printed XML contains a `<url>` entry for every enabled page in
`content/pages.yaml` plus one per file in `content/projects/`, each `<loc>`
starting with `https://agathaheind.github.io/luciani-portfolio`.

Then confirm it survives the full static build:
```bash
bun run build:github-pages
cat .output/public/sitemap.xml
```
Expected: identical content to the standalone run above, now present in the
static output.

- [ ] **Step 4: Commit**

```bash
cd /home/inasc/projects/luciani-portfolio
git add -A
git commit -m "Generate a static sitemap.xml for the GitHub Pages build"
```

---

### Task 3: GitHub Actions deploy workflow

**Files:**
- Create: `.github/workflows/deploy.yml`

**Interfaces:** none (CI-only; nothing in the app imports or depends on
this file).

- [ ] **Step 1: Create `.github/workflows/deploy.yml`**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest
      - run: bun install
      - run: bun run build:github-pages
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: .output/public
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Verify the workflow file is valid YAML**

Run:
```bash
cd /home/inasc/projects/luciani-portfolio
python3 -c "import yaml, sys; yaml.safe_load(open('.github/workflows/deploy.yml'))" && echo "valid YAML"
```
Expected: prints `valid YAML`. (This only checks syntax — the workflow's
actual execution is verified after the branch is pushed to GitHub, in the
"Deployment rollout" section below, not by a local subagent.)

- [ ] **Step 3: Commit**

```bash
cd /home/inasc/projects/luciani-portfolio
git add -A
git commit -m "Add GitHub Actions workflow to deploy to GitHub Pages"
```

---

## Deployment rollout (human-confirmed, not a subagent task)

Everything above produces a working static build in this local repo. Going
live additionally requires rewriting history on the real `origin` remote and
a one-time setting in the GitHub UI — both are irreversible-ish, externally
visible actions the standing project rules require confirming before doing,
not something to hand to an autonomous implementer.

1. **Rename and push the branch:**
   ```bash
   cd /home/inasc/projects/luciani-portfolio
   git branch -m master main
   git push origin main   # confirm the exact command with the user first —
                           # this replaces the remote's placeholder "Initial commit"
   ```
2. **One-time GitHub repo setting** (Settings → Pages → Build and
   deployment → Source → "GitHub Actions"). Either walk the user through
   doing this themselves, or attempt it via `gh api` if the user prefers and
   `gh auth status` shows they're already authenticated — confirmed with the
   user first either way, per this project's standing rule on shared/external
   actions.
3. After both, the next push to `main` triggers the Actions workflow
   automatically; watch it via `gh run watch` or the repo's Actions tab.
