(async () => {
  const wait = ms => new Promise(r => setTimeout(r, ms));
  await compile();            // Hello.java -> javac -> Hello.class
  await wait(400);
  await showChoices();        // reveal the three destination computers
  await wait(900);
  await choose('win');        // fly the same Hello.class to Windows, trail drawn
  await wait(900);
  document.scrollingElement.scrollTop = 0;   // the lab's own scrollTo(el) shadows window.scrollTo
  return { phase: document.getElementById('stage').dataset.phase,
           filled: !!document.querySelector('#slot-win.filled'),
           cap: document.getElementById('cap').textContent };
})()
