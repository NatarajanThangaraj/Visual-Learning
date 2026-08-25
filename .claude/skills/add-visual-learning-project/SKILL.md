---
name: add-visual-learning-project
description: >-
  Use when adding a project/page to the Visual Learning site — a React + Vite + React
  Router course platform whose source lives in client-src/ and whose committed build output
  in client/ is hosted by Catalyst Slate. Every page is a self-contained static HTML project
  placed under client-src/public/ and registered as one lesson entry in
  client-src/src/data/courses.js (course → module → lesson). Covers where the file goes,
  which module to put it in, rebuilding client/ with `npm run deploy:build`, committing, and
  the required manual Slate "Sync now". Triggers on "add a new project", "add an
  assignment", "add a page", "put this HTML page in the course", "new project on Visual
  Learning".
---

# Add a project to Visual Learning

## How the site works (read this first)

- **Three courses** — Java, Python, Problem Solving — each split into numbered **modules**,
  each module a vertical path of pages the learner walks in order.
- **Every page is a self-contained static HTML project** with its own styles and JS, living
  under `public/`. It is shown inside the course chrome (breadcrumb, Previous / Mark
  complete / Next) in an iframe on desktop, and handed over full screen on mobile. There is
  no second kind of page — no in-app React lesson, no authored theory pages.
- **The catalog is one file:** `client-src/src/data/courses.js`. Adding an entry there is
  the *whole* registration: the card on the course path, the route, the sidebar counts,
  next/prev, unlocking and the Browse page all derive from it.
- **Source vs deployed:** you edit `client-src/`; the build output lives in **`client/`**,
  which is **committed to Git**. **Catalyst Slate hosts `client/` verbatim and runs no build
  of its own** — so you must rebuild locally and commit `client/`, or the live site won't
  change.

## Step 1 — Add the files

Pick a category folder (`java` / `python` / `others`, lowercase) and a slug.

1. Put the page at `client-src/public/<category>/<slug>/index.html`. Anything under
   `public/` is copied into the build with the `public/` prefix stripped, so it serves at
   `/<category>/<slug>/index.html`. Add a `thumb.png` beside it (a screenshot of the page)
   — without one the card falls back to generic per-course art.

2. Add ONE entry to the right module's `lessons` array in `courses.js`:
   ```js
   { id: '<slug>', title: 'The Casting Foundry', minutes: 20,
     blurb: 'One-line summary shown on the card.',
     src: '/<category>/<slug>/index.html',          // ⚠️ must match the public/ path
     thumbnail: '/<category>/<slug>/thumb.png' },   // null → per-course fallback art
   ```

### Placing it

Order inside a module is the order learners walk it, and **unlocking is sequential** — the
page before it must be completed first. Put it in the module whose topic it teaches; a new
module is just another `{ id, title, summary, lessons: [] }` object in the course's
`modules` array. `summary` is one line, shown only behind the module's notes button.

## Step 2 — Rebuild, commit, deploy

From the repo root, on an up-to-date `main`:

```bash
git checkout main && git pull origin main
cd client-src && npm install && npm run deploy:build && cd ..
git add -A && git commit -m "Add <thing>" && git push origin main
```

`deploy:build` runs `vite build`, copies `index.html`→`404.html`, wipes `client/`, and
repopulates it from the fresh build (including your `public/` file).

Then in the **Catalyst console → `visuallearning.onslate.in` Web Client Hosting (Slate) →
click "Sync now"**. This is **required** — Slate does not auto-deploy on push.

## Step 3 — Verify

- **Locally:** `cd client && python3 -m http.server 4599`, open `http://localhost:4599/`.
  Turn on **Explore mode** in the sidebar to reach the new page without completing the
  course before it, then open it — it should render inside the frame. Check the direct URL
  `/<category>/<slug>/index.html` still loads the raw page too.
- **Live, after Slate sync:** hard-refresh (Cmd+Shift+R) `https://visuallearning.onslate.in/`.

## Rules & gotchas (what has bitten us before)

1. **`src` MUST end in `/index.html`** and match the `public/`-stripped URL. A bare
   directory path hits the SPA fallback instead of the file.
2. **Lesson `id` must be unique within its module** — it is the last segment of the route
   and the key progress is stored under. Changing an `id` later silently resets everyone's
   completion for that page.
3. **Keep the page self-contained.** It runs in an iframe: no dependency on the parent
   page's styles, and nothing that tries to break out of the frame.
4. **Always run `deploy:build` before committing.** `client/` is what's hosted; skipping the
   rebuild means source and live site silently drift.
5. **`deploy:build` runs `rm -rf ../client/*`** — never hand-edit files in `client/`; all
   content must originate in `client-src/` (`src/` or `public/`).
6. **Slate Sync is manual** after every push; pushing alone doesn't deploy.
7. **Folder names under `public/` stay lowercase** (`java`/`python`/`others`) even though the
   course ids are `java` / `python` / `problem-solving`. The `others/` folder predates the
   Problem Solving course name; leave it as is so existing URLs keep working.
8. **Don't add explanation/theory pages.** The course deliberately shows only the
   interactive projects — that was an explicit product decision.
