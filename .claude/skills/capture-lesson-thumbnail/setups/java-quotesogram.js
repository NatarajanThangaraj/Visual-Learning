/* QuotesOGram — sign in as a seeded account and land on the feed. The page
   opens on the sign-in screen, which says nothing about what the lab is. */
(async () => {
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const form = document.querySelector('form[data-form="signin"]');
  if (form) {
    form.username.value = 'rajan_t';
    form.password.value = 'quotes123';
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await wait(1400);
  }
  location.hash = '#/feed'; await wait(1000);
  return { hash: location.hash, posts: document.querySelectorAll('[data-post]').length };
})()
