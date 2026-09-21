/* Abstract Class Simulator — Food Order, Biryani, held on step 3 of 5.

   Step 3 is packFood(), the one abstract method, and it is the only step worth
   capturing: the runtime view shows `order.packFood() → dispatches to
   BiryaniOrder.packFood()` with packFood() lit as ABSTRACT in FoodOrder and
   BiryaniOrder selected while PizzaOrder and Chicken65Order sit dimmed beside
   it. Drafted and compared:
     - the untouched load: "Select a food item to begin" and the whole lower
       half of the frame empty dark;
     - step 5 (handoverToDelivery): finishes the run, but lands on a method
       *inherited* from FoodOrder — the opposite of the lesson's point;
     - this one: the dispatch moment, with the Shawarma challenge question
       filling the lower left so nothing crops in as dead space.

   doStep() rather than doRun(): doRun animates on a 700ms timer and ends on a
   "✓ Complete" toast, which lands in the frame. */
(async () => {
  const wait = ms => new Promise(r => setTimeout(r, ms));
  loadScenario('food'); await wait(600);
  selectImpl('biryani'); await wait(600);
  for (let i = 0; i < 3; i++) { doStep(); await wait(420); }
  await wait(600);
  return { step: (document.getElementById('stepLabel')||{}).textContent };
})()
