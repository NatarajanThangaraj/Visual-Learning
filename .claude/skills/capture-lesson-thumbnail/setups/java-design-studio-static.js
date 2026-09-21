/* Design Studio — the Objects view, held on the FREE plan.

   Replaces an earlier capture of the untouched landing screen: an empty
   "Design Canvas" with the middle 60% of the frame dead black, which is
   exactly the band the card crops to.

   Drafted and compared four frames:
     - the old landing screen: nothing placed, nothing to read;
     - Class Flow (Templates → PremiumChecker → AppConfig): a narrow vertical
       column with wide empty margins on both sides and the bottom;
     - Play with six items placed and PRO unlocked: the items land in a single
       top row and leave the canvas an empty rectangle below;
     - Objects on PRO: on-message, but all five cards read "✓ Open", so the row
       is five identical green cards;
     - this one: Objects on FREE. Three premium objects go 🔒 Locked and red,
       two stay ✓ Open and green, while all five still read
       `userPlan ↑ AppConfig` from the one purple static box above them. That
       red/green split is what makes the card legible at ~90px wide, and it is
       the lesson's point — one shared value deciding all five.

   setObjPlan rather than setPlan: it syncs App.plan, the Objects-view toggle
   and the static-val display together. Calling setPlan alone leaves the frame
   contradicting itself — "PRO" in AppConfig with the FREE button still lit. */
(async () => {
  const wait = ms => new Promise(r => setTimeout(r, ms));
  nav('objects'); await wait(1200);
  setObjPlan('FREE'); await wait(1400);
  return { staticVal: document.getElementById('static-val')?.textContent,
           results: [...document.querySelectorAll('[id^=tar-]')].map(e => e.textContent) };
})()
