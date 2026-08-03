# Visual Learning

A growable **React single-page app** that catalogs assignments / mini-projects as
cards, grouped into three categories: **Java**, **Python**, and **Others**. Each
assignment is a route inside the app. **No authentication** — fully open.

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
│   ├── public/          # client-package.json (homepage/404), logo.svg
│   └── src/
│       ├── main.jsx     # BrowserRouter (basename from BASE_URL)
│       ├── App.jsx      # routes generated from data/topics.js
│       ├── data/topics.js   # single source of truth (cards + routes)
│       ├── styles/          # base.css, catalog.css, topic.css
│       ├── components/      # Header, CategoryFilter, Toolbar, TopicCard, TopicGrid, TopicPageLayout
│       └── pages/           # HomePage, NotFoundPage, topics/<category>/<Name>.jsx
└── client/              # ← BUILD OUTPUT (committed; Catalyst hosts this)
```

`client/` is generated from `client-src/` and **committed to Git** — Catalyst's
Git-connected hosting deploys the files it finds in `client/` (it does not run a build),
so the compiled output ships in the repo. `.gitignore` excludes only `node_modules/`,
`client-src/dist/`, and `.catalystrc`.

---

## Local development

```bash
cd client-src
npm install
npm run dev
```

Open the Vite URL it prints. Hot-reload as you edit `src/`.

To preview the exact production build:

```bash
npm run deploy:build   # builds dist/, copies into ../client/ (with 404.html = index.html)
npm run preview
```

---

## Add a new assignment (the growable bit)

Two steps — the card, the route, and the category/tag filters all update automatically:

1. **Create a page component** under `src/pages/topics/<category>/<Name>.jsx`. The
   quickest start is to reuse `TopicPageLayout`:
   ```jsx
   import TopicPageLayout from '../../../components/TopicPageLayout';
   export default function BubbleSort() {
     return (
       <TopicPageLayout badge="Java" accent="#C74634" accentBg="#FBEAE7"
         title="Bubble Sort" lead="Sort an array in place."
         codeHtml={`// your code`} placeholder={false} />
     );
   }
   ```
2. **Register it** in `src/data/topics.js` — import the component and add one entry:
   ```js
   { path: '/java/bubble-sort', title: 'Bubble Sort', description: '…',
     category: 'Java', tags: ['Java'], dateAdded: '2026-08-03', Component: BubbleSort }
   ```

A non-topic page (About, etc.) = add one `<Route>` + component in `src/App.jsx`.

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
3. **On later pushes** — click **Sync** on the repo in the console to redeploy.

> If assets 404 because Catalyst mounts the client under a subpath, rebuild with
> `VITE_BASE_PATH=/app/ npm run deploy:build`, commit, push, Sync. The router adapts
> automatically. Deep links / refreshes work via `client/404.html` (a copy of
> `index.html`) registered in `client/client-package.json`.

---

## Deferred

No authentication and no backend function in this pass. `catalyst.json` leaves room to
add Catalyst functions later without touching the catalog code.
