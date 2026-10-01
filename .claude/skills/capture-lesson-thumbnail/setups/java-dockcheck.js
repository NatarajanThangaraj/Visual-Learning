(async () => {
  const wait = ms => new Promise(r => setTimeout(r, ms));
  document.getElementById('scanAll').click();
  await wait(2600);
  return { states: Array.from(document.querySelectorAll('.dock')).map(d => d.dataset.state) };
})()
