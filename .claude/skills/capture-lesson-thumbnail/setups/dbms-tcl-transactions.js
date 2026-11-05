(async () => {
  const wait = ms => new Promise(r => setTimeout(r, ms));
  for (let i = 0; i < 7; i++) { document.getElementById('pFw').click(); await wait(1600); }
  await wait(1500);
  return { step: document.getElementById('pLb').textContent,
           sealed: document.body.innerText.includes('Sealed'),
           received: document.body.innerText.includes('Received ₹500') };
})()
