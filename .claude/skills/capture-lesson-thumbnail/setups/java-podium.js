(async () => {
  // Everything lives inside the page's IIFE, so drive it through the DOM: skip the
  // splash, pick a name, join a room, solve all ten sums on the keypad, then wait
  // for the two other players so the podium itself is on screen.
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const $ = id => document.getElementById(id);
  const until = async (ok, ms = 60000) => { const end = Date.now() + ms; while (!ok()) { if (Date.now() > end) return false; await wait(100); } return true; };
  const solve = t => { const [a, op, b] = t.split(' '), x = +a, y = +b;
    return op === '+' ? x + y : op === '−' ? x - y : op === '×' ? x * y : x / y; };
  const press = k => $('racePad').querySelector(`[aria-label="${k}"]`).click();

  $('skip').click(); await wait(900);
  if (!$('welcome').hidden) { $('nameInput').value = 'asha'; $('saveName').click(); await wait(300); }
  $('joinBtn').click();
  if (!await until(() => !$('race').hidden, 20000)) return { error: 'race never started' };

  for (let n = 0; n < 10 && !$('race').hidden; n++) {
    const q = $('raceQ').textContent;
    await wait(900);                      // a human pace, so the podium shows a believable time
    for (const d of String(solve(q))) { press(d); await wait(120); }
    await until(() => $('raceQ').textContent !== q || $('race').hidden, 3000);
    await wait(250);
  }
  const done = await until(() => !$('podium').hidden, 90000);
  await wait(1400);                       // let the podium blocks finish rising
  return { podium: done, title: $('podTitle').textContent,
           steps: [...document.querySelectorAll('#stand .step strong')].map(s => s.textContent) };
})()
