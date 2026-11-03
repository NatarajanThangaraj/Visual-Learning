(async () => {
  const wait = ms => new Promise(r => setTimeout(r, ms));
  location.hash = '#step-5';
  await wait(900);
  document.querySelector('#step-5 [data-sub="b"]').click();
  await wait(700);
  for (let i = 0; i < 4; i++) { document.getElementById('btn-fwd').click(); await wait(900); }
  return { step: location.hash, hint: document.getElementById('hint-5').textContent,
           count: document.getElementById('count-5').textContent };
})()
