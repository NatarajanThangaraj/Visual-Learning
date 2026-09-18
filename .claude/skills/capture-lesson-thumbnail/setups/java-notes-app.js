/* Notes App — step into the middle of the Add-note trace, where the Note class
   is lit, the arrow has travelled and the caption explains the constructor. An
   untouched load shows the same diagram with everything dim and "press Run to
   begin", which makes a lifeless card. */
(async () => {
  const wait = ms => new Promise(r => setTimeout(r, ms));
  runPG(); await wait(600);
  for (let i = 0; i < 3; i++) { nextPG(); await wait(600); }
  return { step: document.getElementById('pg-step')?.textContent?.trim() || 'running' };
})()
