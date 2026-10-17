(async () => {
  // The sample wall is already full; show the tag lookup in action (#exam pressed,
  // its notes only) and make sure the Google Fonts have landed before the shot.
  const wait = ms => new Promise(r => setTimeout(r, ms));
  await document.fonts.ready;
  const tag = [...document.querySelectorAll('#tagRow .tag-btn')].find(b => b.textContent.startsWith('#exam'));
  tag.click();
  await wait(900);                         // the click smooth-scrolls the status line into view
  document.scrollingElement.scrollTop = 0;
  await wait(300);
  const pressed = document.querySelector('#tagRow .tag-btn[aria-pressed="true"]');   // re-rendered on click, so query again
  return { pressed: pressed && pressed.textContent, status: document.getElementById('status').textContent,
           fonts: [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family).filter((f, i, a) => a.indexOf(f) === i) };
})()
