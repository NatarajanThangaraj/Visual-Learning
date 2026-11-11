(async () => {
  const wait = ms => new Promise(r => setTimeout(r, ms));
  // The lab is a shell; each story runs in its inner frame. Open the Tatkal (Consistency) story.
  location.hash = 'consistency';
  await wait(1200);
  const d = document.getElementById('page').contentDocument;
  await (d.fonts ? d.fonts.ready : Promise.resolve());
  const book = [...d.querySelectorAll('button')].find(b => /Book now/.test(b.textContent));
  book.click();
  await wait(3500);
  // Frame the booking phone and the coach's berth map together.
  const phone = d.querySelector('.phone, [class*=phone]');
  if (phone) { d.scrollingElement.scrollTop = phone.getBoundingClientRect().top + d.scrollingElement.scrollTop - 24; }
  await wait(400);
  return { hash: location.hash, booked: !!book, text: d.body.innerText.replace(/\s+/g, ' ').match(/Your bookings.{0,60}/)?.[0] };
})()
