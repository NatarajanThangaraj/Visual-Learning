/* QuotesOGram – browser client */
'use strict';

/* ------------------------------------------------------------------ api */
const TOKEN_KEY = 'quotesogram.token';
let token = localStorage.getItem(TOKEN_KEY) || '';

/* The one line that changed when this moved off the server: there is no
   Node process here, so the same request goes to backend.js in this page
   instead of down a socket. Still async — every caller awaits it. */
async function api(path, { method = 'GET', body } = {}) {
  const res = QuotesOgramServer.request(method, `/api${path}`, { body, token });
  const data = res.data || {};
  if (res.status >= 400) {
    if (res.status === 401 && state.me) signOutLocal();
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

/* ---------------------------------------------------------------- state */
const state = { me: null, badges: { requests: 0, unread: 0 } };
let chatTimer = null;

const app = document.getElementById('app');
const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const initial = (u) => (u?.name || u?.username || '?').trim()[0].toUpperCase();

function ago(ts) {
  const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return new Date(ts).toLocaleDateString();
}

function toast(msg, bad = false) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `toast${bad ? ' toast--bad' : ''}`;
  el.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { el.hidden = true; }, 2600);
}

const tpl = (id) => document.getElementById(id).content.cloneNode(true);

/* ----------------------------------------------------------- auth view */
function renderAuth() {
  document.title = 'QuotesOGram';
  app.className = '';
  app.replaceChildren(tpl('tpl-auth'));

  const errorEl = app.querySelector('[data-error]');
  const show = (msg) => {
    errorEl.textContent = msg;
    errorEl.hidden = !msg;
  };

  app.querySelectorAll('.tab').forEach((tab) => {
    tab.onclick = () => {
      app.querySelectorAll('.tab').forEach((t) => t.classList.toggle('is-active', t === tab));
      app.querySelectorAll('[data-form]').forEach((f) => {
        f.hidden = f.dataset.form !== tab.dataset.mode;
      });
      show('');
    };
  });

  app.querySelectorAll('[data-form]').forEach((form) => {
    form.onsubmit = async (e) => {
      e.preventDefault();
      show('');
      const fd = Object.fromEntries(new FormData(form).entries());
      const btn = form.querySelector('button[type=submit]');
      btn.disabled = true;
      try {
        const payload =
          form.dataset.form === 'signup'
            ? { ...fd, isPrivate: form.querySelector('[name=isPrivate]').checked }
            : fd;
        const data = await api(`/${form.dataset.form}`, { method: 'POST', body: payload });
        token = data.token;
        localStorage.setItem(TOKEN_KEY, token);
        state.me = data.user;
        location.hash = data.suggestions ? '#/explore' : '#/feed';
        await boot();
        if (data.suggestions) toast(`Welcome, ${data.user.username}! Here are people to follow.`);
      } catch (err) {
        show(err.message);
      } finally {
        btn.disabled = false;
      }
    };
  });
}

/* -------------------------------------------------------------- shell */
function renderShell() {
  app.className = '';
  app.replaceChildren(tpl('tpl-shell'));

  app.querySelector('[data-action=signout]').onclick = async () => {
    try { await api('/signout', { method: 'POST' }); } catch {}
    signOutLocal();
  };

  const search = app.querySelector('[data-search]');
  search.onsubmit = (e) => {
    e.preventDefault();
    const q = new FormData(search).get('q').trim();
    location.hash = q ? `#/explore?q=${encodeURIComponent(q)}` : '#/explore';
  };

  app.addEventListener('click', onAction);
}

function signOutLocal() {
  token = '';
  state.me = null;
  localStorage.removeItem(TOKEN_KEY);
  clearInterval(chatTimer);
  location.hash = '';
  renderAuth();
}

function view() { return app.querySelector('[data-view]'); }

/** Swap in an empty container so an in-flight render of the previous
  * route paints into a detached node instead of over the new page. */
function freshView() {
  const current = view();
  const next = current.cloneNode(false);
  current.replaceWith(next);
  return next;
}

function setActiveNav(name) {
  app.querySelectorAll('[data-nav]').forEach((a) =>
    a.classList.toggle('is-active', a.dataset.nav === name));
}

async function refreshBadges() {
  try {
    const me = await api('/me');
    state.me = me.user;
    state.badges = me.badges;
  } catch { return; }
  for (const key of ['requests', 'unread']) {
    const el = app.querySelector(`[data-badge=${key}]`);
    if (!el) continue;
    el.textContent = state.badges[key];
    el.hidden = !state.badges[key];
  }
}

/* -------------------------------------------------------- render bits */
function postCard(p) {
  return `
  <article class="post card" data-post="${p.id}">
    <div class="post__head">
      <a class="avatar" href="#/u/${p.author.username}">${initial(p.author)}</a>
      <div class="post__who">
        <a href="#/u/${esc(p.author.username)}">${esc(p.author.username)}</a>
        <span class="post__time">${ago(p.createdAt)}${p.author.isPrivate ? ' &middot; private' : ''}</span>
      </div>
    </div>
    <p class="post__quote">${esc(p.quote)}</p>
    <div class="post__foot">
      <button class="like${p.likedByMe ? ' is-on' : ''}" data-action="like" data-id="${p.id}">
        ${p.likedByMe ? '&#9829;' : '&#9825;'} ${p.likes}
      </button>
      ${p.mine ? `<button class="btn btn--sm btn--ghost btn--danger post__del"
          data-action="delete-post" data-id="${p.id}">delete</button>` : ''}
    </div>
  </article>`;
}

function userRow(u, extra = '') {
  return `
  <div class="urow card">
    <a class="avatar avatar--sm" href="#/u/${esc(u.username)}">${initial(u)}</a>
    <div class="urow__who">
      <b><a href="#/u/${esc(u.username)}">${esc(u.username)}</a>
        ${u.isPrivate ? '<span class="lock">&#128274;</span>' : ''}</b>
      <small>${esc(u.name)}${u.mutuals ? ` &middot; ${u.mutuals} mutual` : ''}</small>
    </div>
    <div class="urow__act">${extra || followButton(u)}</div>
  </div>`;
}

function followButton(u) {
  if (u.relation === 'self' || u.username === state.me.username) return '';
  if (u.relation === 'following')
    return `<button class="btn btn--sm" data-action="unfollow" data-user="${esc(u.username)}">following</button>`;
  if (u.relation === 'requested')
    return `<button class="btn btn--sm" data-action="unfollow" data-user="${esc(u.username)}">requested</button>`;
  return `<button class="btn btn--sm btn--primary" data-action="follow" data-user="${esc(u.username)}">${
    u.isPrivate ? 'request' : 'follow'}</button>`;
}

const empty = (title, line) => `<div class="empty card"><b>${title}</b>${line || ''}</div>`;

/* --------------------------------------------------------------- views */
async function viewFeed(v) {
  setActiveNav('feed');
  v.innerHTML = `
    <section class="composer card">
      <textarea data-quote maxlength="280" placeholder="Share a quote worth keeping…"></textarea>
      <div class="composer__row">
        <button class="btn btn--primary" data-action="post">Post quote</button>
        <span class="composer__count" data-count>0/280</span>
      </div>
    </section>
    <div class="section-head"><h2>Your feed</h2>
      <span class="faint">posts from the people you follow</span></div>
    <div data-posts>${empty('loading…')}</div>`;

  const ta = v.querySelector('[data-quote]');
  ta.oninput = () => { v.querySelector('[data-count]').textContent = `${ta.value.length}/280`; };
  ta.onkeydown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') submitPost();
  };

  const { posts } = await api('/feed');
  v.querySelector('[data-posts]').innerHTML = posts.length
    ? posts.map(postCard).join('')
    : empty('Your feed is quiet.', 'Follow a few people from <a href="#/explore">Explore</a> — their quotes land here.');
}

async function viewRecent(v) {
  setActiveNav('recent');
  v.innerHTML = `
    <div class="section-head"><h2>Recent</h2>
      <span class="faint">last 24 hours, from your following only</span></div>
    <div data-posts>${empty('loading…')}</div>`;
  const { posts } = await api('/recent?hours=24');
  v.querySelector('[data-posts]').innerHTML = posts.length
    ? posts.map(postCard).join('')
    : empty('Nothing new today.', 'Nobody you follow has posted in the last 24 hours.');
}

async function viewExplore(v, query) {
  setActiveNav('explore');
  const q = query || '';
  const searchInput = app.querySelector('[data-search] input');
  if (searchInput) searchInput.value = q;

  v.innerHTML = `
    <div class="section-head"><h2>${q ? `Results for “${esc(q)}”` : 'Suggested for you'}</h2>
      <span class="faint">${q ? 'profiles' : 'people your circle follows'}</span></div>
    <div class="list" data-list>${empty('loading…')}</div>`;

  const { users } = q
    ? await api(`/users?q=${encodeURIComponent(q)}`)
    : await api('/suggestions');

  v.querySelector('[data-list]').innerHTML = users.length
    ? users.map((u) => userRow(u)).join('')
    : empty('No profiles found.', q ? 'Try another name.' : 'You already follow everyone here.');
}

async function viewRequests(v) {
  setActiveNav('requests');
  const { incoming, outgoing } = await api('/requests');
  v.innerHTML = `
    <div class="section-head"><h2>Follow requests</h2>
      <span class="faint">people asking to see your private account</span></div>
    <div class="list">${
      incoming.length
        ? incoming.map((r) =>
            userRow({ ...r.from, relation: 'none' },
              `<button class="btn btn--sm btn--primary" data-action="accept" data-id="${r.id}">accept</button>
               <button class="btn btn--sm btn--danger" data-action="reject" data-id="${r.id}">decline</button>`)).join('')
        : empty('No pending requests.', state.me.isPrivate
            ? 'When someone asks to follow you, they show up here.'
            : 'Your account is public, so people follow you directly.')
    }</div>
    <div class="section-head" style="margin-top:24px"><h2>Sent</h2>
      <span class="faint">waiting for approval</span></div>
    <div class="list">${
      outgoing.length
        ? outgoing.map((u) => userRow({ ...u, relation: 'requested' })).join('')
        : empty('No sent requests.')
    }</div>`;
  refreshBadges();
}

async function viewProfile(v, username, tab = 'posts') {
  const uname = username === 'me' ? state.me.username : username;
  setActiveNav(uname === state.me.username ? 'me' : null);

  const p = await api(`/profile/${encodeURIComponent(uname)}`);
  const me = p.relation === 'self';
  document.title = `${p.user.username} · QuotesOGram`;

  const actions = me
    ? `<a class="btn btn--sm" href="#/settings">edit profile</a>`
    : `${followButton({ ...p.user, relation: p.relation })}
       <button class="btn btn--sm" data-action="open-chat" data-user="${esc(p.user.username)}">message</button>`;

  v.innerHTML = `
    <section class="profile__head card">
      <div class="profile__top">
        <div class="avatar avatar--lg">${initial(p.user)}</div>
        <div class="profile__id">
          <h2>${esc(p.user.username)}
            <span class="pill ${p.user.isPrivate ? 'pill--private' : 'pill--ok'}">
              ${p.user.isPrivate ? '&#128274; private' : '&#127758; public'}</span>
            ${p.followsYou && !me ? '<span class="pill">follows you</span>' : ''}
          </h2>
          <p class="profile__bio">${esc(p.user.bio)}</p>
        </div>
      </div>
      <div class="stats">
        <button data-tab="posts"><b>${p.stats.posts}</b>posts</button>
        <button data-tab="followers"><b>${p.stats.followers}</b>followers</button>
        <button data-tab="following"><b>${p.stats.following}</b>following</button>
      </div>
      <div class="profile__actions">${actions}</div>
    </section>

    <div class="subtabs">
      <button data-tab="posts">1. Show posts</button>
      <button data-tab="followers">2. Show followers</button>
      <button data-tab="following">3. Show followings</button>
    </div>
    <div data-panel></div>`;

  const panel = v.querySelector('[data-panel]');
  const paint = (which) => {
    v.querySelectorAll('.subtabs button').forEach((b) =>
      b.classList.toggle('is-active', b.dataset.tab === which));

    if (!p.canView) {
      panel.innerHTML = `<div class="locked card"><i>&#128274;</i>
        <b>This account is private.</b>
        <span class="faint">Follow ${esc(p.user.username)} to see their posts, followers and following.</span>
        <div style="margin-top:10px">${followButton({ ...p.user, relation: p.relation })}</div></div>`;
      return;
    }
    if (which === 'posts') {
      panel.innerHTML = p.posts.length
        ? p.posts.map(postCard).join('')
        : empty('No quotes yet.', me ? 'Post your first one from the <a href="#/feed">feed</a>.' : '');
    } else {
      const people = which === 'followers' ? p.followers : p.following;
      panel.innerHTML = people.length
        ? `<div class="list">${people.map((u) =>
            userRow(u, me && which === 'followers'
              ? `${followButton(u)}<button class="btn btn--sm btn--ghost btn--danger"
                   data-action="remove-follower" data-user="${esc(u.username)}">remove</button>`
              : '')).join('')}</div>`
        : empty(which === 'followers' ? 'No followers yet.' : 'Not following anyone yet.');
    }
  };

  v.querySelectorAll('[data-tab]').forEach((b) => {
    b.onclick = () => paint(b.dataset.tab);
  });
  paint(tab);
}

async function viewChatList(v) {
  setActiveNav('chat');
  const { chats } = await api('/chats');
  v.innerHTML = `
    <div class="section-head"><h2>Chats</h2><span class="faint">direct messages</span></div>
    <div class="list">${
      chats.length
        ? chats.map((c) => userRow(c.user,
            `<button class="btn btn--sm" data-action="open-chat" data-user="${esc(c.user.username)}">
               open${c.unread ? ` (${c.unread})` : ''}</button>`)).join('')
        : empty('No conversations yet.', 'Open a profile and hit <b>message</b> to start one.')
    }</div>`;
  refreshBadges();
}

async function viewChat(v, username) {
  setActiveNav('chat');
  const load = async (silent) => {
    const data = await api(`/chats/${encodeURIComponent(username)}`);
    const body = v.querySelector('[data-thread]');
    const atBottom = !body || body.scrollHeight - body.scrollTop - body.clientHeight < 60;

    if (!body) {
      v.innerHTML = `
        <section class="chat card">
          <div class="chat__head">
            <a class="avatar avatar--sm" href="#/u/${esc(data.user.username)}">${initial(data.user)}</a>
            <div class="post__who">
              <a href="#/u/${esc(data.user.username)}">${esc(data.user.username)}</a>
              <span class="post__time">${esc(data.user.name)}</span>
            </div>
            <a class="btn btn--sm btn--ghost" href="#/chat" style="margin-left:auto">all chats</a>
          </div>
          <div class="chat__body" data-thread></div>
          <form class="chat__form" data-send>
            <input name="text" placeholder="Write a message…" autocomplete="off" maxlength="500">
            <button class="btn btn--primary btn--sm" type="submit">Send</button>
          </form>
        </section>`;
      const form = v.querySelector('[data-send]');
      form.onsubmit = async (e) => {
        e.preventDefault();
        const input = form.querySelector('input');
        const text = input.value.trim();
        if (!text) return;
        input.value = '';
        try {
          await api(`/chats/${encodeURIComponent(username)}`, { method: 'POST', body: { text } });
          await load(true);
        } catch (err) { toast(err.message, true); }
      };
      form.querySelector('input').focus();
    }

    const thread = v.querySelector('[data-thread]');
    thread.innerHTML = data.messages.length
      ? data.messages.map((m) => `
          <div class="bubble${m.mine ? ' bubble--mine' : ''}">${esc(m.text)}
            <time>${ago(m.createdAt)}</time></div>`).join('')
      : `<p class="empty">Say something to ${esc(data.user.username)}.</p>`;
    if (atBottom || !silent) thread.scrollTop = thread.scrollHeight;
  };

  await load(false);
  clearInterval(chatTimer);
  chatTimer = setInterval(() => {
    if (location.hash.startsWith('#/chat/')) load(true).catch(() => {});
    else clearInterval(chatTimer);
  }, 4000);
}

async function viewSettings(v) {
  setActiveNav('me');
  const me = state.me;
  v.innerHTML = `
    <div class="section-head"><h2>Edit profile</h2><span class="faint">@${esc(me.username)}</span></div>
    <form class="settings card form" data-settings>
      <label>Display name<input name="name" value="${esc(me.name)}"></label>
      <label>Bio<input name="bio" value="${esc(me.bio)}"></label>
      <label class="switch">
        <input type="checkbox" name="isPrivate" ${me.isPrivate ? 'checked' : ''}>
        <span><strong>Private account</strong>
          <small>Only accepted followers see your posts, followers and following.
            Switching back to public accepts everyone currently waiting.</small></span>
      </label>
      <button class="btn btn--primary" type="submit">Save changes</button>
    </form>`;

  v.querySelector('[data-settings]').onsubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    try {
      const { user } = await api('/me', {
        method: 'PATCH',
        body: {
          name: form.name.value,
          bio: form.bio.value,
          isPrivate: form.isPrivate.checked
        }
      });
      state.me = user;
      toast('Profile updated.');
      location.hash = '#/me';
    } catch (err) { toast(err.message, true); }
  };
}

/* ------------------------------------------------------------- actions */
async function submitPost() {
  const ta = view().querySelector('[data-quote]');
  const quote = ta.value.trim();
  if (!quote) return toast('Write something first.', true);
  try {
    await api('/posts', { method: 'POST', body: { quote } });
    ta.value = '';
    view().querySelector('[data-count]').textContent = '0/280';
    toast('Quote posted.');
    route();
  } catch (err) { toast(err.message, true); }
}

async function onAction(e) {
  const btn = e.target.closest('[data-action]');
  if (!btn || btn.dataset.action === 'signout') return;
  const { action, id, user } = btn.dataset;
  btn.disabled = true;
  try {
    if (action === 'post') return await submitPost();
    if (action === 'open-chat') return void (location.hash = `#/chat/${user}`);

    if (action === 'like') {
      const { post } = await api(`/posts/${id}/like`, { method: 'POST' });
      btn.classList.toggle('is-on', post.likedByMe);
      btn.innerHTML = `${post.likedByMe ? '&#9829;' : '&#9825;'} ${post.likes}`;
      return;
    }
    if (action === 'delete-post') {
      if (!confirm('Delete this quote?')) return;
      await api(`/posts/${id}`, { method: 'DELETE' });
      document.querySelector(`[data-post="${id}"]`)?.remove();
      return toast('Post deleted.');
    }
    if (action === 'follow') {
      const { status } = await api(`/follow/${user}`, { method: 'POST' });
      toast(status === 'requested' ? `Follow request sent to ${user}.` : `You now follow ${user}.`);
      return route();
    }
    if (action === 'unfollow') {
      await api(`/unfollow/${user}`, { method: 'POST' });
      toast(`Unfollowed ${user}.`);
      return route();
    }
    if (action === 'remove-follower') {
      await api(`/remove-follower/${user}`, { method: 'POST' });
      toast(`${user} removed from your followers.`);
      return route();
    }
    if (action === 'accept' || action === 'reject') {
      await api(`/requests/${id}/${action}`, { method: 'POST' });
      toast(action === 'accept' ? 'Request accepted.' : 'Request declined.');
      return route();
    }
  } catch (err) {
    toast(err.message, true);
  } finally {
    btn.disabled = false;
  }
}

/* ------------------------------------------------------------- routing */
function parseHash() {
  const raw = location.hash.replace(/^#\/?/, '');
  const [path, qs] = raw.split('?');
  return { parts: path.split('/').filter(Boolean), query: new URLSearchParams(qs || '') };
}

async function route() {
  if (!state.me) return;
  if (!app.querySelector('[data-view]')) renderShell();
  if (!location.hash.startsWith('#/chat/')) clearInterval(chatTimer);
  if (!location.hash.startsWith('#/demo') && window.Demo) window.Demo.pause();

  const { parts, query } = parseHash();
  const [head, arg] = parts;
  document.title = 'QuotesOGram';
  window.scrollTo({ top: 0 });
  // the demo diagrams want more room than the feed does
  app.querySelector('.shell')?.classList.toggle('is-wide', head === 'demo');
  const v = freshView();

  try {
    switch (head) {
      case 'recent': await viewRecent(v); break;
      case 'explore': await viewExplore(v, query.get('q')); break;
      case 'requests': await viewRequests(v); break;
      case 'settings': await viewSettings(v); break;
      case 'chat': arg ? await viewChat(v, arg) : await viewChatList(v); break;
      case 'demo': setActiveNav('demo'); await window.Demo.render(v, arg); break;
      case 'me': await viewProfile(v, 'me'); break;
      case 'u': arg ? await viewProfile(v, arg) : await viewExplore(v); break;
      default: await viewFeed(v);
    }
  } catch (err) {
    v.innerHTML = empty('Could not load this page.', esc(err.message));
  }
  refreshBadges();
}

/* ---------------------------------------------------------------- boot */
async function boot() {
  if (!token) return renderAuth();
  try {
    const me = await api('/me');
    state.me = me.user;
    state.badges = me.badges;
  } catch {
    return signOutLocal();
  }
  renderShell();
  if (!location.hash) location.hash = '#/feed';
  await route();
}

window.addEventListener('hashchange', route);
setInterval(() => { if (state.me) refreshBadges(); }, 15000);
boot();
