/* Collections Lab — open the framework hierarchy map, the lab's own "START HERE".
   Three frames were drafted and compared:
     - the landing menu: states the premise well, but reads as a wall of small cards;
     - the hospital queue caught on the wrong collection: the best story, but the
       page content stops two thirds down and the card crops in a band of dead dark;
     - this map: fills the frame edge to edge and is unmistakable at card size,
       which is what matters at ~90px wide next to two other dark lab cards. */
(async () => {
  const wait = ms => new Promise(r => setTimeout(r, ms));
  goTo('hierarchy'); await wait(900);
  const page = document.getElementById('page-hierarchy');
  return { shown: !!page && page.offsetParent !== null,
           nodes: document.querySelectorAll('#page-hierarchy .hier-node').length };
})()
