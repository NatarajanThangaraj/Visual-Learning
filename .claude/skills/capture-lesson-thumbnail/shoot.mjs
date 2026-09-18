#!/usr/bin/env node
/**
 * Capture a lesson's thumb.png — a real 1280x800 screenshot of the lab page.
 *
 *   node shoot.mjs java/quotesogram
 *   node shoot.mjs java/notes-app --setup /tmp/setup.js --wait 2000
 *   node shoot.mjs java/notes-app --scroll 72 --out /tmp/preview.png
 *   node shoot.mjs --url http://localhost:4599/java/foo/full --out /tmp/x.png
 *
 * Serves client-src/public itself, drives headless Chrome over the DevTools
 * protocol, and writes the PNG. No npm dependencies — Node's own http plus the
 * global WebSocket, and a Chrome that is already on the machine.
 *
 * --setup takes a file holding ONE JavaScript expression, evaluated in the page
 * before the capture and awaited if it returns a promise. That is how the page
 * gets into a state worth looking at: sign in, run a step, open a tab. Its
 * return value is printed, so return something that proves the setup landed.
 */

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const WIDTH = 1280;          // every existing thumb.png is exactly this size,
const HEIGHT = 800;          // and the cards assume the 8:5 shape
const SCALE = 1;

/* ------------------------------------------------------------------- args */

function parseArgs(argv) {
  const opts = { wait: 1800, scroll: 0 };
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--setup') opts.setup = argv[++i];
    else if (a === '--wait') opts.wait = Number(argv[++i]);
    else if (a === '--scroll') opts.scroll = Number(argv[++i]);
    else if (a === '--out') opts.out = argv[++i];
    else if (a === '--url') opts.url = argv[++i];
    else if (a === '--keep-open') opts.keepOpen = true;
    else if (a === '-h' || a === '--help') opts.help = true;
    else rest.push(a);
  }
  opts.target = rest[0];
  return opts;
}

const USAGE = `
Capture a Visual Learning lesson thumbnail.

  node shoot.mjs <folder>/<slug> [options]     e.g. java/quotesogram
  node shoot.mjs --url <url> --out <file>

Options
  --setup <file>   JS expression run in the page before capture (awaited)
  --wait <ms>      settle time after load, and again after setup  (default 1800)
  --scroll <px>    scroll down this far before capturing          (default 0)
  --out <file>     where to write                (default: the lab's thumb.png)
  --keep-open      leave the static server running for a manual look
`;

/* ------------------------------------------------------ find a real Chrome */

/** Newest Playwright chromium first, then a system Chrome. */
function findChrome() {
  const cacheRoots = [
    path.join(os.homedir(), 'Library/Caches/ms-playwright'),
    path.join(os.homedir(), '.cache/ms-playwright'),
  ];
  const inBundle = [
    'chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
    'chrome-mac/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
    'chrome-linux/chrome',
    'chrome-headless-shell-mac-arm64/chrome-headless-shell',
    'chrome-headless-shell-mac/chrome-headless-shell',
    'chrome-headless-shell-linux/chrome-headless-shell',
  ];

  const found = [];
  for (const root of cacheRoots) {
    if (!fs.existsSync(root)) continue;
    for (const dir of fs.readdirSync(root)) {
      // chromium-1243 sorts after chromium-1180 only numerically, so keep the
      // build number for sorting rather than trusting readdir order.
      const build = Number((dir.match(/-(\d+)$/) || [])[1] || 0);
      for (const tail of inBundle) {
        const bin = path.join(root, dir, tail);
        if (fs.existsSync(bin)) found.push({ build, bin, headlessShell: dir.includes('headless_shell') });
      }
    }
  }
  // Prefer full chromium over the headless shell: the shell cannot do
  // everything a page might want (some labs touch APIs it stubs out).
  found.sort((a, b) => a.headlessShell - b.headlessShell || b.build - a.build);
  if (found.length) return found[0].bin;

  for (const bin of [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
  ]) if (fs.existsSync(bin)) return bin;

  throw new Error(
    'No Chrome found. Install Playwright browsers (npx playwright install chromium) ' +
    'or Google Chrome, then re-run.'
  );
}

/* ------------------------------------------------------- static file server */

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.gif': 'image/gif', '.webp': 'image/webp', '.ico': 'image/x-icon',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf',
  '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.mp4': 'video/mp4',
  '.csv': 'text/csv; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
};

function serve(root) {
  const server = http.createServer((req, res) => {
    const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/^\/+/, '');
    let file = path.join(root, rel);
    if (!file.startsWith(root)) { res.writeHead(403).end('no'); return; }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    fs.readFile(file, (err, data) => {
      if (err) { res.writeHead(404).end('not found'); return; }
      res.writeHead(200, {
        'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
        'Cache-Control': 'no-store',
      });
      res.end(data);
    });
  });
  return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve(server)));
}

/* -------------------------------------------------------------------- CDP */

const sleep = ms => new Promise(r => setTimeout(r, ms));

const getJSON = url => new Promise((resolve, reject) => {
  http.get(url, r => {
    let body = '';
    r.on('data', c => { body += c; });
    r.on('end', () => { try { resolve(JSON.parse(body)); } catch (e) { reject(e); } });
  }).on('error', reject);
});

class CDP {
  constructor(ws) { this.ws = ws; this.seq = 0; this.pending = new Map(); this.events = []; }

  static async connect(wsUrl) {
    const ws = new WebSocket(wsUrl);
    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = () => reject(new Error('could not open a DevTools connection'));
    });
    const cdp = new CDP(ws);
    ws.onmessage = e => {
      const msg = JSON.parse(e.data);
      if (msg.method) { cdp.events.push(msg); return; }
      const waiter = cdp.pending.get(msg.id);
      if (!waiter) return;
      cdp.pending.delete(msg.id);
      msg.error ? waiter.reject(new Error(msg.error.message)) : waiter.resolve(msg.result);
    };
    return cdp;
  }

  send(method, params = {}) {
    const id = ++this.seq;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
  }

  /** Resolves once the page fires `load`, or after `timeout` either way. */
  async waitForLoad(timeout = 15000) {
    const until = Date.now() + timeout;
    while (Date.now() < until) {
      if (this.events.some(e => e.method === 'Page.loadEventFired')) return true;
      await sleep(100);
    }
    return false;
  }

  async eval(expression) {
    const r = await this.send('Runtime.evaluate', {
      expression, awaitPromise: true, returnByValue: true, userGesture: true,
    });
    if (r.exceptionDetails) {
      const d = r.exceptionDetails;
      throw new Error('page script failed: ' + (d.exception?.description || d.text));
    }
    return r.result.value;
  }
}

/** Width and height straight out of the PNG header, to prove what we wrote. */
function pngSize(file) {
  const buf = fs.readFileSync(file);
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

/* -------------------------------------------------------------------- main */

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help || (!opts.target && !opts.url)) { console.log(USAGE); process.exit(opts.help ? 0 : 1); }

  // The skill lives at <repo>/.claude/skills/capture-lesson-thumbnail/
  const here = path.dirname(fileURLToPath(import.meta.url));
  const repo = path.resolve(here, '../../..');
  const publicDir = path.join(repo, 'client-src/public');
  if (!fs.existsSync(publicDir)) {
    throw new Error(`expected ${publicDir} — run this from inside the Visual Learning repo`);
  }

  let out = opts.out;
  let url = opts.url;

  if (opts.target) {
    const m = /^([a-z0-9-]+)\/([\w.-]+)$/.exec(opts.target);
    if (!m) throw new Error(`target should look like java/my-slug, got "${opts.target}"`);
    const [, folder, slug] = m;
    const labDir = path.join(publicDir, 'labs', folder, slug);
    if (!fs.existsSync(path.join(labDir, 'index.html'))) {
      throw new Error(`no index.html at client-src/public/labs/${folder}/${slug}/`);
    }
    out ??= path.join(labDir, 'thumb.png');
    url ??= `/labs/${folder}/${slug}/index.html`;

    // A lab whose thumbnail needs a populated state keeps its recipe next to
    // this script, so the shot can be taken again months later. Storing it
    // here rather than in the lab folder keeps it out of the hosted build.
    const remembered = path.join(here, 'setups', `${folder}-${slug}.js`);
    if (!opts.setup && fs.existsSync(remembered)) {
      opts.setup = remembered;
      console.log(`  setup    setups/${folder}-${slug}.js`);
    }
  }
  if (!out) throw new Error('--url needs --out');

  const setup = opts.setup ? fs.readFileSync(opts.setup, 'utf8').trim() : '';
  const chromeBin = findChrome();
  const server = await serve(publicDir);
  const origin = `http://127.0.0.1:${server.address().port}`;
  if (!/^https?:/.test(url)) url = origin + (url.startsWith('/') ? url : '/' + url);

  const pw = chromeBin.match(/ms-playwright\/([^/]+)/);
  console.log(`  chrome   ${pw ? pw[1] : chromeBin}`);
  console.log(`  serving  client-src/public at ${origin}`);
  console.log(`  page     ${url}`);

  const port = 9200 + Math.floor(Math.random() * 500);
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'thumb-shot-'));
  const chrome = spawn(chromeBin, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    `--window-size=${WIDTH},${HEIGHT}`,
    `--user-data-dir=${profile}`,
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
    '--no-first-run', '--no-default-browser-check',
    '--disable-extensions', '--disable-background-networking',
    'about:blank',
  ], { stdio: 'ignore' });

  const done = () => {
    chrome.kill();
    if (!opts.keepOpen) server.close();
    fs.rmSync(profile, { recursive: true, force: true });
  };

  try {
    let target;
    for (let i = 0; i < 80 && !target; i++) {
      try {
        target = (await getJSON(`http://127.0.0.1:${port}/json/list`)).find(t => t.type === 'page');
      } catch { /* not listening yet */ }
      if (!target) await sleep(250);
    }
    if (!target) throw new Error('Chrome never opened a debuggable page');

    const cdp = await CDP.connect(target.webSocketDebuggerUrl);
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('Emulation.setDeviceMetricsOverride',
      { width: WIDTH, height: HEIGHT, deviceScaleFactor: SCALE, mobile: false });

    await cdp.send('Page.navigate', { url });
    if (!await cdp.waitForLoad()) console.warn('  ! load event never fired — capturing anyway');
    await sleep(opts.wait);

    if (setup) {
      const value = await cdp.eval(setup);
      console.log('  setup →', JSON.stringify(value));
      await sleep(opts.wait);
    }
    if (opts.scroll) {
      await cdp.eval(`window.scrollTo(0, ${opts.scroll}); 'scrolled'`);
      await sleep(400);
    }

    const shot = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, Buffer.from(shot.data, 'base64'));

    const { width, height } = pngSize(out);
    const kb = Math.round(fs.statSync(out).size / 1024);
    const rel = path.relative(repo, out);
    console.log(`  wrote    ${rel.startsWith('..') ? out : rel}  ${width}x${height}  ${kb} KB`);
    if (width !== WIDTH || height !== HEIGHT) {
      throw new Error(`expected ${WIDTH}x${HEIGHT}, got ${width}x${height}`);
    }
    if (opts.keepOpen) {
      console.log(`\n  still serving ${origin} — Ctrl+C when you are done looking.`);
      chrome.kill();
      fs.rmSync(profile, { recursive: true, force: true });
      return;
    }
  } finally {
    if (!opts.keepOpen) done();
  }
}

main().catch(err => { console.error('\n  ' + err.message + '\n'); process.exit(1); });
