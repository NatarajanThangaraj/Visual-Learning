(async () => {
  const wait = ms => new Promise(r => setTimeout(r, ms));
  await (document.fonts ? document.fonts.ready : Promise.resolve());
  // Play the "lot full, one more arrives" scenario so the board, the 3D lot and the log are all populated.
  document.querySelector('[data-scen=full]').click();
  await wait(6000);
  return { board: document.body.innerText.replace(/\s+/g, ' ').match(/Free \d+ Occupied \d+/)?.[0] };
})()
