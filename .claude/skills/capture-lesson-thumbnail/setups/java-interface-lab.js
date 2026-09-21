/* Interface Lab — Home Wi-Fi connected, with the Discover panel open.

   Drafted and compared:
     - the untouched load: three panels, but nothing chosen, "Step 0 / 3", the
       Java view still reading `connection = new ?()` and the right panel
       saying "Interact with a scenario to create objects";
     - this one: Home Wi-Fi selected and connected, `new HomeWiFi()` resolved
       and the reference→object arrow drawn, and the Discovery question with
       its three options filling the right column.

   Deliberately NOT the Concept Map — that is the frame java-interface-simulator.js
   takes, and two adjacent cards showing the same diagram read as a duplicate
   entry. The Discovery panel is also what distinguishes this lab from that one. */
(async () => {
  const wait = ms => new Promise(r => setTimeout(r, ms));
  selectWifi('home'); await wait(700);
  doRun(); await wait(1600);
  const tab = [...document.querySelectorAll('.rp-tab')].find(t => /Discover/i.test(t.textContent));
  setRpTab('discovery', tab); await wait(900);
  return { tabFound: !!tab, question: (document.querySelector('.disc-q')||{}).textContent,
           opts: document.querySelectorAll('.disc-opt').length };
})()
