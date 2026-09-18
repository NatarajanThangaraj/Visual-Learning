/* QuotesOGram – Demo module.
 *
 * Draws the class-flow diagram for one operation and walks through it a step
 * at a time: each step lights up a box or an arrow and explains what travels
 * along it. Pick an operation from the tab on the left.
 *
 * Self-contained: app.js only has to hand it a container. */
'use strict';

window.Demo = (() => {
  const TOKEN_KEY = 'quotesogram.token';
  const ROW_H = 116;          // px per diagram row
  const DWELL = 3400;         // ms per step at 1x

  /* Same swap as app.js: no server to fetch from, so the request goes to
     backend.js in this page instead. */
  async function api(path) {
    const res = QuotesOgramServer.request('GET', `/api${path}`, {
      token: localStorage.getItem(TOKEN_KEY) || ''
    });
    const data = res.data || {};
    if (res.status >= 400) throw new Error(data.error || `Request failed (${res.status})`);
    return data;
  }

  const esc = (s) =>
    String(s ?? '').replace(/[&<>"']/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const state = {
    seq: 0,           // guards against a slow fetch painting over a newer flow
    box: null,
    catalog: null,
    flow: null,
    step: -1,
    playing: false,
    speed: 1,
    timer: null
  };

  /* -------------------------------------------------------------- markup */

  function shell() {
    return `
    <section class="demo">
      <aside class="demo__side">
        <div class="side__head">Flows</div>
        ${state.catalog.groups.map((g) => `
          <div class="side__group">
            <b>${esc(g.name)}</b>
            ${g.flows.map((f) => `
              <button class="side__item" data-flow="${f.id}" title="${esc(f.title)}">
                ${esc(f.name)}
              </button>`).join('')}
          </div>`).join('')}
      </aside>
      <div class="demo__main" data-main></div>
    </section>`;
  }

  function flowMarkup(flow) {
    const rows = Math.max(...flow.nodes.map((n) => n.row)) + 1;
    const cols = Math.max(...flow.nodes.map((n) => n.col)) + 1;

    return `
      <header class="flow__head">
        <h2>${esc(flow.title)}</h2>
        <p class="flow__sub">${esc(flow.subtitle)}</p>
      </header>

      <div class="controls card">
        <button class="btn btn--sm" data-ctl="restart" title="Restart">&#9198;</button>
        <button class="btn btn--sm" data-ctl="prev" title="Previous step">&#9194;</button>
        <button class="btn btn--sm btn--primary" data-ctl="play">&#9654; Play</button>
        <button class="btn btn--sm" data-ctl="next" title="Next step">&#9193;</button>
        <div class="controls__bar"><i data-bar></i></div>
        <span class="faint" data-progress></span>
        <label class="controls__speed">speed
          <select data-speed>
            <option value="0.5">0.5&times;</option>
            <option value="1" selected>1&times;</option>
            <option value="2">2&times;</option>
          </select>
        </label>
      </div>

      <div class="caption card" data-caption></div>

      <div class="diagram card" data-diagram>
        <div class="diagram__inner" style="--rows:${rows};--cols:${cols};min-height:${rows * ROW_H}px">
          <svg class="diagram__edges" data-edges aria-hidden="true">
            <defs>
              <marker id="ah" viewBox="0 0 10 10" refX="9" refY="5"
                      markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0 0 L10 5 L0 10 z" fill="currentColor"/>
              </marker>
            </defs>
          </svg>
          ${flow.nodes.map(nodeMarkup).join('')}
          ${flow.edges.map((e) => `
            <span class="elabel" data-elabel="${e.id}">${esc(e.label)}</span>`).join('')}
        </div>
      </div>`;
  }

  function nodeMarkup(n) {
    return `
      <div class="dnode dnode--${n.kind}" data-node="${n.id}"
           style="grid-row:${n.row + 1};grid-column:${n.col + 1}">
        <b>${esc(n.label)}</b>
        ${n.sub ? `<small>${esc(n.sub)}</small>` : ''}
        ${n.methods ? `<span class="dnode__methods">${n.methods.map(esc).join('<br>')}</span>` : ''}
        ${n.note ? `<em>${esc(n.note)}</em>` : ''}
      </div>`;
  }

  /* ------------------------------------------------------------- drawing */

  /** Lay the arrows out from where the boxes actually ended up. */
  function drawEdges() {
    const inner = state.box.querySelector('.diagram__inner');
    const svg = state.box.querySelector('[data-edges]');
    if (!inner || !svg || !state.flow) return;

    const box = inner.getBoundingClientRect();
    svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
    svg.style.width = `${box.width}px`;
    svg.style.height = `${box.height}px`;
    [...svg.querySelectorAll('path.edge')].forEach((p) => p.remove());

    const rel = (el) => {
      const r = el.getBoundingClientRect();
      return {
        left: r.left - box.left,
        right: r.left - box.left + r.width,
        top: r.top - box.top,
        bottom: r.top - box.top + r.height,
        cx: r.left - box.left + r.width / 2,
        mid: r.top - box.top + r.height / 2
      };
    };

    // every box, so labels can be kept off them
    const obstacles = [...state.box.querySelectorAll('[data-node]')].map(rel);

    state.flow.edges.forEach((e) => {
      const a = state.box.querySelector(`[data-node="${e.from}"]`);
      const b = state.box.querySelector(`[data-node="${e.to}"]`);
      if (!a || !b) return;
      const s = rel(a);
      const t = rel(b);

      let d;
      let anchor;

      if (t.top >= s.bottom - 2) {
        if (Math.abs(s.cx - t.cx) < 6) {
          // straight down the same column
          d = `M${s.cx} ${s.bottom} L${t.cx} ${t.top}`;
          anchor = [s.cx, (s.bottom + t.top) / 2];
        } else {
          // leave sideways, run across, then drop - this keeps the line out of
          // whatever sits directly below the source box
          const x1 = t.cx > s.cx ? s.right : s.left;
          d = `M${x1} ${s.mid} L${t.cx} ${s.mid} L${t.cx} ${t.top}`;
          anchor = [(x1 + t.cx) / 2, s.mid];
        }
      } else {
        // same row
        const fromRight = t.left > s.left;
        const x1 = fromRight ? s.right : s.left;
        const x2 = fromRight ? t.left : t.right;
        d = `M${x1} ${s.mid} L${x2} ${t.mid}`;
        anchor = [(x1 + x2) / 2, (s.mid + t.mid) / 2];
      }

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', d);
      path.setAttribute('class', `edge${e.dashed ? ' edge--dashed' : ''}`);
      path.setAttribute('marker-end', 'url(#ah)');
      path.dataset.edge = e.id;
      svg.appendChild(path);

      placeLabel(e, path, anchor, obstacles, s, t);
    });

    paintFocus();
  }

  /** Put an arrow's caption on the line, but never on top of a box. */
  function placeLabel(edge, path, anchor, obstacles, s, t) {
    const label = state.box.querySelector(`[data-elabel="${edge.id}"]`);
    if (!label) return;
    label.hidden = !edge.label;
    if (!edge.label) return;

    const w = label.offsetWidth;
    const h = label.offsetHeight;
    const clear = ([x, y]) => !obstacles.some((o) =>
      x + w / 2 > o.left - 3 && x - w / 2 < o.right + 3 &&
      y + h / 2 > o.top - 3 && y - h / 2 < o.bottom + 3);

    let point = anchor;
    if (!clear(point)) {
      const len = path.getTotalLength();
      const onLine = [0.5, 0.35, 0.65, 0.22, 0.78, 0.12, 0.88]
        .map((f) => { const p = path.getPointAtLength(len * f); return [p.x, p.y]; });
      // if the line itself is too tight (short hops between neighbours),
      // step the caption just above or below it
      const offLine = onLine.flatMap(([x, y]) => [[x, y - h - 4], [x, y + h + 4]]);
      // last resort for neighbours sitting almost shoulder to shoulder:
      // park the caption clear of both boxes, above or below them
      const beside = [
        [anchor[0], Math.min(s.top, t.top) - h / 2 - 5],
        [anchor[0], Math.max(s.bottom, t.bottom) + h / 2 + 5]
      ];
      point = onLine.find(clear) || offLine.find(clear) || beside.find(clear) || anchor;
    }

    label.style.left = `${point[0]}px`;
    label.style.top = `${point[1]}px`;
  }

  /* ------------------------------------------------------------ stepping */

  function paintFocus() {
    const box = state.box;
    if (!box || !state.flow) return;
    const now = new Set(state.step >= 0 ? state.flow.steps[state.step].focus : []);
    const seen = new Set();
    state.flow.steps.slice(0, Math.max(0, state.step)).forEach((s) =>
      s.focus.forEach((f) => seen.add(f)));

    const mark = (el, id) => {
      el.classList.toggle('is-on', now.has(id));
      el.classList.toggle('is-done', !now.has(id) && seen.has(id));
      el.classList.toggle('is-idle', !now.has(id) && !seen.has(id));
    };

    box.querySelectorAll('[data-node]').forEach((el) => mark(el, el.dataset.node));
    box.querySelectorAll('[data-edge]').forEach((el) => mark(el, el.dataset.edge));
    box.querySelectorAll('[data-elabel]').forEach((el) => mark(el, el.dataset.elabel));
  }

  function show(index) {
    const steps = state.flow.steps;
    state.step = Math.max(-1, Math.min(index, steps.length - 1));
    const box = state.box;
    const s = steps[state.step];

    box.querySelector('[data-caption]').innerHTML = s
      ? `<b class="caption__n">${state.step + 1}</b>
         <div><b class="caption__title">${esc(s.title)}</b><p>${esc(s.text)}</p></div>`
      : `<div class="caption__idle">Press <b>Play</b> to walk through the diagram,
           or step with the arrow keys.</div>`;

    box.querySelector('[data-progress]').textContent =
      `${Math.max(0, state.step + 1)} / ${steps.length}`;
    box.querySelector('[data-bar]').style.width =
      `${((state.step + 1) / steps.length) * 100}%`;

    paintFocus();
  }

  function play() {
    if (state.step >= state.flow.steps.length - 1) show(-1);
    state.playing = true;
    const btn = state.box.querySelector('[data-ctl=play]');
    if (btn) btn.innerHTML = '&#10073;&#10073; Pause';
    tick();
  }

  function pause() {
    state.playing = false;
    clearTimeout(state.timer);
    const btn = state.box?.querySelector('[data-ctl=play]');
    if (btn) btn.innerHTML = '&#9654; Play';
  }

  function tick() {
    clearTimeout(state.timer);
    if (!state.playing) return;
    if (state.step >= state.flow.steps.length - 1) return pause();
    show(state.step + 1);
    state.timer = setTimeout(tick, DWELL / state.speed);
  }

  /* --------------------------------------------------------------- wiring */

  async function loadFlow(id, seq) {
    pause();
    const main = state.box.querySelector('[data-main]');
    main.innerHTML = `<p class="empty card">loading…</p>`;
    state.box.querySelectorAll('.side__item').forEach((b) =>
      b.classList.toggle('is-active', b.dataset.flow === id));

    const flow = await api(`/demo/${id}`);
    if (seq !== state.seq) return;          // a newer flow was picked meanwhile
    state.flow = flow;
    main.innerHTML = flowMarkup(state.flow);
    show(-1);
    // Draw synchronously (reading the boxes forces the layout we need). A second
    // pass shortly after catches any late reflow; requestAnimationFrame is not
    // used because it never fires while the page is hidden or not compositing.
    drawEdges();
    setTimeout(() => { if (seq === state.seq) drawEdges(); }, 80);

    main.querySelector('[data-ctl=play]').onclick = () => (state.playing ? pause() : play());
    main.querySelector('[data-ctl=next]').onclick = () => { pause(); show(state.step + 1); };
    main.querySelector('[data-ctl=prev]').onclick = () => { pause(); show(state.step - 1); };
    main.querySelector('[data-ctl=restart]').onclick = () => { pause(); show(-1); };
    main.querySelector('[data-speed]').onchange = (e) => { state.speed = Number(e.target.value); };
    main.querySelector('.diagram').onclick = (e) => {
      const n = e.target.closest('[data-node]');
      if (!n) return;
      const i = state.flow.steps.findIndex((s) => s.focus.includes(n.dataset.node));
      if (i > -1) { pause(); show(i); }
    };

    play();
  }

  function onKey(e) {
    if (!state.box || !state.box.isConnected) {
      document.removeEventListener('keydown', onKey);
      pause();
      return;
    }
    if (!state.flow) return;
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
    if (e.key === 'ArrowRight') { pause(); show(state.step + 1); }
    else if (e.key === 'ArrowLeft') { pause(); show(state.step - 1); }
    else if (e.key === ' ') { e.preventDefault(); state.playing ? pause() : play(); }
  }

  let resizeTimer = null;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => state.flow && drawEdges(), 120);
  }

  /* ---------------------------------------------------------------- entry */

  async function render(container, flowId) {
    pause();
    const seq = ++state.seq;
    state.box = container;
    state.flow = null;
    state.step = -1;

    container.innerHTML = `<p class="empty card">loading the demo…</p>`;
    if (!state.catalog) state.catalog = await api('/demo');
    if (seq !== state.seq) return;
    container.innerHTML = shell();

    container.querySelectorAll('.side__item').forEach((b) => {
      b.onclick = () => { location.hash = `#/demo/${b.dataset.flow}`; };
    });

    document.removeEventListener('keydown', onKey);
    document.addEventListener('keydown', onKey);
    window.removeEventListener('resize', onResize);
    window.addEventListener('resize', onResize, { passive: true });

    const all = state.catalog.groups.flatMap((g) => g.flows.map((f) => f.id));
    await loadFlow(all.includes(flowId) ? flowId : 'create-post', seq);
  }

  return { render, pause };
})();
