(async () => {
  const wait = ms => new Promise(r => setTimeout(r, ms));
  document.querySelector('#s3 .seg button[data-speed="2.5"]').click();
  document.getElementById('run3').click();
  for (let i = 0; i < 80 && !/Done/.test(document.getElementById('cap3').textContent); i++) await wait(500);
  document.getElementById('tree3').scrollIntoView({ block: 'center', behavior: 'instant' });
  window.scrollBy(0, 170);
  await wait(800);
  return { cap: document.getElementById('cap3').textContent, y: Math.round(scrollY) };
})()
