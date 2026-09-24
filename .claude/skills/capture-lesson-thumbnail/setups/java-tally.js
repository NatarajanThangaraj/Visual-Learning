(async () => {
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const $ = id => document.getElementById(id);
  $('skip').click(); await wait(900);
  $('nameInput').value = 'quickmaths';
  $('saveName').click(); await wait(300);
  $('startBtn').click(); await wait(300);
  const solve = () => {
    const [a, op, b] = $('question').textContent.split(' ');
    const x = +a, y = +b;
    const ans = op === '+' ? x + y : op === '−' ? x - y : op === '×' ? x * y : x / y;
    for (const d of String(ans)) document.dispatchEvent(new KeyboardEvent('keydown', { key: d }));
  };
  for (let i = 0; i < 7; i++) { solve(); await wait(350); }
  document.dispatchEvent(new KeyboardEvent('keydown', { key: '4' }));
  return { score: $('score').textContent, q: $('question').textContent };
})()
