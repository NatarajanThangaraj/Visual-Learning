# Visual Learning

A **React single-page course platform**. Three courses — **Java**, **Python** and
**Problem Solving** — each split into numbered modules, each module a vertical path of
pages. Every page is one of the self-contained interactive projects under `public/`, shown
inside the course chrome. Progress is kept in the browser; there is **no authentication and
no backend**.

Built with **React 18 + Vite + React Router**, hosted on **Zoho Catalyst** (Web Client
Hosting / "Slate") — Catalyst serves the compiled static build the same way Netlify or
Vercel would.

---

## Layout

```
Visual-Learning/
├── catalyst.json        # Slate config — hosts the client/ folder
├── client-src/          # ← React + Vite SOURCE (you develop here)
│   ├── package.json     # scripts: dev / build / preview / deploy:build
│   ├── vite.config.js   # base '/' (VITE_BASE_PATH override), outDir dist
│   ├── index.html       # dev entry
│   ├── public/          # the projects: <category>/<slug>/index.html + thumb.png
│   └── src/
│       ├── main.jsx     # BrowserRouter (basename from BASE_URL)
│       ├── App.jsx      # routes — all wrapped in AppShell
│       ├── data/
│       │   └── courses.js       # ← single source of truth: courses → modules → lessons
│       ├── hooks/       # useProgress (localStorage), useMediaQuery
│       ├── styles/      # base.css, shell.css, course.css, lesson.css, catalog.css
│       ├── components/
│       │   ├── shell/   # AppShell, Sidebar
│       │   ├── course/  # CourseHero, ModuleSection, LessonNode, LessonThumb, CourseIcon
│       │   └── lesson/  # LessonShell, EmbeddedLab
│       └── pages/       # HomePage, CoursePage, LessonPage, BrowsePage, NotFoundPage
└── client/              # ← BUILD OUTPUT (committed; Catalyst hosts this)
```

`client/` is generated from `client-src/` and **committed to Git** — Catalyst's
Git-connected hosting deploys the files it finds in `client/` (it does not run a build),
so the compiled output ships in the repo.

## Routes

| Route | Page |
|---|---|
| `/` | Course cards + resume-where-you-left-off |
| `/browse` | The flat catalog — every page, searchable |
| `/:courseId` | Course page — hero, modules, lesson path |
| `/:courseId/:lessonId` | One page, embedded in the course chrome |
| `/:courseId/:lessonId/full` | That page on its own — no sidebar, no chrome |

So a page is `/java/my-expense-tracker`, and the module is not in the URL: lesson ids are
unique within a course, and leaving the module out means reorganising the modules never
breaks a link.

**No URL ends in a file name.** The pages are still real files under `public/`
(`/java/my-expense-tracker/index.html`), but nothing links to that path — the lab is
*fetched* and handed to the frame as `srcdoc` (the host sends `X-Frame-Options: DENY`, so
a plain `<iframe src>` would be blocked). "New tab" and the mobile hand-off go to the
`/full` route instead. Those direct file URLs still resolve, so old links stay valid.

Catalyst Slate serves an exact file if one is there and falls back to `404.html` (a copy of
`index.html`) otherwise — it never serves a directory index. That fallback is what makes
`/java/my-expense-tracker` reach the app at all.

### Old URLs

The previous `/learn/…` scheme redirects, so nothing that was shared before breaks:

| Old | Now |
|---|---|
| `/learn/java` | `/java` |
| `/learn/java/file-handling/my-expense-tracker` | `/java/my-expense-tracker` |
| `/others/luhn-algorithm` | `/problem-solving/luhn-algorithm` |

(The last one is the `others/` folder, which predates the Problem Solving course name and
still holds its files.)

## Progress and unlocking

`src/hooks/useProgress.js` keeps `{ completed, last, explore }` in `localStorage` under
`vl:progress:v1`. The first page of a course is always open; every later one unlocks when
the page before it is marked complete. The **Explore mode** switch at the bottom of the
sidebar unlocks everything — use it when demonstrating one specific page. Every storage read
is guarded, so a private window simply starts from zero.

---

## Local development

```bash
cd client-src
npm install
npm run dev
```

To preview the exact production build:

```bash
npm run deploy:build   # builds dist/, copies into ../client/ (with 404.html = index.html)
cd ../client && python3 -m http.server 4599
```

---

## Add a page

Everything is registered in **one file**: `client-src/src/data/courses.js`.

1. Drop the self-contained folder at `client-src/public/<folder>/<id>/index.html`
   (plus a `thumb.png` screenshot beside it), where `<folder>` is the course's `folder`
   field — `java`, `python` or `others`.
2. Add one entry to the right module's `lessons` array — identity only, no paths:
   ```js
   { id: 'smart-traffic-signal', title: 'Smart Traffic Signal', minutes: 25,
     blurb: 'One-line summary shown on the card.' },
   ```
   The `id` **is** the folder name: the file, the thumbnail and both URLs are derived from
   it. If there is no `thumb.png` yet, add `thumb: false` and the card falls back to the
   course's art.

The card, the route, the sidebar counts, next/prev and unlocking all follow automatically.
A new module is just another `{ id, title, summary, lessons: [] }` object in the course's
`modules` array. See the `add-visual-learning-project` skill in `.claude/skills/` for the
full checklist.

---

## Deploy to Catalyst Slate (Git-connected)

1. **Build + commit + push** whenever you change something:
   ```bash
   cd client-src && npm run deploy:build && cd ..
   git add -A && git commit -m "Update" && git push
   ```
2. **One-time — connect the repo** in the Catalyst console:
   - Fill `catalyst.json` `projectId` / `orgId` (from `catalyst init` or the console).
   - Console → **DevOps → Repositories → Git → Integrate GitHub**, authorize, select this
     repo, click **Deploy**. The `client/` folder goes live under
     **CloudScale → Host & Manage → Web Client Hosting**.
3. **On later pushes** — click **Sync now** on the repo in the console to redeploy.

> If assets 404 because Catalyst mounts the client under a subpath, rebuild with
> `VITE_BASE_PATH=/app/ npm run deploy:build`, commit, push, Sync. The router adapts
> automatically. Deep links / refreshes work via `client/404.html` (a copy of
> `index.html`) registered in `client/client-package.json`.

---

## Deferred

No authentication and no backend function in this pass — progress is per-browser.
`catalyst.json` leaves room to add Catalyst functions later without touching the course
code. Written lesson pages (theory between the projects) were tried and removed — the
course shows only the interactive pages.
