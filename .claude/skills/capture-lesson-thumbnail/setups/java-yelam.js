(async () => {
  // The auction lives inside the page's IIFE, so drive it through the DOM: walk past
  // the gate, raise our paddle once a lot is up, then wait for a lively moment — the
  // rivals seated, a few bids on the ladder, and no "Going once" banner mid-sweep.
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const $ = id => document.getElementById(id);
  const until = async (ok, ms) => { const end = Date.now() + ms; while (!ok()) { if (Date.now() > end) return false; await wait(100); } return true; };
  const bids = () => $('ladder').querySelectorAll('li:not(.base)').length;
  const calm = () => !$('banner').getAnimations().length && $('verdict').hidden;

  $('enterBtn').click();
  await until(() => !$('pName').textContent.startsWith('Waiting'), 15000);   // first lot is up
  let raised = false;
  const ok = await until(() => {
    const mine = $('myPaddle');
    if (!raised && mine && !mine.disabled && bids() >= 1) { mine.click(); raised = true; }
    return raised && bids() >= 3 && document.querySelectorAll('.paddle').length >= 3 && calm();
  }, 90000);
  await wait(500);                         // let the latest bid's bump and drop animations settle
  return { ok, lot: $('lotNum').textContent, player: $('pName').textContent, price: $('price').textContent,
           bids: bids(), paddles: document.querySelectorAll('.paddle').length, said: $('sayNow').textContent };
})()
