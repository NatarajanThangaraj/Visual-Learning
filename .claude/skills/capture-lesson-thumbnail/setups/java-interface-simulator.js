/* Interface Simulator — open the Concept Map.

   Drafted and compared three frames:
     - the untouched load: three panels, but nothing chosen, "Step 0 / 3", and the
       Java view still reads `connection = new ?()`, which sells nothing;
     - Wi-Fi connected (selectWifi('office') then doRun()): the real interactive
       story, `new OfficeWiFi()` resolved and highlighted — but the lower-left
       third of the page is empty, and the card crops almost nothing away;
     - this one: the Application → Reference → Object → Class → Method → Result
       chain beside a fully annotated Java walkthrough, filling the frame edge to
       edge and unmistakably about interfaces at ~90px wide. */
(async () => {
  const wait = ms => new Promise(r => setTimeout(r, ms));
  loadScenario('concept'); await wait(1200);
  const label = document.getElementById('uPaneLabel');
  return {
    pane: label ? label.textContent : null,
    boxes: document.querySelectorAll('#userContent div[style*="border"]').length
  };
})()
