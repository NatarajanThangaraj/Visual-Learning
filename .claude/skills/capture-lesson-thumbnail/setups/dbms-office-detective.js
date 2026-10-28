(async () => {
  const wait = ms => new Promise(r => setTimeout(r, ms));
  document.getElementById('bExplore').click();
  await wait(2500);
  document.getElementById('invBtn').click();
  await wait(800);
  document.querySelector('.qc[data-q="cafe"]').click();
  await wait(2500);
  return { inv: document.getElementById('inv').classList.contains('open'),
           pane: (document.getElementById('pane').innerText || '').slice(0, 80) };
})()
