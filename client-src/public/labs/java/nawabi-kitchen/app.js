/* Nawabi Kitchen.
 *
 * The Hall takes an order and hands it to the Kitchen. The Kitchen starts a
 * new thread for that order, and the thread walks it through six stages, one
 * every ten seconds, without waiting for any other order.
 *
 * Order again while the first is still cooking and it starts its own walk from
 * the beginning, so the two are never on the same stage. That is what students
 * have to reproduce with real threads in their console build. */
'use strict';

const { STAGE_MS, STAGES, MENU } = window.Kitchen;
const LAST = STAGES.length - 1;

/* ------------------------------------------------------------- helpers */

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const money = (n) => `₹${n}`;
const clock = (ms) => new Date(ms).toLocaleTimeString([], { hour12: false });

/** "1 min 20 sec" / "40 sec" - never "0 min". */
function humanTime(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  if (!m) return `${s} sec`;
  return s ? `${m} min ${s} sec` : `${m} min`;
}

let toastTimer = null;
function toast(html) {
  const el = document.getElementById('toast');
  el.innerHTML = html;
  el.classList.add('is-up');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('is-up'), 3000);
}

/* --------------------------------------------------------------- state */

const state = {
  view: 'welcome',      // welcome | menu | orders | assignment
  orders: [],           // newest first
  nextNumber: 1041
};

/** Orders still on their way - the ones the kitchen is working on. */
const liveOrders = () => state.orders.filter((o) => o.stage < LAST);

/* ------------------------------------------------------- placing orders */

function placeOrder(dish) {
  const now = Date.now();
  const order = {
    id: `NK-${state.nextNumber++}`,
    dish,
    placedAt: now,
    stage: 0,
    history: [{ stage: 0, at: now }],   // every stage reached, and when
    timer: null
  };
  state.orders.unshift(order);

  // This order's own timer. Every order gets one, and none of them knows the
  // others exist - which is why they all move at the same time.
  tick(order);

  state.view = 'orders';
  render();
  toast(`<b>${esc(dish.name)}</b> ordered &middot; ${esc(order.id)}`);
}

function tick(order) {
  order.timer = setTimeout(() => {
    order.stage++;
    order.history.push({ stage: order.stage, at: Date.now() });

    if (order.stage < LAST) tick(order);
    else order.timer = null;

    // Repaint only the card that changed, so the other orders are untouched.
    paintOrder(order);
    toast(`<b>${esc(order.dish.name)}</b> &middot; ${esc(STAGES[order.stage].name)}`);
  }, STAGE_MS);
}

/* ---------------------------------------------------------------- shell */

function shell() {
  const app = document.getElementById('app');
  app.innerHTML = '';
  app.appendChild(document.getElementById('tpl-shell').content.cloneNode(true));
  return {
    act: app.querySelector('[data-act]'),
    view: app.querySelector('[data-view]')
  };
}

/** The buttons on the right of the masthead, the same on every inner screen. */
function headerActions(current) {
  const live = liveOrders().length;
  return `
    ${live ? `<span class="livepill"><i></i>${live} on the way</span>` : ''}
    ${current !== 'assignment'
      ? '<button class="btn btn--sm btn--ghost" data-go="assignment">Assignment</button>'
      : '<button class="btn btn--sm btn--ghost" data-go="menu">Back to the menu</button>'}
    ${current === 'orders'
      ? '<button class="btn btn--sm btn--primary" data-go="menu">Place another order</button>'
      : state.orders.length
        ? '<button class="btn btn--sm" data-go="orders">My orders</button>'
        : ''}`;
}

/* ---------------------------------------------------------------- views */

function welcomeView() {
  const app = document.getElementById('app');
  app.innerHTML = '';
  app.appendChild(document.getElementById('tpl-welcome').content.cloneNode(true));
}

function menuView() {
  const { act, view } = shell();
  act.innerHTML = headerActions('menu');

  view.innerHTML = `
    <div class="pagehead">
      <div>
        <h2>The Menu</h2>
        <p>Pick a dish and the kitchen starts on it straight away.</p>
      </div>
    </div>
    ${MENU.map((course, ci) => `
      <section class="course">
        <div class="course__head">
          <h3>${esc(course.category)}</h3>
          <span>${esc(course.note)}</span>
        </div>
        <div class="dishes">
          ${course.items.map((d, di) => `
            <button class="dish" data-dish="${ci}.${di}">
              <span class="dish__top">
                <span class="dish__name">${esc(d.name)}</span>
                <span class="dish__price">${money(d.price)}</span>
              </span>
              <span class="dish__desc">${esc(d.desc)}</span>
              <span class="dish__foot">
                <span class="diet${d.veg ? '' : ' diet--non'}"></span>
                <span class="dish__add">Order this &rarr;</span>
              </span>
            </button>`).join('')}
        </div>
      </section>`).join('')}`;

  view.onclick = (e) => {
    const btn = e.target.closest('[data-dish]');
    if (!btn) return;
    const [ci, di] = btn.dataset.dish.split('.').map(Number);
    placeOrder(MENU[ci].items[di]);
  };
}

function ordersView() {
  const { act, view } = shell();
  act.innerHTML = headerActions('orders');
  const live = liveOrders().length;

  view.innerHTML = `
    <div class="nudge">
      <div class="nudge__txt">
        <b>${live ? 'The kitchen is on it' : 'All done'}</b>
        <span>${live
          ? 'You do not have to wait for this one. Order again and both are cooked at the same time.'
          : 'Everything you ordered has arrived. Hungry again?'}</span>
      </div>
      <button class="btn btn--primary" data-go="menu">Place another order</button>
    </div>
    <div class="orders">${state.orders.map(orderMarkup).join('')}</div>`;
}

function orderMarkup(o) {
  const done = o.stage === LAST ? ' is-done' : '';
  return `<article class="order${done}" data-order="${o.id}">${orderInner(o)}</article>`;
}

/**
 * The card: the order number, the dish, and one box per stage the order has
 * reached - a new box appears below the last every ten seconds.
 */
function orderInner(o) {
  const done = o.stage === LAST;
  const left = (o.placedAt + LAST * STAGE_MS) - Date.now();

  return `
    <div class="order__top">
      <div>
        <div class="order__id">Order ${esc(o.id)}</div>
        <div class="order__dish">${esc(o.dish.name)}</div>
      </div>
      <div class="order__price">
        <b>${money(o.dish.price)}</b>
        <small>${done
          ? `delivered in ${humanTime(LAST * STAGE_MS)}`
          : `<span data-left>${humanTime(left)}</span> to go`}</small>
      </div>
    </div>

    <div class="steps">
      ${o.history.map((h, i) => {
        const isNow = i === o.history.length - 1;
        return `
        <div class="step ${isNow ? 'is-now' : 'is-past'}">
          <span class="step__mark"></span>
          <span class="step__name">${esc(STAGES[h.stage].name)}</span>
          <span class="step__note">${isNow ? esc(STAGES[h.stage].note) : ''}</span>
          <span class="step__at">${clock(h.at)}</span>
        </div>`;
      }).join('')}
    </div>`;
}

/** Repaint one order card in place. */
function paintOrder(o) {
  const card = document.querySelector(`[data-order="${o.id}"]`);
  if (card) {
    card.innerHTML = orderInner(o);
    card.classList.toggle('is-done', o.stage === LAST);
  }

  // the head count is on every inner screen, so it is updated either way
  const live = liveOrders().length;
  const pill = document.querySelector('.livepill');
  if (pill && live) pill.innerHTML = `<i></i>${live} on the way`;
  else if (pill) pill.remove();

  // nothing left cooking: the banner now reads differently
  if (card && !live) ordersView();
}

/** The "to go" countdown, once a second. Only the numbers move. */
setInterval(() => {
  const now = Date.now();
  state.orders.forEach((o) => {
    if (o.stage === LAST) return;
    const el = document.querySelector(`[data-order="${o.id}"] [data-left]`);
    if (el) el.textContent = humanTime((o.placedAt + LAST * STAGE_MS) - now);
  });
}, 1000);

/* ----------------------------------------------------------- assignment */

function assignmentView() {
  const { act, view } = shell();
  act.innerHTML = headerActions('assignment');

  view.innerHTML = `
    <div class="pagehead">
      <div>
        <h2>The Assignment</h2>
        <p>Build this restaurant as a console application in Java.</p>
      </div>
    </div>

    <section class="panel">
      <h3>Class structure</h3>
      <p>Three classes. <b>Main</b> starts the program and opens the <b>Hall</b>.
         The Hall is the front of house: it shows the menu and takes the customer's
         choice. When a dish is chosen the Hall calls <code>placeOrder()</code> on the
         <b>Kitchen</b>, and the Kitchen starts <b>a new thread for that order</b>.</p>

      <div class="cd">
        <div class="cd__box">
          <b>Main</b>
          <small>starts the program</small>
        </div>

        <div class="cd__join"></div>

        <div class="cd__box">
          <b>Hall</b>
          <small>shows the menu &middot; reads the choice</small>
        </div>

        <div class="cd__join"><span class="cd__label">placeOrder()</span></div>

        <div class="cd__box cd__box--kitchen">
          <b>Kitchen.java</b>
          <small>takes the order &middot; starts its thread</small>
        </div>

        <div class="cd__spawn">
          <span class="cd__arrow">&darr;</span>
          <span class="cd__spawnnote">New thread for every order</span>
        </div>

        <div class="cd__threads">
          <div class="cd__thread"><b>Order thread</b><small>NK-1041</small></div>
          <div class="cd__thread"><b>Order thread</b><small>NK-1042</small></div>
          <div class="cd__thread"><b>Order thread</b><small>NK-1043</small></div>
        </div>
      </div>

      <p class="panel__foot">Each order thread runs the six stages on its own and
         ends when the order is delivered. No thread waits for another, which is why
         three orders placed ten seconds apart are always on three different stages.</p>
    </section>

    <section class="panel">
      <h3>What each class does</h3>
      <dl class="duties">
        <dt>Main</dt>
        <dd>Creates the Hall and starts it. Nothing else belongs here.</dd>
        <dt>Hall</dt>
        <dd>Prints the menu, reads the customer's choice, and hands it to the
            Kitchen. It must come straight back for the next order &mdash; if the Hall
            waits for the food, the whole restaurant stops.</dd>
        <dt>Kitchen</dt>
        <dd><code>placeOrder()</code> receives a dish and starts a new thread for it.
            The method returns at once; the cooking happens on the new thread.</dd>
        <dt>The order thread</dt>
        <dd>Walks the six stages, printing each one, sleeping ten seconds between
            them, then ends.</dd>
      </dl>
    </section>

    <section class="panel">
      <h3>The six stages</h3>
      <p>One step every <b>ten seconds</b>, so an order is delivered
         <b>${LAST * STAGE_MS / 1000} seconds</b> after it is placed.</p>
      <ol class="stagelist">
        ${STAGES.map((s) => `<li><b>${esc(s.name)}</b><span>${esc(s.note)}</span></li>`).join('')}
      </ol>
    </section>

    <section class="panel">
      <h3>What must be true when you run it</h3>
      <ul class="checks">
        <li><i>&#10003;</i><span>The menu comes back <b>immediately</b> after an order is
          placed. You can order again while the first is still cooking.</span></li>
        <li><i>&#10003;</i><span>Stage lines from <b>different orders are mixed together</b>.
          Six lines for one order and then six for the next means the orders ran one
          after another, and that is the commonest way to fail this.</span></li>
        <li><i>&#10003;</i><span>Within one order the six stages are in <b>strict order</b>.</span></li>
        <li><i>&#10003;</i><span>Every line says <b>which order</b> it belongs to. With several
          orders running, a line without an id tells you nothing.</span></li>
        <li><i>&#10003;</i><span>The program <b>ends on its own</b> once every order is
          delivered. No thread left hanging.</span></li>
      </ul>
    </section>

    <section class="panel">
      <h3>Try it here first</h3>
      <p>Place one order, wait ten seconds, then place another, and watch the two
         cards. They stay one stage apart for the rest of the run. That is the
         behaviour your console build has to produce.</p>
      <button class="btn btn--primary" data-go="menu">Open the menu</button>
    </section>`;
}

/* -------------------------------------------------------------- routing */

function render() {
  if (state.view === 'menu') return menuView();
  if (state.view === 'orders') return ordersView();
  if (state.view === 'assignment') return assignmentView();
  welcomeView();
}

document.addEventListener('click', (e) => {
  const go = e.target.closest('[data-go]');
  if (!go) return;
  state.view = go.dataset.go;
  render();
});

render();
