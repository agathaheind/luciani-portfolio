# Luciani Portfolio Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up `/home/inasc/projects/luciani-portfolio` as an independent, Lovable-free copy of `/home/inasc/projects/lovable`, with the client's real name and city corrected, verified to build/lint/run on its own.

**Architecture:** Copy-then-strip. The existing repo already has the right code and design, so we copy it wholesale, remove Lovable editor/telemetry ties, fix two identity fields, and verify the result builds standalone — rather than rebuilding from scratch.

**Tech Stack:** TanStack Start, React 19, Tailwind 4, shadcn/radix, Vite 8, bun (package manager, not yet installed on this machine).

## Global Constraints

- Destination is exactly `/home/inasc/projects/luciani-portfolio` (sibling to `/home/inasc/projects/lovable`).
- Source repo `/home/inasc/projects/lovable` is read-only reference — never modified by this plan.
- Exclude `.git/`, `node_modules/`, and `*:Zone.Identifier` files when copying.
- Keep the `@lovable.dev/vite-tanstack-config` dependency in `vite.config.ts` and `package.json` — do not attempt to replace it (see spec: build-time helper, not a runtime tie, replacing it is out of scope for this pass).
- This plan targets a brand-new repo (`luciani-portfolio`), not an existing user repo — each implementation task (1-3) ends with exactly one commit in that new repo, scoped to that task, to support per-task review diffing. Task 4 is verification-only and makes no commit. No `git push` at any point.
- Content accuracy beyond `author`/`city` in `site.ts` and the matching meta tags in `__root.tsx` (books, timeline, projects, media, placeholder phone) is **out of scope** — do not touch it.
- Spec: `docs/superpowers/specs/2026-07-19-luciani-portfolio-rebuild-design.md`

---

### Task 1: Install bun and copy the project to the new location

**Files:**
- Create: `/home/inasc/projects/luciani-portfolio/` (full copy of `/home/inasc/projects/lovable/`, minus exclusions)

**Interfaces:**
- Produces: a git-initialized directory at `/home/inasc/projects/luciani-portfolio` containing the full source tree, ready for Task 2 to edit in place.

- [ ] **Step 1: Install bun globally via npm**

Run: `npm install -g bun`

Expected: exits 0.

- [ ] **Step 2: Verify bun is available**

Run: `bun --version`

Expected: prints a version string (e.g. `1.x.x`), no error.

- [ ] **Step 3: Verify destination does not already exist**

Run: `ls /home/inasc/projects/luciani-portfolio`

Expected: `ls: cannot access '/home/inasc/projects/luciani-portfolio': No such file or directory`. If it already exists, stop and check with the user before overwriting anything.

- [ ] **Step 4: Copy the project tree, excluding node_modules and Zone.Identifier files**

Run:
```bash
mkdir -p /home/inasc/projects/luciani-portfolio
rsync -a --exclude 'node_modules' --exclude '*:Zone.Identifier' /home/inasc/projects/lovable/ /home/inasc/projects/luciani-portfolio/
```

Expected: both commands exit 0.

- [ ] **Step 5: Verify the copy**

Run:
```bash
find /home/inasc/projects/luciani-portfolio -name '*Zone.Identifier*'
ls /home/inasc/projects/luciani-portfolio/src/content/site.ts /home/inasc/projects/luciani-portfolio/package.json /home/inasc/projects/luciani-portfolio/vite.config.ts
```

Expected: the `find` prints nothing (no Zone.Identifier files copied); the `ls` lists all three files with no error.

- [ ] **Step 6: Initialize a fresh git repo**

Run: `git -C /home/inasc/projects/luciani-portfolio init`

Expected: `Initialized empty Git repository in /home/inasc/projects/luciani-portfolio/.git/`

- [ ] **Step 7: Commit the initial copy**

Run:
```bash
cd /home/inasc/projects/luciani-portfolio
git add -A
git commit -m "Initial copy from lovable template"
```

Expected: commit succeeds; `git log --oneline` shows one commit.

---

### Task 2: Strip Lovable-specific ties

**Files:**
- Delete: `/home/inasc/projects/luciani-portfolio/.lovable/` (directory)
- Delete: `/home/inasc/projects/luciani-portfolio/AGENTS.md`
- Delete: `/home/inasc/projects/luciani-portfolio/src/lib/lovable-error-reporting.ts`
- Modify: `/home/inasc/projects/luciani-portfolio/src/routes/__root.tsx`
- Modify: `/home/inasc/projects/luciani-portfolio/bunfig.toml`
- Modify: `/home/inasc/projects/luciani-portfolio/package.json`

**Interfaces:**
- Consumes: the copied tree produced by Task 1.
- Produces: a tree with no Lovable editor/telemetry coupling except the intentionally-kept `@lovable.dev/vite-tanstack-config` build dependency, ready for Task 3's content edits.

- [ ] **Step 1: Delete `.lovable/`**

Run: `rm -rf /home/inasc/projects/luciani-portfolio/.lovable`

Expected: exits 0, no output.

- [ ] **Step 2: Delete `AGENTS.md`**

Its only content is the Lovable sync-warning banner — nothing else to preserve.

Run: `rm /home/inasc/projects/luciani-portfolio/AGENTS.md`

Expected: exits 0.

- [ ] **Step 3: Delete `lovable-error-reporting.ts`**

Run: `rm /home/inasc/projects/luciani-portfolio/src/lib/lovable-error-reporting.ts`

Expected: exits 0.

- [ ] **Step 4: Remove the Lovable error-reporting import and call site from `__root.tsx`**

File: `/home/inasc/projects/luciani-portfolio/src/routes/__root.tsx`

Replace:
```typescript
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SiteLayout } from "../components/SiteLayout";
```

With:
```typescript
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import type { ReactNode } from "react";

import appCss from "../styles.css?url";
import { SiteLayout } from "../components/SiteLayout";
```

Then replace:
```typescript
function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
```

With:
```typescript
function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
```

- [ ] **Step 5: Trim the bun supply-chain-guard exclude list in `bunfig.toml`**

File: `/home/inasc/projects/luciani-portfolio/bunfig.toml`

Replace:
```toml
minimumReleaseAgeExcludes = ["@lovable.dev/vite-tanstack-config", "@lovable.dev/mcp-js", "@lovable.dev/vite-plugin-dev-server-bridge", "@lovable.dev/vite-plugin-hmr-gate", "@lovable.dev/email-js", "@lovable.dev/webhooks-js"]
```

With:
```toml
minimumReleaseAgeExcludes = ["@lovable.dev/vite-tanstack-config"]
```

- [ ] **Step 6: Rename the package in `package.json`**

File: `/home/inasc/projects/luciani-portfolio/package.json`

Replace:
```json
  "name": "tanstack_start_ts",
```

With:
```json
  "name": "luciani-portfolio",
```

- [ ] **Step 7: Verify only the intentionally-kept dependency still references Lovable**

Run:
```bash
grep -rli lovable /home/inasc/projects/luciani-portfolio/src /home/inasc/projects/luciani-portfolio/package.json /home/inasc/projects/luciani-portfolio/bunfig.toml /home/inasc/projects/luciani-portfolio/vite.config.ts 2>/dev/null
```

Expected output (exactly these three files, no others):
```
/home/inasc/projects/luciani-portfolio/package.json
/home/inasc/projects/luciani-portfolio/bunfig.toml
/home/inasc/projects/luciani-portfolio/vite.config.ts
```

If `src/` shows up in the results, Step 4 was incomplete — go back and check `__root.tsx`.

- [ ] **Step 8: Commit the Lovable-stripping changes**

Run:
```bash
cd /home/inasc/projects/luciani-portfolio
git add -A
git commit -m "Strip Lovable editor/telemetry ties"
```

Expected: commit succeeds; `git log --oneline` shows two commits.

---

### Task 3: Fix client identity data

**Files:**
- Modify: `/home/inasc/projects/luciani-portfolio/src/content/site.ts`
- Modify: `/home/inasc/projects/luciani-portfolio/src/routes/__root.tsx`

**Interfaces:**
- Consumes: the stripped tree from Task 2.
- Produces: `site.author` = `"Luciani Heindrickson da Silva"`, `site.city` = `"Santa Terezinha de Itaipu, Paraná — Brasil"`, and matching page `<title>`/meta tags — the only content changes in scope for this plan.

- [ ] **Step 1: Update `author` and `city` in `site.ts`**

File: `/home/inasc/projects/luciani-portfolio/src/content/site.ts`

Replace:
```typescript
export const site = {
  author: "Luciani Heindrickson",
  role: "Escritora · Pesquisadora da memória local · Produtora Cultural",
  city: "Foz do Iguaçu, Paraná — Brasil",
```

With:
```typescript
export const site = {
  author: "Luciani Heindrickson da Silva",
  role: "Escritora · Pesquisadora da memória local · Produtora Cultural",
  city: "Santa Terezinha de Itaipu, Paraná — Brasil",
```

- [ ] **Step 2: Update the page head metadata in `__root.tsx`**

File: `/home/inasc/projects/luciani-portfolio/src/routes/__root.tsx`

Replace:
```typescript
      { title: "Luciani Heindrickson — Portfólio Cultural" },
      {
        name: "description",
        content:
          "Portfólio cultural de Luciani Heindrickson — escritora, pesquisadora da memória local e produtora cultural. Trajetória, publicações, projetos e documentos para editais públicos.",
      },
      { name: "author", content: "Luciani Heindrickson" },
      { property: "og:title", content: "Luciani Heindrickson — Portfólio Cultural" },
```

With:
```typescript
      { title: "Luciani Heindrickson da Silva — Portfólio Cultural" },
      {
        name: "description",
        content:
          "Portfólio cultural de Luciani Heindrickson da Silva — escritora, pesquisadora da memória local e produtora cultural. Trajetória, publicações, projetos e documentos para editais públicos.",
      },
      { name: "author", content: "Luciani Heindrickson da Silva" },
      { property: "og:title", content: "Luciani Heindrickson da Silva — Portfólio Cultural" },
```

- [ ] **Step 3: Verify both files were updated and no stray short-form name remains**

Run:
```bash
grep -n "author:" /home/inasc/projects/luciani-portfolio/src/content/site.ts
grep -c "da Silva" /home/inasc/projects/luciani-portfolio/src/routes/__root.tsx
grep -rn '"Luciani Heindrickson"' /home/inasc/projects/luciani-portfolio/src/content/site.ts /home/inasc/projects/luciani-portfolio/src/routes/__root.tsx
```

Expected: first command shows `author: "Luciani Heindrickson da Silva",`; second command prints `4` (title, description, author meta, og:title); third command prints nothing (no exact `"Luciani Heindrickson"` string without "da Silva" remains in either file).

- [ ] **Step 4: Commit the identity fix**

Run:
```bash
cd /home/inasc/projects/luciani-portfolio
git add -A
git commit -m "Fix client name and city"
```

Expected: commit succeeds; `git log --oneline` shows three commits.

---

### Task 4: Install dependencies and verify the standalone build

**Files:** none (verification only — no files created or modified)

**Interfaces:**
- Consumes: the corrected tree from Task 3.
- Produces: confirmation that the project builds, lints, and serves correctly with no dependency on the Lovable editor.

- [ ] **Step 1: Install dependencies**

Run:
```bash
cd /home/inasc/projects/luciani-portfolio && bun install
```

Expected: exits 0; `node_modules/` is created.

- [ ] **Step 2: Run the production build**

Run:
```bash
cd /home/inasc/projects/luciani-portfolio && bun run build
```

Expected: exits 0, output ends with a Vite/nitro success message (no errors).

- [ ] **Step 3: Run the linter**

Run:
```bash
cd /home/inasc/projects/luciani-portfolio && bun run lint
```

Expected: exits 0, no errors reported.

- [ ] **Step 4: Smoke-test the dev server**

Run:
```bash
cd /home/inasc/projects/luciani-portfolio
bun run dev > /tmp/luciani-dev.log 2>&1 &
echo $! > /tmp/luciani-dev.pid
sleep 5
cat /tmp/luciani-dev.log
```

Expected: log shows a `Local:` URL (e.g. `http://localhost:3000`).

- [ ] **Step 5: Request the home page and confirm the corrected name renders**

Run (substitute the actual port found in Step 4's log):
```bash
curl -s http://localhost:3000/ | grep -o "Luciani Heindrickson da Silva" | head -1
```

Expected: prints `Luciani Heindrickson da Silva`.

- [ ] **Step 6: Stop the dev server**

Run:
```bash
kill "$(cat /tmp/luciani-dev.pid)"
rm /tmp/luciani-dev.pid /tmp/luciani-dev.log
```

Expected: exits 0, process stopped.

---

## Out of scope (deferred — see spec)

- Accuracy review of books, timeline events, projects, certificates, media entries
- Remaining "Foz do Iguaçu" references outside `site.ts`/`__root.tsx`
- Real phone number (currently a placeholder)
- Fully removing `@lovable.dev/vite-tanstack-config`
