(async () => {
  const wait = ms => new Promise(r => setTimeout(r, ms));
  // Skip the intro splash and the long drive: park the vehicle at stop 5,
  // "Pattern matching for switch" (Java 21, the plane), with the camera settled.
  const i = 5;
  $('#intro').classList.add('gone');
  S.vehX = XS(i); S.camAlt = alt(XS(i));
  arrive(i);                  // runs the case check, opens the side card after ~1.5s
  await wait(3200);           // let the "Java 21" flash fade and the run finish
  return { stop: STOPS[S.idx].name, mode: S.mode, card: S.cardOpen,
           status: document.querySelector('#cstatus')?.textContent };
})()
