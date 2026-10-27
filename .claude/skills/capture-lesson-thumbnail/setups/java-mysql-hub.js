(async () => {
  // The hub's own landing (wordmark and the assignment cards) is the shot; only
  // make sure the web fonts have landed so the gradient wordmark renders as designed.
  await document.fonts.ready;
  await new Promise(r => setTimeout(r, 300));
  return { cards: document.querySelectorAll('#grid .card:not(.slot)').length,
           lede: !!document.getElementById('lede'),
           fonts: [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family).filter((f, i, a) => a.indexOf(f) === i) };
})()
