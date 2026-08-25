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
| `/learn/:courseId` | Course page — hero, modules, lesson path |
| `/learn/:courseId/:moduleId/:lessonId` | One page, embedded in the course chrome |
| `/browse` | The flat catalog — every page, searchable |

The `/learn/` prefix is deliberate: the pages are **real files** under `public/`
(`/java/riya-job-hunt/index.html` and friends), and the prefix keeps SPA routes from ever
shadowing them. Those direct URLs still work, so old links and bookmarks are safe.

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

1. Drop the self-contained folder at `client-src/public/<category>/<slug>/index.html`
   (plus a `thumb.png` screenshot beside it).
2. Add one entry to the right module's `lessons` array:
   ```js
   { id: 'smart-traffic-signal', title: 'Smart Traffic Signal', minutes: 25,
     blurb: 'One-line summary shown on the card.',
     src: '/java/smart-traffic-signal/index.html',
     thumbnail: '/java/smart-traffic-signal/thumb.png' },
   ```

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
