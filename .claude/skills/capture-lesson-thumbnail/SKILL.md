---
name: capture-lesson-thumbnail
description: >-
  Use when a Visual Learning lesson needs its card image — creating the `thumb.png` for a
  newly added lab, replacing a stale one after a page is redesigned, or fixing a card that
  is falling back to the generic per-course art. Drives headless Chrome over the DevTools
  protocol to capture a real 1280x800 screenshot of the lab page itself, after running an
  optional setup snippet that puts the page into a populated state (sign in, run a step,
  open a tab) so the card shows the project working rather than an empty landing screen.
  Always run as part of adding a project — see the add-visual-learning-project skill.
  Triggers on "create the thumbnail", "make a thumb.png", "the card has no image", "screenshot
  the lab", "regenerate the thumbnail", "thumbnail for the new page".
---

# Capture a lesson thumbnail

Every lesson card on a course path shows `thumb.png` from the lab's own folder. Without
one the card falls back to the generic per-course art, and a path of identical cards is
the single thing that makes the course look unfinished.

**The thumbnail is a real screenshot of the page.** Not a mockup, not a logo, not a
generated illustration — a capture of the lab actually running, so the card previews what
the learner is about to open.

## Hard constraints

| | |
| --- | --- |
| Size | **exactly 1280x800** — every existing thumb is, and the card assumes the 8:5 shape |
| Path | `client-src/public/labs/<folder>/<slug>/thumb.png`, beside that lab's `index.html` |
| Crop | the card is `object-fit: cover` centred, so **the middle of the image is what people see**; the top and bottom edges get trimmed |

## Run it

```bash
node .claude/skills/capture-lesson-thumbnail/shoot.mjs java/<slug>
```

That serves `client-src/public` on its own ephemeral port, loads the lab, captures, and
writes `thumb.png` into the lab's folder. It needs no dev server, no npm install, and no
network — just a Chrome already on the machine (it finds the newest Playwright chromium in
`~/Library/Caches/ms-playwright`, else a system Chrome).

Useful flags:

```bash
--setup <file>   JS expression run in the page before the capture (awaited)
--wait <ms>      settle time after load, and again after setup     (default 1800)
--scroll <px>    scroll down this far before capturing             (default 0)
--out <file>     write somewhere else — use this for drafts        (default: the thumb.png)
--keep-open      leave the static server up so you can look at the page yourself
```

**Draft to the scratchpad first** (`--out <scratchpad>/draft.png`), read the PNG back and
look at it, and only write the real `thumb.png` once the frame is right. A bad thumbnail is
worse than none: it ships to the card and nobody notices it is wrong.

## Choosing the moment (the part that needs judgment)

Most labs open on a screen that says nothing — an empty playground, a sign-in form, a
"press Run to begin" splash. Capturing that gives a dead card. Get the page into the state
that shows what it *does*, then shoot:

- **Interactive walkthroughs** — start the trace and step a few steps in, so a box is lit,
  an arrow has travelled and the caption reads as an explanation.
- **Apps with accounts** — sign in with a seeded demo account and land on the populated
  view (a feed, a board, a list), never the login screen.
- **Anything animating** — pause it. A frame caught mid-transition looks like a rendering
  bug, with half-faded elements.
- **Keep the heading in frame** if it fits; it names the project. Do not scroll so far that
  a line of body text is sliced across the top edge, which reads as a broken capture.
- **Prefer variety between neighbouring cards.** Two adjacent lessons that both shoot their
  flow diagram produce two grey cards that look like a duplicate entry.

### The setup snippet

`--setup` takes a file holding **one JavaScript expression**, evaluated in the page and
awaited. Return something small that proves the setup landed — it gets printed, and it is
how you catch a selector that silently matched nothing:

```js
(async () => {
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const form = document.querySelector('form[data-form="signin"]');
  form.username.value = 'rajan_t';
  form.password.value = 'quotes123';
  form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  await wait(1400);
  location.hash = '#/feed'; await wait(1000);
  return { hash: location.hash, posts: document.querySelectorAll('[data-post]').length };
})()
```

Call the lab's own functions where it has them (`runPG()`, `nextPG()`) rather than clicking
by coordinate — it is shorter and it does not break when the layout moves.

### Keep the recipe

If a lab needed a setup snippet, save it as
`.claude/skills/capture-lesson-thumbnail/setups/<folder>-<slug>.js`. The script picks that
file up automatically on later runs, so the shot can be retaken after the page changes
without anyone reconstructing how it was staged. It lives here rather than in the lab
folder so it never ships into the hosted build. See `setups/` for the two worked examples.

## After the capture

1. **Drop `thumb: false`** from that lesson's entry in `client-src/src/data/courses.js` if
   it is there — the flag is what forces the fallback art, and leaving it means the new
   file is ignored.
2. **Rebuild:** `cd client-src && npm run deploy:build`. The PNG is under `public/`, so it
   only reaches `client/` — the directory Slate actually hosts — through a build.
3. **Verify on the built site**, not just on disk: serve `client/`, open the course page,
   scroll the card into view and confirm the `<img>` resolves to
   `/labs/<folder>/<slug>/thumb.png` and decodes at 1280x800. Cards are `loading="lazy"`,
   so a thumb that never entered the viewport reports `naturalWidth: 0` — scroll to it or
   set `loading = 'eager'` before believing a failure.

## What has bitten us

1. **A stale `http.server` from an earlier session** holding the port you just picked will
   serve an old directory and 404 every new file, which looks exactly like a broken build.
   Check `lsof -ti:<port>` before trusting a 404.
2. **`thumb: false` left behind** — the file is committed, the build is fine, and the card
   still shows course art.
3. **Forgetting the rebuild.** `client/` is what ships; a thumb that exists only in
   `client-src/public/` is invisible to the live site.
4. **Retina capture.** The script pins `deviceScaleFactor: 1` on purpose. A 2560x1600 PNG
   is four times the bytes for a card rendered about 90px wide.
5. **Don't hand-edit anything in `client/`** — `deploy:build` wipes it. The PNG belongs in
   `client-src/public/labs/<folder>/<slug>/`.
