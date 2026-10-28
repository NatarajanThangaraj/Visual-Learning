(async () => {
  // The hub's own landing (header and the app cards) is the shot; only make sure
  // the web fonts have landed so the header and mono tags render as designed.
  await document.fonts.ready;
  await new Promise(r => setTimeout(r, 300));
  return { cards: document.querySelectorAll('#grid .card:not(.slot)').length,
           fonts: [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family).filter((f, i, a) => a.indexOf(f) === i) };
})()
