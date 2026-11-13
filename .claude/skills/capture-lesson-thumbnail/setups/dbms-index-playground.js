(async () => {
  const wait = ms => new Promise(r => setTimeout(r, ms));
  document.querySelector('#s3 .seg button[data-speed="2.5"]').click();
  document.getElementById('run3').click();
  for (let i = 0; i < 80 && !/Done/.test(document.getElementById('cap3').textContent); i++) await wait(500);
  // Land on the Build index card the way the step links do: just under the bar.
  const a = document.getElementById('go-s3');
  const y = a.getBoundingClientRect().top + scrollY - (document.querySelector('.top').offsetHeight + 12 + 3 * 8);
  window.scrollTo({ top: y, behavior: 'instant' });
  await wait(900);
  return { cap: document.getElementById('cap3').textContent.slice(0, 40), top: Math.round(document.getElementById('s3').getBoundingClientRect().top) };
})()
