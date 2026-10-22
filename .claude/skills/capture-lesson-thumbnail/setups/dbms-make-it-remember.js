(async () => {
  // The overview is a contents list; the idea lands faster on a messy sheet. Open
  // QuickBite (its own router listens for hashchange), tick two of its tasks so the
  // page reads as in use, and wait for the web fonts before the shot.
  const wait = ms => new Promise(r => setTimeout(r, ms));
  await document.fonts.ready;
  location.hash = 'quickbite';
  await wait(600);
  const view = document.getElementById('view-quickbite');
  [...view.querySelectorAll('.try')].slice(0, 2).forEach(b => b.click());
  document.scrollingElement.scrollTop = 0;
  await wait(400);
  return { shown: !view.hidden, ticked: view.querySelector('.count').textContent.trim(),
           fonts: [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family).filter((f, i, a) => a.indexOf(f) === i) };
})()
