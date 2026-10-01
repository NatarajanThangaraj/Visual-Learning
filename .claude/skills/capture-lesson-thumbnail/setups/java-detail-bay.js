(async () => {
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const btn = document.querySelector('.send:not([disabled])');
  btn.click();
  await wait(3000);
  return { stageText: document.querySelector('.step.is-now')?.textContent || null };
})()
