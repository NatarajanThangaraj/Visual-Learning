(async () => {
  const wait = ms => new Promise(r => setTimeout(r, ms));
  // Walk one order from the door to the kitchen (about 28 s of animation), using the page's own ACT handlers.
  await ACT.letIn();
  await ACT.chooseTable(3);
  await ACT.scan();
  ACT.qty('ptb|1'); ACT.qty('dosa|2'); ACT.qty('lassi|1');
  await ACT.placeOrder();
  ACT.prep(0);
  await wait(4000);
  // The Live database tab: the INSERTs from Priya's phone and the chef's UPDATE.
  ACT.tab('db');
  await wait(600);
  return { phase: ST.phase, step: ST.step, statements: ST.sql.length, items: ST.order.items.map(i => i.status) };
})()
