/* MathicsArena — stage 4, held at the lock moment.

   Drafted and compared three frames:
     - the untouched load: the Start here card grid. Readable, but it is a
       contents page; nothing on it says "threads" and nothing is running;
     - the class-flow diagram (submitAnswer): handsome, and at ~90px wide it
       reads as a generic box-and-arrow picture that half the Java labs could
       have produced;
     - this one: tick 29 of stage 4, chosen because it is the exact tick where
       the lesson is visible all at once — GameManager outlined red with the
       padlock shut and `owner CH-Arjun`, the entry set naming the two threads
       queued behind him, three live terminals mid-round, and a red BLOCKED
       stretch in the thread lanes. The centre of the frame (which is all the
       card keeps) holds the locked GameManager and the terminals.

   Toasts are cleared last: they are transient, and one caught mid-fade in a
   still image just looks like a rendering fault. */
(async () => {
  const wait = ms => new Promise(r => setTimeout(r, ms));
  go('stage4');
  for (let i = 0; i < 29; i++) tick();
  setView('split');
  await wait(300);
  document.querySelectorAll('.toast').forEach(t => t.remove());
  await wait(200);
  return {
    tick: sim.tick,
    owner: sim.monitor.owner ? byId(sim.monitor.owner).name : null,
    entrySet: sim.monitor.entry.map(id => byId(id).name),
    blocked: sim.threads.filter(t => t.state === 'BLOCKED').map(t => t.name)
  };
})()
