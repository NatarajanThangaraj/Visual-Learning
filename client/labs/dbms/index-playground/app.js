/* Index Playground (site). Built from approved design v3, 2026-11-02.
   Plain JS, no libraries, no network. Toy data only.
   Steps 1-4 are analogies; step 5 is MySQL. Source IDs live in data-src attributes and content/copy.md. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  const params = new URLSearchParams(location.search);
  // One switch for reduced motion: the OS setting, or ?reduce=1 for testing. CSS follows the same class.
  const syncMotion = () => document.documentElement.classList.toggle('reduce-motion', reduceMQ.matches || params.get('reduce') === '1');
  syncMotion(); if (reduceMQ.addEventListener) reduceMQ.addEventListener('change', syncMotion);
  const reduced = () => document.documentElement.classList.contains('reduce-motion');
  const announce = text => { const s = document.getElementById('sr-status'); if (!s) return; s.textContent = ''; setTimeout(() => { s.textContent = text; }, 30); };
  const NS = 'http://www.w3.org/2000/svg';
  const bump = el => { if (reduced()) return; el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); };
  const setHint = (el, text, kind) => { el.textContent = text; el.className = 'hint' + (kind ? ' ' + kind : ''); };

  /* ---------- toy data: 48 made-up students ---------- */
  const NAMES = ['Aarav', 'Aditi', 'Aisha', 'Ananya', 'Arjun', 'Ben', 'Chen', 'Chloe', 'Daniel', 'Deepa', 'Diya', 'Emma',
    'Farhan', 'Fatima', 'Gauri', 'Hana', 'Harini', 'Ishaan', 'Ivan', 'Jai', 'Kabir', 'Kavya', 'Kiran', 'Leo',
    'Lina', 'Maya', 'Meera', 'Mohan', 'Nadia', 'Neha', 'Nikhil', 'Noah', 'Olivia', 'Omar', 'Pooja', 'Priya',
    'Rahul', 'Ravi', 'Riya', 'Rohan', 'Sam', 'Sara', 'Sneha', 'Sofia', 'Tanvi', 'Tom', 'Vikram', 'Zara'];
  const MORE = ['Abhay', 'Akira', 'Alex', 'Amara', 'Anil', 'Bella', 'Dev', 'Elena', 'Esha', 'Felix', 'Gita', 'Grace',
    'Hari', 'Isha', 'Ishita', 'Jack', 'Jiya', 'Kai', 'Karan', 'Lara', 'Liam', 'Lucas', 'Mira', 'Mona',
    'Nina', 'Nora', 'Om', 'Parth', 'Pia', 'Quinn', 'Raj', 'Rhea', 'Rio', 'Ruby', 'Sahil', 'Sana',
    'Sia', 'Theo', 'Uma', 'Usha', 'Varun', 'Vera', 'Wen', 'Yash', 'Yara', 'Yusuf', 'Zaid', 'Zoe'];
  const TARGET = 'Kavya', PER = 12, SIGN = 4;
  // deterministic shuffle so the table looks random but is the same on every visit
  let seed = 7; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const order = NAMES.map(n => [n, rnd()]).sort((a, b) => a[1] - b[1]).map(x => x[0]);
  const ki = order.indexOf(TARGET); [order[ki], order[41]] = [order[41], order[ki]]; // Kavya gets roll no 42
  const students = order.map((name, i) => ({ roll: i + 1, name, marks: 40 + Math.floor(rnd() * 60) }));
  const byName = n => students.find(s => s.name.toLowerCase() === String(n).toLowerCase());
  const sorted = [...students].sort((a, b) => a.name.localeCompare(b.name));
  const kavya = byName(TARGET);

  /* ---------- step navigation ---------- */
  const TOTAL = 6; let step = 1; const seen = new Set([1]);
  const inits = {};
  function go(n, focus) {
    step = Math.max(1, Math.min(TOTAL, n)); seen.add(step);
    $$('.step').forEach(s => { s.hidden = +s.dataset.step !== step; });
    $$('.steps button').forEach(b => { const on = +b.dataset.go === step; if (on) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); b.classList.toggle('seen', seen.has(+b.dataset.go)); });
    $('#where').textContent = `Step ${step} of ${TOTAL}`;
    $('#prev').disabled = step === 1;
    $('#next').textContent = step === TOTAL ? 'Start again' : 'Next';
    if (inits[step]) inits[step]();
    if (focus) { const h = $(`#t${step}`); h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: reduced() ? 'auto' : 'smooth' }); }
  }
  const hashStep = () => parseInt((location.hash.match(/^#step-(\d)$/) || [])[1], 10) || 0;
  // Every move goes through the URL hash, so #step-N links and browser Back/Forward work.
  function navigate(n) { n = Math.max(1, Math.min(TOTAL, n)); if (hashStep() === n) go(n, true); else location.hash = '#step-' + n; }
  window.addEventListener('hashchange', () => go(hashStep() || 1, true)); // no hash = step 1
  $$('.steps button').forEach(b => b.addEventListener('click', () => navigate(+b.dataset.go)));
  $('#prev').addEventListener('click', () => navigate(step - 1));
  $('#next').addEventListener('click', () => navigate(step === TOTAL ? 1 : step + 1));

  /* ---------- step 1: the problem ---------- */
  const s1 = { checked: new Set(), found: false, timer: null };
  function render1() {
    const ol = $('#table-1');
    if (!ol.children.length) {
      for (const s of students) {
        const li = document.createElement('li');
        li.innerHTML = `<button type="button" class="rowbtn" data-roll="${s.roll}"><span class="r">${s.roll}</span><span class="n"></span><span class="m">${s.marks}</span></button>`;
        li.querySelector('.n').textContent = s.name;
        li.firstChild.setAttribute('aria-label', `Row ${s.roll}: ${s.name}, ${s.marks} marks`);
        ol.appendChild(li);
      }
      ol.addEventListener('click', e => { const b = e.target.closest('.rowbtn'); if (b) check1(+b.dataset.roll); });
    }
    $$('.rowbtn', ol).forEach(b => { const r = +b.dataset.roll; b.classList.toggle('checked', s1.checked.has(r)); b.classList.toggle('found', s1.found && r === kavya.roll); });
    $('#count-1').textContent = s1.checked.size;
    $('#take-1').hidden = !s1.found;
  }
  function check1(roll) {
    if (s1.found || s1.checked.has(roll)) return;
    s1.checked.add(roll); bump($('#count-1'));
    if (roll === kavya.roll) { s1.found = true; setHint($('#hint-1'), `Found her after checking ${s1.checked.size} rows.`, 'win'); }
    else setHint($('#hint-1'), s1.checked.size < 3 ? 'Not Kavya. Keep going.' : `Still looking… ${s1.checked.size} rows checked.`, '');
    render1();
  }
  $('#auto-1').addEventListener('click', () => {
    clearInterval(s1.timer); reset1(false);
    let r = 1;
    const stepOnce = () => { check1(r); const b = $(`.rowbtn[data-roll="${r}"]`); if (b && b.scrollIntoView) b.scrollIntoView({ block: 'nearest' }); r++; if (s1.found) clearInterval(s1.timer); };
    $('#stamp-1').setAttribute('aria-live', 'off');
    const done = () => { $('#stamp-1').setAttribute('aria-live', 'polite'); };
    if (reduced()) { while (!s1.found) stepOnce(); done(); } else s1.timer = setInterval(() => { stepOnce(); if (s1.found) done(); }, 70);
  });
  function reset1(hint = true) { clearInterval(s1.timer); s1.checked.clear(); s1.found = false; if (hint) setHint($('#hint-1'), 'Tap the rows, one by one.', ''); render1(); }
  $('#reset-1').addEventListener('click', () => reset1());
  inits[1] = render1;

  /* ---------- step 2: the idea of an index ---------- */
  const s2 = { letter: null, taps: 0, found: false };
  function render2() {
    const box = $('#letters-2');
    if (!box.children.length) {
      [...new Set(sorted.map(s => s.name[0]))].forEach(L => { const b = document.createElement('button'); b.type = 'button'; b.textContent = L; b.dataset.l = L; b.setAttribute('aria-pressed', 'false'); box.appendChild(b); });
      box.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; s2.letter = b.dataset.l; s2.taps++; bump($('#count-2')); if (!s2.found) setHint($('#hint-2'), s2.letter === 'K' ? 'Now tap Kavya.' : 'Kavya starts with K.', s2.letter === 'K' ? '' : 'lose'); render2(); });
      $('#names-2').addEventListener('click', e => {
        const b = e.target.closest('button'); if (!b || s2.found) return;
        s2.taps++; bump($('#count-2'));
        if (b.dataset.n === TARGET) { s2.found = true; setHint($('#hint-2'), `Kavya → row ${kavya.roll}. Found in ${s2.taps} taps, not ${kavya.roll}.`, 'win'); }
        else setHint($('#hint-2'), 'Not her. Look for Kavya.', 'lose');
        render2();
      });
    }
    $$('button', box).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.l === s2.letter)));
    const ul = $('#names-2'); ul.innerHTML = '';
    if (!s2.letter) { const li = document.createElement('li'); li.className = 'empty'; li.textContent = 'Pick a letter.'; ul.appendChild(li); }
    else sorted.filter(s => s.name[0] === s2.letter).forEach(s => {
      const li = document.createElement('li');
      li.innerHTML = `<button type="button" data-n="${s.name}"><span></span><span>→ row ${s.roll}</span></button>`;
      li.querySelector('span').textContent = s.name;
      if (s2.found && s.name === TARGET) li.firstChild.classList.add('found');
      ul.appendChild(li);
    });
    $('#count-2').textContent = s2.taps;
    $('#take-2').hidden = !s2.found;
  }
  inits[2] = render2;

  /* ---------- boards (steps 3 and 4): a list that folds into a tree ---------- */
  const pagesOf = list => { const out = []; for (let i = 0; i < list.length; i += PER) out.push(list.slice(i, i + PER)); return out; };
  const short = n => n.slice(0, 2);
  const range = pg => `${short(pg[0])}–${short(pg[pg.length - 1])}`;
  function offsetIn(el, root) { let x = 0, y = 0; while (el && el !== root) { x += el.offsetLeft; y += el.offsetTop; el = el.offsetParent; } return { x, y }; }
  function drawLinks(board, edges) {
    let svg = $('.links', board);
    if (!svg) { svg = document.createElementNS(NS, 'svg'); svg.setAttribute('class', 'links'); svg.setAttribute('aria-hidden', 'true'); board.prepend(svg); }
    svg.innerHTML = '';
    if (!board.classList.contains('folded')) return;
    for (const [a, b, on] of edges) {
      const pa = offsetIn(a, board), pb = offsetIn(b, board);
      const l = document.createElementNS(NS, 'line');
      l.setAttribute('x1', pa.x + a.offsetWidth / 2); l.setAttribute('y1', pa.y + a.offsetHeight);
      l.setAttribute('x2', pb.x + b.offsetWidth / 2); l.setAttribute('y2', pb.y);
      if (on) l.setAttribute('class', 'on');
      svg.appendChild(l);
    }
  }

  /* step 3 */
  const s3 = { open: null, opened: new Set(), found: false, folded: false };
  const pages48 = pagesOf(sorted.map(s => s.name));
  const kPage = pages48.findIndex(p => p.includes(TARGET));
  function render3() {
    const board = $('#board-3');
    board.classList.toggle('folded', s3.folded);
    board.style.setProperty('--cols', 4);
    board.innerHTML = `
      <div class="lvl lvl-top"><span class="lvl-label">root</span>
        <div class="node sign${s3.folded && s3.found ? ' on' : ''}" id="sign-3">
          <p class="node-t">Signpost</p>
          <div class="sign-rows">${pages48.map((p, i) => `<button type="button" data-p="${i}" class="${s3.opened.has(i) ? 'on' : ''}"><span>${p[0]}…</span><span>p. ${i + 1}</span></button>`).join('')}</div>
        </div>
      </div>
      <div class="lvl lvl-pages"><span class="lvl-label">leaves</span>
        ${pages48.map((p, i) => `<div class="node page${s3.open === i ? ' open' : ''}${s3.folded && s3.found && i === kPage ? ' on' : ''}" data-page="${i}">
            <p class="node-t">${s3.folded ? range(p) : `Page ${i + 1} · ${p[0]}–${p[p.length - 1]}`}</p>
            ${s3.open === i ? `<div class="page-rows">${p.map(n => `<button type="button" data-n="${n}" class="${s3.found && n === TARGET ? 'found' : ''}">${n}</button>`).join('')}</div>` : ''}
          </div>`).join('')}
      </div>`;
    $('#count-3').textContent = s3.opened.size;
    $('#fold-3').setAttribute('aria-pressed', String(s3.folded));
    $('#fold-3').textContent = s3.folded ? 'Back to the list' : 'See its shape';
    $('#take-3').hidden = !s3.folded;
    $('#desc-3').textContent = s3.folded
      ? `Shown as a tree: the signpost is the root on top; four pages are the leaves below: ${pages48.map(range).join(', ')}.${s3.found ? ` Kavya's path: signpost, then page ${kPage + 1}.` : ''}`
      : 'A signpost with four lines, each pointing to one page of twelve sorted names. Opening a signpost line opens that page.';
    const sign = $('#sign-3', board);
    drawLinks(board, $$('.node.page', board).map(p => [sign, p, s3.found && +p.dataset.page === kPage]));
  }
  $('#board-3').addEventListener('click', e => {
    if (s3.folded) return;
    const sb = e.target.closest('.sign-rows button');
    if (sb) {
      const i = +sb.dataset.p; s3.open = i;
      if (!s3.opened.has(i)) { s3.opened.add(i); bump($('#count-3')); }
      if (!s3.found) setHint($('#hint-3'), i === kPage ? 'Now tap Kavya.' : 'Kavya isn’t on this page. Check the signpost.', i === kPage ? '' : 'lose');
      render3(); return;
    }
    const nb = e.target.closest('.page-rows button');
    if (nb && !s3.found) {
      if (nb.dataset.n === TARGET) { s3.found = true; setHint($('#hint-3'), `Found in ${s3.opened.size} page${s3.opened.size > 1 ? 's' : ''}. Now tap “See its shape”.`, 'win'); }
      else setHint($('#hint-3'), 'Not her. Look for Kavya.', 'lose');
      render3();
    }
  });
  $('#fold-3').addEventListener('click', () => { s3.folded = !s3.folded; if (s3.folded) announce('The list is now drawn as a tree. Top: the root. Bottom: the leaves.'); if (s3.folded) { s3.open = null; setHint($('#hint-3'), 'Same signpost, same pages. Just a different shape.', ''); } render3(); });
  inits[3] = render3;

  /* step 4 (toy rule: a signpost holds 4 lines, a page holds 12 names) */
  const s4 = { big: false };
  function render4() {
    const names = (s4.big ? [...NAMES, ...MORE] : NAMES).slice().sort((a, b) => a.localeCompare(b));
    const pgs = pagesOf(names), kp = pgs.findIndex(p => p.includes(TARGET));
    const groups = []; for (let i = 0; i < pgs.length; i += SIGN) groups.push(pgs.slice(i, i + SIGN));
    const kg = Math.floor(kp / SIGN);
    const board = $('#board-4');
    board.style.setProperty('--cols', pgs.length);
    const pageHtml = pgs.map((p, i) => `<div class="node page${i === kp ? ' on' : ''}" data-i="${i}"><p class="node-t">${range(p)}</p></div>`).join('');
    if (groups.length === 1) {
      board.innerHTML = `<div class="lvl"><span class="lvl-label">root</span><div class="node sign on" id="root-4"><p class="node-t">Signpost</p></div></div>
        <div class="lvl lvl-pages"><span class="lvl-label">leaves</span>${pageHtml}</div>`;
    } else {
      board.innerHTML = `<div class="lvl"><span class="lvl-label">root</span><div class="node sign on" id="root-4"><p class="node-t">Top signpost</p></div></div>
        <div class="lvl lvl-mid">${groups.map((g, j) => `<div class="node sign${j === kg ? ' on' : ''}" data-g="${j}"><p class="node-t">${short(g[0][0])}…</p></div>`).join('')}</div>
        <div class="lvl lvl-pages"><span class="lvl-label">leaves</span>${pageHtml}</div>`;
    }
    const levels = groups.length === 1 ? 2 : 3;
    $('#stats-4').innerHTML = `<div>Students<b>${names.length}</b></div><div>Row by row<b>up to ${names.length}</b>checks</div><div>With the tree<b>${levels}</b>pages to open</div>`;
    $('#grow-4').setAttribute('aria-pressed', String(s4.big));
    $('#grow-4').textContent = s4.big ? 'Back to 48' : 'Add 48 students';
    setHint($('#hint-4'), s4.big ? 'A new level appeared on top. Kavya’s path is in red.' : 'Kavya’s path is marked in red.', '');
    $('#desc-4').textContent = groups.length === 1
      ? `${names.length} students. Root signpost on top, ${pgs.length} leaf pages below. Kavya's path: root, then page ${kp + 1}.`
      : `${names.length} students. Root signpost on top, ${groups.length} middle signposts, ${pgs.length} leaf pages. Kavya's path: root, middle signpost ${kg + 1}, page ${kp + 1}.`;
    const root = $('#root-4', board), pages = $$('.node.page', board);
    {
      const edges = [];
      if (groups.length === 1) pages.forEach(p => edges.push([root, p, +p.dataset.i === kp]));
      else {
        const mids = $$('.lvl-mid .node', board);
        mids.forEach(m => edges.push([root, m, +m.dataset.g === kg]));
        pages.forEach(p => { const i = +p.dataset.i; edges.push([mids[Math.floor(i / SIGN)], p, i === kp]); });
      }
      drawLinks(board, edges);
    }
  }
  $('#grow-4').addEventListener('click', () => { s4.big = !s4.big; render4(); announce(s4.big ? 'A new signpost level appeared. 96 students, 3 pages to open.' : 'Back to 48 students, 2 pages to open.'); });
  inits[4] = render4;

  /* ---------- step 5: inside MySQL (two trees, two levels each, as in the toy) ---------- */
  const EXTRA = ['Ira', 'Zubin', 'Bea', 'Neel'];
  const rows = students.map(s => ({ ...s }));
  const RB = [0, 1, 2, 3].map(j => sorted[j * PER].name); // name-index page starts
  const leafC = r => Math.min(3, Math.floor((r - 1) / PER));
  const leafS = n => { let j = 0; for (let k = 0; k < 4; k++) if (n.localeCompare(RB[k]) >= 0) j = k; return j; };
  const rowByName = n => rows.find(r => r.name === n);
  let P = {};
  function buildPages() {
    P = {};
    const c = [[], [], [], []], s = [[], [], [], []];
    [...rows].sort((a, b) => a.roll - b.roll).forEach(r => c[leafC(r.roll)].push(r));
    [...rows].sort((a, b) => a.name.localeCompare(b.name)).forEach(r => s[leafS(r.name)].push(r));
    c.forEach((l, j) => { P['C.l' + j] = { t: 'C', lvl: 0, label: `${l[0].roll}–${l[l.length - 1].roll}`, title: `Main tree · page ${j + 1}`, rows: l.map(r => [String(r.roll), `${r.name} · ${r.marks}`, r.added]) }; });
    s.forEach((l, j) => { P['S.l' + j] = { t: 'S', lvl: 0, label: `${short(l[0].name)}–${short(l[l.length - 1].name)}`, title: `Name index · page ${j + 1}`, rows: l.map(r => [r.name, 'roll ' + r.roll, r.added]) }; });
    P['C.root'] = { t: 'C', lvl: 1, label: '1 | 13 | 25 | 37', title: 'Main tree · signpost', rows: [['1…', 'page 1'], ['13…', 'page 2'], ['25…', 'page 3'], ['37…', 'page 4']] };
    P['S.root'] = { t: 'S', lvl: 1, label: RB.map(short).join(' | '), title: 'Name index · signpost', rows: RB.map((n, i) => [n + '…', 'page ' + (i + 1)]) };
  }
  buildPages();
  const ORDER = t => [`${t}.root`, `${t}.l0`, `${t}.l1`, `${t}.l2`, `${t}.l3`];
  const pathC = r => ['C.root', 'C.l' + leafC(r)];
  const pathS = n => ['S.root', 'S.l' + leafS(n)];

  const SUB = {
    a: { goal: 'Find roll no 42. Open as few pages as you can.', count: 'pages opened' },
    b: { goal: 'Find Kavya by name. Watch the jump.', count: 'pages opened' },
    c: { goal: 'Ask for less. Make the jump disappear.', count: 'pages opened' },
    d: { goal: 'Add a student. Count the trees that change.', count: 'trees changed' }
  };
  const S = { sub: 'a', step: -1, playing: false, timer: null, yaw: -14, animate: false, done: new Set(),
    a: { manual: true, trail: [] }, c: { cols: new Set(['roll_no', 'name', 'marks']) }, d: { added: [] } };

  function steps() {
    if (S.sub === 'a') { const p = pathC(42); return [{ p: p[0], hint: 'The signpost: 42 is after 37.' }, { p: p[1], hit: '42', hint: 'Found roll no 42. Two pages.' }]; }
    if (S.sub === 'b') { const r = rowByName(TARGET), a = pathS(r.name), b = pathC(r.roll); return [
      { p: a[0], hint: 'Name index signpost: Kavya is on page 2.' },
      { p: a[1], hit: TARGET, hint: `Found Kavya. It says: roll ${r.roll}.` },
      { p: b[0], hop: true, hint: `Jump! Take roll ${r.roll} to the main tree.` },
      { p: b[1], hit: String(r.roll), hint: 'Here is her whole row, with marks.' }]; }
    if (S.sub === 'c') { const r = rowByName(TARGET), a = pathS(r.name), b = pathC(r.roll); const st = [
      { p: a[0], hint: 'Name index signpost.' },
      { p: a[1], hit: TARGET, hint: S.c.cols.has('marks') ? 'Found Kavya. But marks aren’t here…' : 'No jump! Roll no and name were already here.' }];
      if (S.c.cols.has('marks')) st.push({ p: b[0], hop: true, hint: 'Jump to the main tree for the marks.' }, { p: b[1], hit: String(r.roll), hint: 'Got the marks. That took a jump.' });
      return st; }
    if (S.sub === 'd') { const last = S.d.added[S.d.added.length - 1]; if (!last) return []; const a = pathC(last.roll), b = pathS(last.name); return [
      { p: a[0], write: true, hint: `New student ${last.name}, roll ${last.roll}.` },
      { p: a[1], write: true, hit: String(last.roll), hint: 'Written to the main tree. One more…' },
      { p: b[0], write: true, fresh: true, hint: 'The name index needs it too.' },
      { p: b[1], write: true, hit: last.name, hint: 'Written to both trees.' }]; }
    return [];
  }
  const trail = () => (S.sub === 'a' && S.a.manual) ? S.a.trail : steps().slice(0, S.step + 1);

  // geometry: two levels (signpost + 4 pages), as in the toy
  const W = 2.4, D = 1.8, H = 0.6, GAP = 0.45, LZ = [0, 3.0], DEF = -14, LIM = 18, PITCH = 38 * Math.PI / 180;
  const treesNow = narrow => (S.sub === 'a' && narrow) ? ['C'] : ['S', 'C'];
  function layout(narrow) {
    const pos = {};
    const place = (t, ox, oy) => {
      const ids = ORDER(t), span = 4 * W + 3 * GAP, x0 = ox - span / 2 + W / 2;
      ids.slice(1).forEach((id, i) => { pos[id] = { x: x0 + i * (W + GAP), y: oy, z: LZ[0], w: W }; });
      pos[ids[0]] = { x: ox, y: oy, z: LZ[1], w: W * 2.4 };
    };
    const tr = treesNow(narrow);
    if (tr.length === 1) place('C', 0, 0);
    else if (narrow) { place('S', 0, 6.6); place('C', 0, -6.6); }
    else { place('S', -6.4, 0); place('C', 6.4, 0); }
    return pos;
  }
  function project(x, y, z, yawDeg) {
    const a = yawDeg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a), xr = x * c - y * s, yr = x * s + y * c;
    return { x: xr, y: -yr * Math.sin(PITCH) - z * Math.cos(PITCH), d: yr * Math.cos(PITCH) - z * Math.sin(PITCH) };
  }
  const box = p => ({ x0: p.x - p.w / 2, x1: p.x + p.w / 2, y0: p.y - D / 2, y1: p.y + D / 2, z0: p.z, z1: p.z + H });
  function bounds(pos, narrow) {
    let a = Infinity, b = -Infinity, c = Infinity, d = -Infinity; const lim = narrow ? 12 : LIM;
    const add = q => { a = Math.min(a, q.x); b = Math.max(b, q.x); c = Math.min(c, q.y); d = Math.max(d, q.y); };
    for (let yaw = DEF - lim; yaw <= DEF + lim; yaw += 2) {
      for (const id in pos) { const k = box(pos[id]); for (const x of [k.x0, k.x1]) for (const y of [k.y0, k.y1]) for (const z of [k.z0, k.z1 + 1.0]) add(project(x, y, z, yaw)); }
      for (const t of treesNow(narrow)) { const r = pos[t + '.root']; for (const dx of [-3.4, 3.4]) add(project(r.x + dx, r.y - D / 2 - 2.6, 0, yaw)); }
    }
    return { x: a - 0.3, y: c - 0.4, w: b - a + 0.6, h: d - c + 0.7 };
  }
  const el = (name, attrs, parent) => { const n = document.createElementNS(NS, name); for (const k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]); if (parent) parent.appendChild(n); return n; };
  const pts = arr => arr.map(q => `${q.x.toFixed(3)},${q.y.toFixed(3)}`).join(' ');
  const svg = $('#scene'); let geo = null, geoNarrow = false;

  function renderScene() {
    if (step !== 5) return;
    const focused = document.activeElement && document.activeElement.closest && document.activeElement.closest('[data-page]');
    const focusId = focused ? focused.dataset.page : null;
    const pxW = svg.clientWidth || 800, pxH = svg.clientHeight || 400, narrow = pxW < 560;
    if (narrow) S.yaw = Math.max(DEF - 12, Math.min(DEF + 12, S.yaw));
    geoNarrow = narrow;
    const pos = layout(narrow), vb = bounds(pos, narrow);
    svg.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.w} ${vb.h}`); svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    const u = Math.max(vb.w / pxW, vb.h / pxH); geo = { pos, u };
    svg.innerHTML = '';
    const defs = el('defs', {}, svg), pat = el('pattern', { id: 'hatch', width: 6 * u, height: 6 * u, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs);
    el('line', { x1: 0, y1: 0, x2: 0, y2: 6 * u, stroke: 'var(--scene-hatch)', 'stroke-width': 1.4 * u }, pat);
    const tr = trail(), opened = new Set(tr.map(s => s.p)), misses = new Set(tr.filter(s => s.miss).map(s => s.p));
    const ok = tr.filter(s => !s.miss), now = ok.length ? ok[ok.length - 1].p : null;
    for (const t of treesNow(narrow)) {
      const ls = ORDER(t).slice(1).map(id => pos[id]);
      const A = { x: ls[0].x - W / 2 - 0.3, y: ls[0].y - D / 2 - 0.3 }, B = { x: ls[3].x + W / 2 + 0.3, y: ls[0].y + D / 2 + 0.3 };
      el('polygon', { points: pts([[A.x, A.y], [B.x, A.y], [B.x, B.y], [A.x, B.y]].map(([x, y]) => project(x, y, -0.02, S.yaw))), class: 't-floor' }, svg);
    }
    const ar = S.yaw * Math.PI / 180, ca = Math.cos(ar), sa = Math.sin(ar), facing = (nx, ny) => (nx * sa + ny * ca) < 0;
    const ord = Object.keys(pos).map(id => ({ id, d: project(pos[id].x, pos[id].y, pos[id].z + H / 2, S.yaw).d })).sort((p, q) => q.d - p.d);
    for (const { id } of ord) {
      const p = pos[id], k = box(p), m = P[id], V = (x, y, z) => project(x, y, z, S.yaw);
      const cls = ['slab', opened.has(id) ? 'open' : '', id === now ? 'now' : '', misses.has(id) ? 'miss' : '', (S.animate && id === now && !reduced()) ? 'pop' : ''].filter(Boolean).join(' ');
      const g = el('g', { class: cls, 'data-page': id, tabindex: '0', role: 'button', 'aria-label': `${m.title}, ${m.label}${opened.has(id) ? ', opened' : ''}` }, svg);
      const faces = [[[0, -1], [[k.x0, k.y0, k.z0], [k.x1, k.y0, k.z0], [k.x1, k.y0, k.z1], [k.x0, k.y0, k.z1]], 's-front'], [[0, 1], [[k.x0, k.y1, k.z0], [k.x1, k.y1, k.z0], [k.x1, k.y1, k.z1], [k.x0, k.y1, k.z1]], 's-front'],
        [[-1, 0], [[k.x0, k.y0, k.z0], [k.x0, k.y1, k.z0], [k.x0, k.y1, k.z1], [k.x0, k.y0, k.z1]], 's-side'], [[1, 0], [[k.x1, k.y0, k.z0], [k.x1, k.y1, k.z0], [k.x1, k.y1, k.z1], [k.x1, k.y0, k.z1]], 's-side']];
      for (const [n, c, fc] of faces) if (facing(n[0], n[1])) el('polygon', { points: pts(c.map(q => V(...q))), class: fc }, g);
      const top = [[k.x0, k.y0, k.z1], [k.x1, k.y0, k.z1], [k.x1, k.y1, k.z1], [k.x0, k.y1, k.z1]].map(q => V(...q));
      el('polygon', { points: pts(top), class: 's-top' }, g);
      { // invisible hit area: the page's outline, grown to at least 44 x 44 CSS px
        const all = [...top, ...[[k.x0, k.y0, k.z0], [k.x1, k.y0, k.z0], [k.x1, k.y1, k.z0], [k.x0, k.y1, k.z0]].map(q => V(...q))];
        let x0 = Math.min(...all.map(q => q.x)), x1 = Math.max(...all.map(q => q.x)), y0 = Math.min(...all.map(q => q.y)), y1 = Math.max(...all.map(q => q.y));
        const minU = 46 * u, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
        if (x1 - x0 < minU) { x0 = cx - minU / 2; x1 = cx + minU / 2; }
        if (y1 - y0 < minU) { y0 = cy - minU / 2; y1 = cy + minU / 2; }
        g.insertBefore(el('rect', { x: x0, y: y0, width: x1 - x0, height: y1 - y0, class: 's-hit' }), g.firstChild);
      }
      if (m.t === 'C') el('polygon', { points: pts(top), class: 's-hatch' }, g);
      const ct = V(p.x, p.y, k.z1), wPx = (Math.max(...top.map(q => q.x)) - Math.min(...top.map(q => q.x))) / u, fs = narrow ? 10.5 : 12.5;
      if (wPx > m.label.length * fs * 0.62 + 8) { const tx = el('text', { x: ct.x, y: ct.y, class: 't-slab', 'font-size': fs * u }, g); tx.textContent = m.label; }
    }
    const anc3 = id => { const p = pos[id]; return { x: p.x, y: p.y, z: p.z + H }; };
    const anc = id => { const a = anc3(id); return project(a.x, a.y, a.z, S.yaw); };
    for (let i = 0; i < tr.length; i++) {
      const s = tr[i], isNew = S.animate && i === tr.length - 1 && !reduced();
      if (!pos[s.p]) continue;
      if (s.write && s.hit) { const q = anc(s.p); el('circle', { cx: q.x, cy: q.y, r: 16 * u, class: 'p-new' + (isNew ? ' drawn' : ''), 'stroke-width': 2.5 * u }, svg); }
      if (i === 0 || s.fresh || s.miss) continue;
      let j = i - 1; while (j >= 0 && tr[j].miss) j--; if (j < 0 || !pos[tr[j].p]) continue;
      const A = anc(tr[j].p), B = anc(s.p);
      if (s.hop) {
        const a3 = anc3(tr[j].p), b3 = anc3(s.p);
        const m = project((a3.x + b3.x) / 2 + (narrow ? 1.2 : 0), (a3.y + b3.y) / 2, Math.max(a3.z, b3.z) + (narrow ? 0.4 : 2.6), S.yaw);
        el('path', { d: `M${A.x},${A.y} Q${m.x},${m.y} ${B.x},${B.y}`, class: 'p-hop' + (isNew ? ' drawn' : ''), 'stroke-width': 3.4 * u, 'stroke-dasharray': `${8 * u} ${6 * u}` }, svg);
        const mid = project((a3.x + b3.x) / 2 + (narrow ? -3.6 : 0), (a3.y + b3.y) / 2, Math.max(a3.z, b3.z) + (narrow ? -1.6 : 1.5), S.yaw);
        const jt = el('text', { x: mid.x, y: mid.y, class: 'p-jump', 'font-size': 18 * u, 'data-src': 'S03' }, svg); jt.textContent = 'jump!';
      } else el('path', { d: `M${A.x},${A.y} L${B.x},${B.y}`, class: 'p-line' + (isNew ? ' drawn' : ''), 'stroke-width': 3.4 * u, pathLength: isNew ? 1 : null }, svg);
    }
    if (now && pos[now]) { const q = anc(now); el('circle', { cx: q.x, cy: q.y, r: 7 * u, class: 'p-dot', 'stroke-width': 2.5 * u }, svg); }
    const names = { S: ['Name index', 'name → roll no', 'S03'], C: ['Main tree', 'every row, by roll no (clustered index)', 'S03'] };
    for (const t of treesNow(narrow)) {
      const r = pos[t + '.root'], q = project(r.x, r.y - D / 2 - 1.3, 0, S.yaw), f1 = (narrow ? 15 : 18) * u;
      el('text', { x: q.x, y: q.y, class: 't-title', 'font-size': f1 }, svg).textContent = names[t][0];
      el('text', { x: q.x, y: q.y + f1 * 1.1, class: 't-sub', 'font-size': (narrow ? 10 : 11.5) * u, 'data-src': names[t][2] }, svg).textContent = names[t][1];
    }
    S.animate = false;
    if (focusId) { const f = svg.querySelector(`[data-page="${focusId}"]`); if (f) f.focus({ preventScroll: true }); }
  }

  const HSRC = { a: 'S03 S04', b: 'S03', c: 'S01 S03 S06', d: 'S02' };
  function hint5(text, kind) { const h = $('#hint-5'); setHint(h, text, kind); h.dataset.src = HSRC[S.sub]; }
  function renderHUD() {
    const tr = trail(), st = steps();
    $('#goal-5').textContent = SUB[S.sub].goal;
    $$('.subtabs button').forEach(b => { b.setAttribute('aria-pressed', String(b.dataset.sub === S.sub)); b.classList.toggle('done', S.done.has(b.dataset.sub)); });
    const cnt = $('#count-5'), prev = cnt.textContent;
    let v = new Set(tr.map(s => s.p)).size, sub = '';
    if (S.sub === 'd') { v = new Set(tr.filter(s => s.write).map(s => s.p[0])).size; sub = `pages opened: ${tr.length}`; }
    cnt.textContent = v; $('#count-label-5').textContent = SUB[S.sub].count; $('#count-sub-5').textContent = sub;
    if (prev !== cnt.textContent) bump(cnt);
    if (S.sub === 'a' && S.a.manual) return;
    const cur = tr[tr.length - 1];
    if (cur) {
      const end = S.step === st.length - 1; let kind = '';
      if (end) { if (S.sub !== 'c' || !S.c.cols.has('marks')) { S.done.add(S.sub); if (S.sub === 'c') kind = 'win'; } }
      hint5(cur.hint, kind);
    } else hint5({ b: 'Press play.', c: 'Press play. Then switch off what you don’t need.', d: 'Press “Add a student”.' }[S.sub] || '', '');
    $$('.subtabs button').forEach(b => b.classList.toggle('done', S.done.has(b.dataset.sub)));
  }
  function renderTask() {
    const box = $('#task-5'), says = $('#says-body'), sql = t => `<code>${t}</code>`;
    box.innerHTML = '';
    if (S.sub === 'a') {
      box.innerHTML = '<span class="task-label">Tap the pages yourself, or press play</span>';
      says.innerHTML = `${sql('SELECT * FROM students WHERE roll_no = 42;')}<span>key: <b>PRIMARY</b></span><span>type: <b>const</b></span>`;
    } else if (S.sub === 'b') {
      box.innerHTML = '<span class="task-label">Press play</span>';
      says.innerHTML = `${sql("SELECT * FROM students WHERE name = 'Kavya';")}<span>key: <b>idx_name</b></span><span>type: <b>ref</b></span>`;
    } else if (S.sub === 'c') {
      box.innerHTML = '<span class="task-label">Ask for:</span>' + ['roll_no', 'name', 'marks'].map(c => `<button type="button" class="chip-toggle" data-col="${c}" aria-pressed="${S.c.cols.has(c)}">${c.replace('_', ' ')}</button>`).join('');
      $$('[data-col]', box).forEach(b => b.onclick = () => {
        const next = new Set(S.c.cols); next.has(b.dataset.col) ? next.delete(b.dataset.col) : next.add(b.dataset.col);
        if (!next.size) { hint5('Ask for at least one thing.', 'lose'); return; }
        S.c.cols = next; resetRun(); renderTask(); setPlaying(true);
      });
      const cols = ['roll_no', 'name', 'marks'].filter(c => S.c.cols.has(c)).join(', ');
      says.innerHTML = `${sql(`SELECT ${cols} FROM students WHERE name = 'Kavya';`)}<span>key: <b>idx_name</b></span><span>type: <b>ref</b></span>${S.c.cols.has('marks') ? '' : '<span><b>Using index</b></span>'}`;
    } else if (S.sub === 'd') {
      const left = EXTRA.length - S.d.added.length;
      box.innerHTML = `<button class="btn" type="button" id="f-add" ${left ? '' : 'disabled'}>${left ? `Add a student (${EXTRA[S.d.added.length]})` : 'Toy is full'}</button>${S.d.added.length ? '<span class="task-label" data-src="S02">Every tree must be updated.</span>' : ''}`;
      $('#f-add').onclick = () => { const n = EXTRA[S.d.added.length]; if (!n) return; const r = { roll: rows.length + 1, name: n, marks: 70, added: true }; rows.push(r); S.d.added.push(r); buildPages(); resetRun(); renderTask(); setPlaying(true); };
      const last = S.d.added[S.d.added.length - 1];
      says.innerHTML = `${sql(last ? `INSERT INTO students VALUES (${last.roll}, '${last.name}', …);` : 'INSERT INTO students VALUES (…);')}<span data-src="S02">updates: <b>PRIMARY</b>, <b>idx_name</b></span>`;
    }
  }
  function renderDock() {
    const st = steps(), sc = $('#scrub');
    sc.max = Math.max(0, st.length - 1); sc.value = Math.max(0, S.step); sc.disabled = !st.length;
    sc.setAttribute('aria-valuetext', st.length ? `Step ${Math.max(0, S.step) + 1} of ${st.length}` : 'Nothing to play yet');
    $('#btn-play').disabled = !st.length;
  }
  function render5() { renderScene(); renderHUD(); renderDock(); }
  function resetRun() { setPlaying(false); S.step = -1; closePeek(); if (S.sub === 'a') S.a.trail = []; }
  function setPlaying(on) {
    S.playing = on; clearTimeout(S.timer);
    $('#btn-play').setAttribute('aria-pressed', String(on)); $('#btn-play').setAttribute('aria-label', on ? 'Pause' : 'Play');
    if (on) { if (S.sub === 'a') S.a.manual = false; const st = steps(); if (!st.length) { setPlaying(false); return; } if (S.step >= st.length - 1) S.step = -1; tick(); }
  }
  function tick() {
    const st = steps();
    S.timer = setTimeout(() => {
      if (!S.playing) return;
      if (S.step < st.length - 1) { S.step++; S.animate = true; render5(); if (S.step < st.length - 1) tick(); else setPlaying(false); }
    }, S.step < 0 ? 250 : 1300);
  }
  function stepTo(i) { setPlaying(false); if (S.sub === 'a') S.a.manual = false; S.step = Math.max(-1, Math.min(steps().length - 1, i)); S.animate = true; render5(); }
  function goSub(k) { clearTimeout(S.timer); S.playing = false; S.sub = k; S.step = -1; closePeek(); if (k === 'a') { S.a.manual = true; S.a.trail = []; } renderTask(); render5(); if (k === 'a') hint5('Tap the top page to start.', ''); }
  function tapA(id) {
    const ideal = pathC(42); if (!S.a.manual) { S.a.manual = true; S.a.trail = []; S.step = -1; }
    const okN = S.a.trail.filter(s => !s.miss).length, m = P[id];
    if (okN >= 2) { peek(id); return; }
    if (m.t !== 'C') { hint5('Use the main tree for roll numbers.', 'lose'); return; }
    if (m.lvl !== P[ideal[okN]].lvl) { hint5('Start with the signpost on top.', 'lose'); return; }
    if (id === ideal[okN]) {
      S.a.trail.push(m.lvl === 0 ? { p: id, hit: '42' } : { p: id }); S.animate = true;
      const n = new Set(S.a.trail.map(s => s.p)).size;
      if (m.lvl === 0) { S.done.add('a'); hint5(n === 2 ? 'Found 42 in 2 pages. Best possible!' : `Found 42 in ${n} pages. Best is 2.`, n === 2 ? 'win' : ''); }
      else hint5('Signpost: 1 | 13 | 25 | 37. Which page has 42?', '');
    } else if (!S.a.trail.some(s => s.p === id)) { S.a.trail.push({ p: id, miss: true }); S.animate = true; hint5('42 isn’t on that page. Read the signpost.', 'lose'); }
    render5();
  }
  const peekEl = $('#peek');
  function peek(id) {
    const m = P[id]; if (!m || !geo || !geo.pos[id]) return;
    const hit = (trail().find(s => s.p === id && s.hit) || {}).hit;
    $('#peek-title').textContent = m.title;
    const ul = $('#peek-list'); ul.innerHTML = '';
    let start = 0; if (m.rows.length > 4) { const hi = m.rows.findIndex(r => r[0] === hit || r[2]); start = Math.max(0, Math.min(m.rows.length - 4, (hi < 0 ? 0 : hi) - 1)); }
    m.rows.slice(start, start + 4).forEach(r => { const li = document.createElement('li'); if (r[0] === hit) li.className = 'hit'; else if (r[2]) li.className = 'new'; li.innerHTML = '<span></span><span></span>'; li.children[0].textContent = r[0]; li.children[1].textContent = r[1]; ul.appendChild(li); });
    if (m.rows.length > 4) { const li = document.createElement('li'); li.className = 'more'; li.textContent = `+ ${m.rows.length - 4} more`; ul.appendChild(li); }
    const p = geo.pos[id], q = project(p.x, p.y, p.z + H, S.yaw), ctm = svg.getScreenCTM(), st = $('.stage').getBoundingClientRect();
    const sx = ctm.a * q.x + ctm.e - st.left, sy = ctm.d * q.y + ctm.f - st.top;
    peekEl.hidden = false; const w = peekEl.offsetWidth, h = peekEl.offsetHeight;
    peekEl.style.left = Math.max(8, Math.min(st.width - w - 8, sx - w / 2)) + 'px';
    peekEl.style.top = Math.max(8, sy - h - 18 < 8 ? sy + 22 : sy - h - 18) + 'px';
    peekEl.dataset.page = id;
  }
  function closePeek() { peekEl.hidden = true; delete peekEl.dataset.page; }
  const refocus = id => { const g = id && svg.querySelector(`[data-page="${id}"]`); if (g) g.focus(); };
  $('#peek-x').addEventListener('click', () => { const id = peekEl.dataset.page; closePeek(); refocus(id); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !peekEl.hidden) { const id = peekEl.dataset.page; closePeek(); refocus(id); } });
  const activate = id => { if (!P[id]) return; if (S.sub === 'a') { tapA(id); return; } if (peekEl.dataset.page === id && !peekEl.hidden) closePeek(); else peek(id); };

  $$('.subtabs button').forEach(b => b.addEventListener('click', () => goSub(b.dataset.sub)));
  $('#btn-play').addEventListener('click', () => setPlaying(!S.playing));
  $('#btn-fwd').addEventListener('click', () => stepTo(S.step + 1));
  $('#btn-back').addEventListener('click', () => stepTo(S.step - 1));
  $('#scrub').addEventListener('input', e => stepTo(+e.target.value));
  const clampYaw = y => { const l = geoNarrow ? 12 : LIM; return Math.max(DEF - l, Math.min(DEF + l, y)); };
  const rotate = d => { S.yaw = clampYaw(S.yaw + d * 7); closePeek(); renderScene(); };
  $$('[data-rotate]').forEach(b => b.addEventListener('click', () => rotate(+b.dataset.rotate)));
  svg.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); rotate(-1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); rotate(1); }
    else if (e.key === 'Enter' || e.key === ' ') { const g = e.target.closest('[data-page]'); if (g) { e.preventDefault(); activate(g.dataset.page); } }
  });
  let drag = null;
  svg.addEventListener('pointerdown', e => { const g = e.target.closest('[data-page]'); drag = { x: e.clientX, yaw: S.yaw, moved: false, page: g ? g.dataset.page : null }; });
  svg.addEventListener('pointermove', e => { if (!drag) return; if (Math.abs(e.clientX - drag.x) > 5) { drag.moved = true; svg.classList.add('dragging'); closePeek(); } if (drag.moved) { S.yaw = clampYaw(drag.yaw + (e.clientX - drag.x) * 0.25); renderScene(); } });
  svg.addEventListener('pointerup', () => { if (drag && !drag.moved && drag.page) activate(drag.page); drag = null; svg.classList.remove('dragging'); });
  svg.addEventListener('pointercancel', () => { drag = null; svg.classList.remove('dragging'); });
  inits[5] = () => { renderTask(); render5(); if (S.sub === 'a' && S.a.manual && !S.a.trail.length) hint5('Tap the top page to start.', ''); };

  /* ---------- step 6: check yourself ---------- */
  const QUIZ = [
    { q: 'There is no index. How does MySQL find Kavya?', src: 'S01', opts: ['It checks the rows one by one.', 'It jumps straight to her row.', 'It sorts the table first.'], a: 0, why: 'With no index, MySQL reads row after row.' },
    { q: 'You ask only for roll no and name. Does MySQL need the jump?', src: 'S01 S03', opts: ['Yes, always.', 'No. The name index already has both.'], a: 1, why: 'The name index stores the roll no with each name.' },
    { q: 'You add a new student. What changes?', src: 'S02', opts: ['Only the main tree.', 'The main tree and every index.', 'Nothing until tomorrow.'], a: 1, why: 'Every index must be updated when a row is added.' }
  ];
  const s6 = { ans: {} };
  function render6() {
    const ol = $('#quiz'); ol.innerHTML = '';
    QUIZ.forEach((item, i) => {
      const li = document.createElement('li'); li.className = 'q'; li.dataset.src = item.src;
      const done = i in s6.ans;
      li.innerHTML = `<p class="qt"></p><div class="opts" role="group"></div>${done ? '<p class="why"></p>' : ''}`;
      li.querySelector('.qt').textContent = `${i + 1}. ${item.q}`;
      item.opts.forEach((o, j) => {
        const b = document.createElement('button'); b.type = 'button'; b.textContent = o; b.dataset.q = i; b.dataset.o = j;
        if (done && j === item.a) b.classList.add('right');
        if (done && j === s6.ans[i] && j !== item.a) b.classList.add('wrong');
        li.querySelector('.opts').appendChild(b);
      });
      if (done) li.querySelector('.why').textContent = (s6.ans[i] === item.a ? 'Right. ' : 'Not quite. ') + item.why;
      ol.appendChild(li);
    });
    const c = $('#count-6'), prev = c.textContent;
    c.textContent = Object.keys(s6.ans).filter(i => s6.ans[i] === QUIZ[i].a).length;
    if (prev !== c.textContent) bump(c);
  }
  $('#quiz').addEventListener('click', e => { const b = e.target.closest('button[data-q]'); if (!b) return; const i = +b.dataset.q; if (i in s6.ans) return; s6.ans[i] = +b.dataset.o; render6(); announce((s6.ans[i] === QUIZ[i].a ? 'Right. ' : 'Not quite. ') + QUIZ[i].why); });
  inits[6] = render6;


  /* ---------- QA self-test (only with ?qa=1): plays every step and practice, checks tap sizes ---------- */
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  async function smoke() {
    const out = []; const ok = (name, c) => out.push(`${c ? 'PASS' : 'FAIL'} ${name}`);
    const small = [];
    const checkTargets = label => $$(`#step-${step} button, #step-${step} [role=button], #step-${step} summary, #step-${step} input, .bar button, .bar a, .stepnav button`).forEach(n => {
      if (n.closest('[hidden]') || n.disabled) return;
      const hitEl = n.matches('[data-page]') ? n.querySelector('.s-hit') : n;
      const r = (hitEl || n).getBoundingClientRect();
      if (r.width && (r.width < 43.5 || r.height < 43.5)) small.push(`${label}:${(n.dataset.page || n.textContent || n.id || n.tagName).trim().slice(0, 18)} ${Math.round(r.width)}x${Math.round(r.height)}`);
    });
    try {
      go(1); reset1(); checkTargets('s1');
      for (const s of students) { $(`.rowbtn[data-roll="${s.roll}"]`).click(); if (s1.found) break; }
      ok('step 1: Kavya found after 42 checks, takeaway shown', s1.found && s1.checked.size === 42 && !$('#take-1').hidden);
      go(2); $('#letters-2 button[data-l="K"]').click(); checkTargets('s2'); $('#names-2 button[data-n="Kavya"]').click();
      ok('step 2: K then Kavya = 2 taps, takeaway shown', s2.found && s2.taps === 2 && !$('#take-2').hidden);
      go(3); checkTargets('s3'); $(`#board-3 .sign-rows button[data-p="${kPage}"]`).click(); checkTargets('s3-open'); $('#board-3 .page-rows button[data-n="Kavya"]').click();
      ok('step 3: found in 1 page', s3.found && s3.opened.size === 1);
      $('#fold-3').click(); await sleep(120);
      ok('step 3: folds into a tree (4 links, takeaway, description)', $('#board-3').classList.contains('folded') && $$('#board-3 .links line').length === 4 && !$('#take-3').hidden && /root/.test($('#desc-3').textContent));
      go(4); if (s4.big) $('#grow-4').click(); await sleep(120);
      ok('step 4: 48 students = 2 levels', $$('#board-4 .lvl').length === 2 && $$('#board-4 .links line').length === 4);
      $('#grow-4').click(); await sleep(120); checkTargets('s4');
      ok('step 4: 96 students = 3 levels, path marked', $$('#board-4 .lvl').length === 3 && $$('#board-4 .links line.on').length === 2);
      go(5); goSub('a'); checkTargets('s5a'); activate('C.root'); activate(pathC(42)[1]);
      ok('step 5a: roll 42 found in 2 pages', S.done.has('a') && $('#count-5').textContent === '2');
      goSub('b'); await sleep(50); checkTargets('s5b'); stepTo(steps().length - 1);
      ok('step 5b: jump drawn, 4 pages', $('#count-5').textContent === '4' && !!svg.querySelector('.p-hop'));
      goSub('c'); $('#task-5 [data-col="marks"]').click(); setPlaying(false); stepTo(steps().length - 1);
      ok('step 5c: no jump when marks are not asked', steps().length === 2 && !svg.querySelector('.p-hop') && $('#hint-5').classList.contains('win'));
      $('#task-5 [data-col="marks"]').click(); setPlaying(false);
      goSub('d'); $('#f-add').click(); setPlaying(false); stepTo(steps().length - 1);
      ok('step 5d: new student written to 2 trees', $('#count-5').textContent === '2' && svg.querySelectorAll('.p-new').length === 2);
      $('#says').open = true; ok('step 5: What MySQL typically says opens', $('#says-body').textContent.includes('INSERT') && /typically/.test($('#says summary').textContent));
      { const sw = $('#says'), ov = document.documentElement.scrollWidth - document.documentElement.clientWidth;
        ok(`step 5: open strip fits (page overflow ${Math.max(0, ov)}px, strip ${sw.scrollWidth}/${sw.clientWidth}px)`, ov <= 0 && sw.scrollWidth <= sw.clientWidth + 1); }
      go(6); QUIZ.forEach((q, i) => $(`#quiz button[data-q="${i}"][data-o="${q.a}"]`).click()); checkTargets('s6');
      ok('step 6: 3 of 3 right with reasons', $('#count-6').textContent === '3' && $$('#quiz .why').length === 3);
      location.hash = '#step-2'; await sleep(120);
      ok('hashchange: #step-2 opens step 2', step === 2 && !$('#step-2').hidden);
      history.back(); await sleep(250);
      ok('browser Back returns to the previous step', step !== 2);
      ok('tap targets >= 44px (' + (small.length ? small.join('; ') : 'all') + ')', !small.length);
      go(3); const td = parseFloat(getComputedStyle($('#board-3')).transitionDuration) || 0;
      ok(`motion: fold transition ${td}s (reduce=${reduced()})`, reduced() ? td < 0.001 : td > 0.5);
      const srcs = $$('[data-src]').length; ok(`facts carry data-src (${srcs} elements)`, srcs >= 10);
    } catch (err) { out.push('FAIL self-test crashed: ' + err.message); }
    console.info(`QA smoke @${document.documentElement.clientWidth}px reduce=${reduced()} | ` + out.join(' | '));
  }

  /* ---------- start ---------- */
  let rz; window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { closePeek(); if (inits[step]) inits[step](); }, 150); });
  const start = hashStep() || 1;
  go(start, false);

  // QA hooks: warn on sideways overflow. With ?qa=1, visit each step and log its words (instructions vs data labels).
  const words = t => (t.match(/[A-Za-z0-9][A-Za-z0-9'’@._-]*/g) || []).length;
  function stepWords(sec) {
    const all = words(sec.innerText);
    const clone = sec.cloneNode(true);
    clone.querySelectorAll('.data, svg, [hidden], .sr-only, .lvl-pages, .lvl-mid, .page-rows, .sign-rows, .namelist, .letters, .stats').forEach(n => n.remove());
    return { all, instructions: words(clone.textContent) };
  }
  const runQA = () => setTimeout(() => {
    if (!params.has('qa')) return; // production: no QA output unless ?qa=1
    const over = document.documentElement.scrollWidth - document.documentElement.clientWidth;
    if (over > 0) console.warn(`Sideways overflow of ${over}px at ${document.documentElement.clientWidth}px wide`);
    const report = []; let i = 1;
    const visit = () => {
      go(i, false);
      setTimeout(() => { try {
        const w = stepWords($(`#step-${i}`)), ov = document.documentElement.scrollWidth - document.documentElement.clientWidth;
        report.push(`step ${i}: ${w.instructions} instruction words, ${w.all} visible incl. data labels, overflow ${Math.max(0, ov)}px`);
        if (++i <= TOTAL) visit(); else { console.info(`QA @${document.documentElement.clientWidth}px | chrome: ${words($('.bar').innerText) + words($('.stepnav').innerText) + words($('.foot').innerText)} words | ` + report.join(' | ')); go(start, false); smoke(); }
      } catch (err) { console.error('QA hook failed: ' + err.message); } }, 150);
    };
    visit();
  }, 400);
  if (document.readyState === 'complete') runQA(); else window.addEventListener('load', runQA);
})();
