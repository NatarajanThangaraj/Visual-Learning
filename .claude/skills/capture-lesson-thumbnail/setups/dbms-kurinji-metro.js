(async () => {
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const click = sel => document.querySelector(sel).click();
  location.hash = '#account';
  await wait(400);
  click('[data-act=demo][data-who=customer]');
  await wait(100);
  click('[data-act=dosignin]');
  await wait(800);
  // Rice, dal and coffee into the cart, then check out, so the panel shows the order's transaction.
  for (const name of ['Ponni Raw Rice', 'Toor Dal', 'Toor Dal', 'Filter Coffee Powder']) {
    const card = [...document.querySelectorAll('.pcard')].find(c => c.querySelector('h3').textContent === name);
    card.querySelector('[data-act=add]').click();
    await wait(80);
  }
  location.hash = '#checkout';
  await wait(500);
  click('[data-act=place]');
  await wait(900);
  click('.btc-toggle');
  await wait(800);
  // Start the log at the order's transaction rather than its sign-in check.
  const body = document.querySelector('.btc-body');
  body.scrollTop = [...body.querySelectorAll('.btc-stmt')].find(s => /START TRANSACTION/.test(s.textContent)).offsetTop - 120;
  return { hash: location.hash, first: document.querySelector('.btc-req-h').innerText.replace(/\s+/g, ' ') };
})()
