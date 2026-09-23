/* Nawabi Kitchen — the orders board, four orders each on a different stage.

   The whole point of the lab is that orders do not queue behind one another,
   so the card has to show several at once at different stages. Drafted and
   compared:
     - the welcome screen: the restaurant's name and two buttons, nothing
       running;
     - the assignment view (Main → Hall → Kitchen): a class diagram, and the
       neighbouring MathicsArena card in this same module is already a dense
       technical diagram — two of those side by side read as one entry;
     - three orders instead of four: the card heights mean only ~2.5 fit in
       the frame either way, so it framed identically and merely lost the
       "4 on the way" pill;
     - this one: four orders, the top two complete in frame at Preparing (two
       boxes) and Finishing (three boxes), and the banner spelling the lesson
       out — "You do not have to wait for this one. Order again and both are
       cooked at the same time."

   The board is built by hand rather than by placing orders and waiting: a
   stage is ten seconds, so reaching stage 4 honestly would take forty, and
   the live timers would move a card mid-capture. Backdating placedAt and
   synthesising history gives the same state exactly and holds it still.

   This lab is also the one warm cream page in a course of dark ones, which is
   most of why the card is recognisable at ~90px wide. */
(async () => {
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const { STAGE_MS, STAGES, MENU } = window.Kitchen;
  const dishes = MENU.flatMap(c => c.items);
  const pick = ['Mutton Dum Biryani','Galouti Kebab','Murgh Dum Biryani','Dahi ke Kebab']
    .map(n => dishes.find(d => d.name === n));

  state.orders.forEach(o => clearTimeout(o.timer));
  state.orders = [];
  state.nextNumber = 1041;

  const now = Date.now();
  // Oldest first (furthest along); unshift puts the newest on top.
  [4, 3, 2, 1].forEach((stage, i) => {
    const placedAt = now - stage * STAGE_MS;
    const history = [];
    for (let s = 0; s <= stage; s++) history.push({ stage: s, at: placedAt + s * STAGE_MS });
    state.orders.unshift({ id: `NK-${state.nextNumber++}`, dish: pick[i],
                           placedAt, stage, history, timer: null });
  });

  state.view = 'orders';
  render();
  await wait(1200);
  return { cards: document.querySelectorAll('[data-order]').length,
           stages: [...document.querySelectorAll('[data-order]')]
             .map(c => c.querySelectorAll('.step').length) };
})()
