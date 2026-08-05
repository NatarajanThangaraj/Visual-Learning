---
name: add-visual-learning-project
description: >-
  Use when adding a new project/assignment (a card + page) to the Visual Learning site — a
  React + Vite + React Router SPA whose source lives in client-src/ and whose committed build
  output in client/ is hosted by Catalyst Slate. Covers both a self-contained static HTML page
  (external: true, placed under client-src/public/) and an in-app React component page, how to
  register it in client-src/src/data/topics.js, rebuilding client/ with `npm run deploy:build`,
  committing, and the required manual Slate "Sync now". Triggers on "add a new project", "add an
  assignment", "add a card to the site", "put this HTML page in the catalog", "new project on
  Visual Learning".
---

# Add a new project to Visual Learning

## How the site works (read this first)

- **The catalog is one file:** `client-src/src/data/topics.js`. Every entry in its `topics` array
  becomes a home-page card automatically. Internal (React) entries also become a route.
- **Source vs deployed:** you edit `client-src/`; the build output lives in **`client/`**, which is
  **committed to Git**. **Catalyst Slate hosts `client/` verbatim and runs no build of its own** —
  so you must rebuild locally and commit `client/`, or the live site won't change.
- **Two kinds of project:**
  - **Static HTML** — one self-contained `.html` file (own styles/JS), `external: true`. *This is
    the usual case (e.g. Riya's Job Hunt).*
  - **In-app React page** — built from the site's shared components, has a `Component`.

## Step 1 — Pick the type and add the files

### Path A — Static HTML page (usual case)

Pick a category (`java` / `python` / `others`, lowercase) and a slug (e.g. `my-project`).

1. Put the HTML file at:
   `client-src/public/<category>/<slug>/index.html`
   Anything under `public/` is copied into the build with the `public/` prefix stripped, so this
   serves at URL `/<category>/<slug>/index.html`.

2. Add ONE entry to the `topics` array in `client-src/src/data/topics.js`:
   ```js
   {
     path: '/<category>/<slug>/index.html', // ⚠️ MUST end in /index.html and match the public/ path
     external: true,                        // ⚠️ required — makes the card a plain <a>, no route
     title: 'My Project',
     description: 'One-line summary shown on the card.',
     category: 'Java',                      // Java | Python | Others (capitalized) — drives filters
     tags: ['Java', 'Strings'],
     dateAdded: 'YYYY-MM-DD',
     thumbnail: null,                       // null → per-category thumbnail fallback
   },
   ```
   Do **not** add a `Component` key.

### Path B — In-app React page

1. Create the page at `client-src/src/pages/topics/<category>/<Name>.jsx`. Reuse the shared scaffold
   `client-src/src/components/TopicPageLayout.jsx` (import it as
   `'../../../components/TopicPageLayout'`); model it on
   `client-src/src/pages/topics/java/HelloJava.jsx`. **Pass `placeholder={false}`** once real content
   exists, or the "🚧 Placeholder" banner keeps showing.

2. In `client-src/src/data/topics.js`: add an import at the top
   (`import MyProject from '../pages/topics/java/MyProject';`) and an entry with a **clean** path and
   a `Component` (no `external`):
   ```js
   {
     path: '/<category>/<slug>',            // clean route, NO /index.html
     title: 'My Project',
     description: '...',
     category: 'Java',
     tags: ['Java'],
     dateAdded: 'YYYY-MM-DD',
     thumbnail: null,
     Component: MyProject,                  // required for internal pages
   },
   ```

## Step 2 — Rebuild, commit, deploy (both paths)

Run from the repo root, on an up-to-date `main`:

```bash
git checkout main && git pull origin main
```
Make your edits (Step 1), then rebuild the deployed `client/` folder (this regenerates a new
content-hashed bundle, which avoids stale caching):
```bash
cd client-src && npm install && npm run deploy:build && cd ..
```
`deploy:build` runs `vite build`, copies `index.html`→`404.html`, wipes `client/`, and repopulates it
from the fresh build (including your `public/` file).
```bash
git add -A && git commit -m "Add <My Project>" && git push origin main
```
Then in the **Catalyst console → `visuallearning.onslate.in` Web Client Hosting (Slate) → click
"Sync now"**. This is **required** — Slate does not auto-deploy on push.

## Step 3 — Verify

- **Locally, before pushing:** `cd client && python3 -m http.server 4599`, open
  `http://localhost:4599/`, confirm the new card appears and clicking it opens the project. For Path A
  the URL should show `/…/index.html` and load the real page (not the "not in the catalog" 404).
- **Live, after Slate sync:** hard-refresh (Cmd+Shift+R) `https://visuallearning.onslate.in/` and
  click the card.

## Rules & gotchas (what has bitten us before)

1. **Static (`external`) `path` MUST end in `/index.html`** and match the `public/`-stripped URL. A
   bare directory path (`/java/my-project/`) hits the SPA fallback → "404 — not in the catalog".
2. **Never mix `Component` and `external: true`.** External = static file, no route, `<a href>`.
   Internal = `Component`, no `external`, `<Link>`. `App.jsx` filters out `external` entries so the
   static file isn't shadowed by a route.
3. **Always run `deploy:build` before committing.** `client/` is what's hosted; skipping the rebuild
   means source and live site silently drift.
4. **`deploy:build` runs `rm -rf ../client/*`** — never hand-edit files directly in `client/`; all
   content must originate in `client-src/` (`src/` or `public/`).
5. **Slate Sync is manual** after every push; pushing alone doesn't deploy.
6. **Rebuild = new bundle hash → cache-safe.** (Separately, the 1-year `cache-control` on `index.html`
   is worth fixing in Catalyst someday, but the new hash covers the common case.)
7. **`category`** in the entry is capitalized (`Java`/`Python`/`Others`); the `public/` folder is
   lowercase (`java`/`python`/`others`).
