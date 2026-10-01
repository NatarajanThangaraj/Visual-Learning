(async () => {
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const btn = document.querySelector('.sendhome');
  btn.click();
  await wait(300);
  return { locating: !!document.querySelector('.app-row.locating') };
})()
