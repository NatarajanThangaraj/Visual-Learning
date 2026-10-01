(async () => {
  const wait = ms => new Promise(r => setTimeout(r, ms));
  document.getElementById('keyword').value = 'refund';
  document.getElementById('searchBtn').click();
  await wait(3200);
  return { matches: document.querySelectorAll('.result-row').length };
})()
