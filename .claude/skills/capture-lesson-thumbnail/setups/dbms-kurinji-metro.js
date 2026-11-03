(async () => {
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const click = sel => document.querySelector(sel).click();
  location.hash = '#account';
  await wait(400);
  click('[data-act=demo][data-who=customer]');
  await wait(100);
  click('[data-act=dosignin]');
  await wait(800);
  // Rice, dal and coffee into the cart, so the cart panel shows a real order.
  for (const name of ['Ponni Raw Rice', 'Toor Dal', 'Toor Dal', 'Filter Coffee Powder']) {
    const card = [...document.querySelectorAll('.pcard')].find(c => c.querySelector('h3').textContent === name);
    card.querySelector('[data-act=add]').click();
    await wait(80);
  }
  document.getElementById('products').scrollIntoView({ block: 'start' });
  window.scrollBy(0, -66);
  await wait(300);
  return { user: document.getElementById('top-actions').innerText.replace(/\s+/g, ' '), cart: document.querySelector('#cart-panel h2').innerText };
})()
