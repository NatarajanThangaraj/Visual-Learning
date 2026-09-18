/* QuotesOGram — the console build's backend, running inside the browser.
   ---------------------------------------------------------------------
   The Visual Learning site is static hosting: there is no Node process to
   answer /api calls. So the server's own modules run here instead, pasted in
   unchanged — store.js, authOperations.js, quotesOgram.js, authentication.js,
   api.js, seed.js and demo.js are byte-for-byte the files from src/.

   Exactly two things could not come along, and both are replaced below:

     * FileHandling  — read()/write() hit the disk. Here they hit localStorage,
                       so each learner gets their own copy of the data, seeded
                       with the same demo accounts. Clearing site data resets it.
     * crypto        — scryptSync/randomBytes/timingSafeEqual are Node's. The
                       stand-in keeps the same shape (salt + slow digest) but is
                       NOT real password security. These are six fake accounts
                       that all share the password 'quotes123' and never leave
                       this browser; do not reuse this hash anywhere real.

   Everything above those two layers is the assignment's design, untouched:
     Main → Authentication → AuthenticateOperations → QuotesOgram → FileHandling
*/
(function () {
'use strict';

/* ------------------------------------------------ a three-line module system
   so the src/ files can keep their require()/module.exports exactly as they
   are on the server. */
const modules = {};
const loaded = {};
function define(name, factory) { modules[name] = factory; }
function require(name) {
  if (loaded[name]) return loaded[name].exports;
  if (!modules[name]) throw new Error('No module "' + name + '"');
  const module = loaded[name] = { exports: {} };
  modules[name](require, module, module.exports);
  return module.exports;
}

/* Buffer, only as much of it as authOperations.js asks for. */
const Buffer = {
  from(hex) {
    const s = String(hex);
    const out = new Uint8Array(Math.floor(s.length / 2));
    for (let i = 0; i < out.length; i++) out[i] = parseInt(s.substr(i * 2, 2), 16);
    return out;
  }
};

define('./fileHandling', function (require, module, exports) {
  /**
   * FileHandling — the browser build.
   *
   * The only layer that touches storage. Everything above it (QuotesOgram,
   * AuthenticateOperations, Authentication) still goes through read()/write();
   * the disk underneath is localStorage, private to this browser.
   */

  const DB_FILE = 'quotesogram.lab.db';

  const EMPTY_DB = {
    users: [],
    posts: [],
    follows: [],      // { followerId, followeeId, createdAt }
    requests: [],     // { id, fromId, toId, status, createdAt }
    messages: [],     // { id, fromId, toId, text, createdAt }
    sessions: {},     // token -> userId
    counters: { user: 0, post: 0, request: 0, message: 0 }
  };

  /* Private windows and blocked site data make localStorage throw on touch,
     which would take the whole lab down. Fall back to a plain object: the app
     works for the session and simply forgets afterwards. */
  let memory = null;
  function shelf() {
    if (memory) return memory;
    try {
      const probe = '__qog__';
      localStorage.setItem(probe, '1');
      localStorage.removeItem(probe);
      return localStorage;
    } catch (err) {
      console.warn('[FileHandling] storage unavailable, keeping data in memory only.');
      const bag = {};
      memory = {
        getItem: (k) => (k in bag ? bag[k] : null),
        setItem: (k, v) => { bag[k] = String(v); },
        removeItem: (k) => { delete bag[k]; }
      };
      return memory;
    }
  }

  /** read() – load the whole database. */
  function read() {
    try {
      const raw = (shelf().getItem(DB_FILE) || '').trim();
      if (!raw) return structuredClone(EMPTY_DB);
      return { ...structuredClone(EMPTY_DB), ...JSON.parse(raw) };
    } catch (err) {
      console.error('[FileHandling] saved data unreadable, starting fresh:', err.message);
      return structuredClone(EMPTY_DB);
    }
  }

  /** write() – persist the whole database. */
  function write(db) {
    try {
      shelf().setItem(DB_FILE, JSON.stringify(db));
    } catch (err) {
      console.error('[FileHandling] could not save:', err.message);
    }
    return db;
  }

  function wipe() {
    try { shelf().removeItem(DB_FILE); } catch (err) { /* nothing to wipe */ }
  }

  module.exports = { read, write, wipe, DB_FILE, EMPTY_DB };
});

define('crypto', function (require, module, exports) {
  /* A stand-in for Node's crypto — same three calls, browser parts.
     scryptSync is a deliberately repetitive FNV-1a mix rather than real scrypt:
     enough to keep salts and digests behaving the same way, not enough to
     protect a password that matters. See the note at the top of this file. */

  function hex(bytes) {
    return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  }

  /* toString('hex') is how every caller uses these, so hand back something
     that answers exactly that. */
  function digest(hexString) {
    return { toString: () => hexString, length: hexString.length / 2 };
  }

  function randomBytes(size) {
    const bytes = new Uint8Array(size);
    (self.crypto || self.msCrypto).getRandomValues(bytes);
    return digest(hex(bytes));
  }

  function scryptSync(password, salt, keylen) {
    const lanes = new Uint32Array(Math.max(1, keylen >> 2));
    for (let i = 0; i < lanes.length; i++) {
      lanes[i] = (0x811c9dc5 ^ Math.imul(i + 1, 0x9e3779b9)) >>> 0;
    }
    const seed = String(salt) + '|' + String(password);
    for (let round = 0; round < 600; round++) {
      const s = seed + ':' + round;
      for (let i = 0; i < s.length; i++) {
        const c = s.charCodeAt(i);
        for (let l = 0; l < lanes.length; l++) {
          const mixed = Math.imul(lanes[l] ^ (c + l + round), 0x01000193) >>> 0;
          lanes[l] = ((mixed << 13) | (mixed >>> 19)) >>> 0;
        }
      }
    }
    return digest(hex(new Uint8Array(lanes.buffer)));
  }

  function timingSafeEqual(a, b) {
    let diff = a.length ^ b.length;
    for (let i = 0; i < Math.min(a.length, b.length); i++) diff |= a[i] ^ b[i];
    return diff === 0;
  }

  module.exports = { randomBytes, scryptSync, timingSafeEqual };
});

define('./store', function (require, module, exports) {
  'use strict';

  /**
   * Store – a thin in-memory cache over FileHandling so the rest of the app
   * never has to think about when to read or write the file.
   */

  const fileHandling = require('./fileHandling');

  let db = fileHandling.read();

  const store = {
    get data() {
      return db;
    },
    save() {
      fileHandling.write(db);
      return db;
    },
    reload() {
      db = fileHandling.read();
      return db;
    },
    nextId(kind) {
      db.counters[kind] = (db.counters[kind] || 0) + 1;
      return `${kind}_${db.counters[kind]}`;
    }
  };

  module.exports = store;
});

define('./authOperations', function (require, module, exports) {
  'use strict';

  /**
   * AuthenticateOperations
   * ----------------------
   * createUser() / getUserDetails() – the user record + credential mechanics.
   */

  const crypto = require('crypto');
  const store = require('./store');

  const USERNAME_RE = /^[a-z0-9_.]{3,20}$/;

  function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return { salt, hash };
  }

  function verifyPassword(password, salt, expectedHash) {
    const { hash } = hashPassword(password, salt);
    const a = Buffer.from(hash, 'hex');
    const b = Buffer.from(expectedHash, 'hex');
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  }

  /** getUserDetails() – by username (case-insensitive) or by id. */
  function getUserDetails(usernameOrId) {
    if (!usernameOrId) return null;
    const key = String(usernameOrId).toLowerCase();
    return (
      store.data.users.find((u) => u.username.toLowerCase() === key) ||
      store.data.users.find((u) => u.id === usernameOrId) ||
      null
    );
  }

  /** createUser() – validates, hashes the password and persists the profile. */
  function createUser({ username, password, name, bio, isPrivate }) {
    const uname = String(username || '').trim().toLowerCase();
    if (!USERNAME_RE.test(uname)) {
      throw httpError(400, 'Username must be 3-20 chars: a-z, 0-9, dot or underscore.');
    }
    if (String(password || '').length < 4) {
      throw httpError(400, 'Password must be at least 4 characters.');
    }
    if (getUserDetails(uname)) {
      throw httpError(409, `Username "${uname}" is already taken.`);
    }

    const { salt, hash } = hashPassword(String(password));
    const user = {
      id: store.nextId('user'),
      username: uname,
      name: String(name || '').trim() || uname,
      bio: String(bio || '').trim() || 'Live & let live',
      isPrivate: Boolean(isPrivate),
      salt,
      hash,
      createdAt: Date.now()
    };
    store.data.users.push(user);
    store.save();
    return user;
  }

  function createSession(user) {
    const token = crypto.randomBytes(24).toString('hex');
    store.data.sessions[token] = user.id;
    store.save();
    return token;
  }

  function destroySession(token) {
    if (token && store.data.sessions[token]) {
      delete store.data.sessions[token];
      store.save();
    }
  }

  function userFromToken(token) {
    const userId = token && store.data.sessions[token];
    if (!userId) return null;
    return store.data.users.find((u) => u.id === userId) || null;
  }

  function httpError(status, message) {
    const err = new Error(message);
    err.status = status;
    return err;
  }

  module.exports = {
    createUser,
    getUserDetails,
    verifyPassword,
    hashPassword,
    createSession,
    destroySession,
    userFromToken,
    httpError
  };
});

define('./quotesOgram', function (require, module, exports) {
  'use strict';

  /**
   * QuotesOgram
   * -----------
   * The domain layer: profiles, the social graph, privacy, posts, feed, chat.
   */

  const store = require('./store');
  const { getUserDetails, httpError } = require('./authOperations');

  /* ------------------------------------------------------------------ users */

  function createProfile(user) {
    // The profile fields already live on the user record; this hook exists so
    // onboarding has one obvious place to grow (avatars, themes, ...).
    if (!user.bio) user.bio = 'Live & let live';
    store.save();
    return user;
  }

  function publicUser(user) {
    if (!user) return null;
    return {
      id: user.id,
      username: user.username,
      name: user.name,
      bio: user.bio,
      isPrivate: user.isPrivate,
      createdAt: user.createdAt
    };
  }

  function requireUser(usernameOrId) {
    const user = getUserDetails(usernameOrId);
    if (!user) throw httpError(404, 'No such user.');
    return user;
  }

  function updateSettings(user, { name, bio, isPrivate }) {
    if (name !== undefined) user.name = String(name).trim() || user.username;
    if (bio !== undefined) user.bio = String(bio).trim() || 'Live & let live';
    if (isPrivate !== undefined) {
      const wasPrivate = user.isPrivate;
      user.isPrivate = Boolean(isPrivate);
      // Going public accepts everyone who was waiting in line.
      if (wasPrivate && !user.isPrivate) {
        store.data.requests
          .filter((r) => r.toId === user.id && r.status === 'pending')
          .forEach((r) => {
            r.status = 'accepted';
            addFollow(r.fromId, user.id);
          });
      }
    }
    store.save();
    return publicUser(user);
  }

  /* ---------------------------------------------------------- social graph */

  function isFollowing(followerId, followeeId) {
    return store.data.follows.some(
      (f) => f.followerId === followerId && f.followeeId === followeeId
    );
  }

  function pendingRequest(fromId, toId) {
    return store.data.requests.find(
      (r) => r.fromId === fromId && r.toId === toId && r.status === 'pending'
    );
  }

  function addFollow(followerId, followeeId) {
    if (followerId === followeeId) return;
    if (isFollowing(followerId, followeeId)) return;
    store.data.follows.push({ followerId, followeeId, createdAt: Date.now() });
  }

  function followerIds(userId) {
    return store.data.follows.filter((f) => f.followeeId === userId).map((f) => f.followerId);
  }

  function followingIds(userId) {
    return store.data.follows.filter((f) => f.followerId === userId).map((f) => f.followeeId);
  }

  /** Can `viewer` see the posts / followers / following of `target`? */
  function canView(viewer, target) {
    if (!target) return false;
    if (viewer && viewer.id === target.id) return true;
    if (!target.isPrivate) return true;
    return Boolean(viewer && isFollowing(viewer.id, target.id));
  }

  /** relation: self | following | requested | none */
  function relationTo(viewer, target) {
    if (!viewer || viewer.id === target.id) return 'self';
    if (isFollowing(viewer.id, target.id)) return 'following';
    if (pendingRequest(viewer.id, target.id)) return 'requested';
    return 'none';
  }

  /** follow() – instant for public accounts, a request for private ones. */
  function follow(viewer, username) {
    const target = requireUser(username);
    if (target.id === viewer.id) throw httpError(400, 'You cannot follow yourself.');
    if (isFollowing(viewer.id, target.id)) return { status: 'following' };

    if (target.isPrivate) {
      if (pendingRequest(viewer.id, target.id)) return { status: 'requested' };
      store.data.requests.push({
        id: store.nextId('request'),
        fromId: viewer.id,
        toId: target.id,
        status: 'pending',
        createdAt: Date.now()
      });
      store.save();
      return { status: 'requested' };
    }

    addFollow(viewer.id, target.id);
    store.save();
    return { status: 'following' };
  }

  /** unfollow() – also cancels a pending request, which is what users expect. */
  function unfollow(viewer, username) {
    const target = requireUser(username);
    store.data.follows = store.data.follows.filter(
      (f) => !(f.followerId === viewer.id && f.followeeId === target.id)
    );
    store.data.requests
      .filter((r) => r.fromId === viewer.id && r.toId === target.id && r.status === 'pending')
      .forEach((r) => { r.status = 'cancelled'; });
    store.save();
    return { status: 'none' };
  }

  /** removeFollower() – kick someone out of your followers list. */
  function removeFollower(user, username) {
    const other = requireUser(username);
    store.data.follows = store.data.follows.filter(
      (f) => !(f.followerId === other.id && f.followeeId === user.id)
    );
    store.save();
    return { ok: true };
  }

  /* ------------------------------------------------------------- requests */

  function incomingRequests(user) {
    return store.data.requests
      .filter((r) => r.toId === user.id && r.status === 'pending')
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((r) => {
        const from = store.data.users.find((u) => u.id === r.fromId);
        return { id: r.id, createdAt: r.createdAt, from: publicUser(from) };
      })
      .filter((r) => r.from);
  }

  function outgoingRequests(user) {
    return store.data.requests
      .filter((r) => r.fromId === user.id && r.status === 'pending')
      .map((r) => publicUser(store.data.users.find((u) => u.id === r.toId)))
      .filter(Boolean);
  }

  function answerRequest(user, requestId, accept) {
    const req = store.data.requests.find((r) => r.id === requestId && r.toId === user.id);
    if (!req || req.status !== 'pending') throw httpError(404, 'Request not found.');
    req.status = accept ? 'accepted' : 'rejected';
    if (accept) addFollow(req.fromId, user.id);
    store.save();
    return { ok: true, status: req.status };
  }

  /* ---------------------------------------------------------------- posts */

  function createPost(user, quote) {
    const text = String(quote || '').trim();
    if (!text) throw httpError(400, 'A quote cannot be empty.');
    if (text.length > 280) throw httpError(400, 'Keep it under 280 characters.');
    const post = {
      id: store.nextId('post'),
      userId: user.id,
      quote: text,
      likes: [],
      createdAt: Date.now()
    };
    store.data.posts.push(post);
    store.save();
    return decoratePost(post, user);
  }

  function deletePost(user, postId) {
    const post = store.data.posts.find((p) => p.id === postId);
    if (!post) throw httpError(404, 'Post not found.');
    if (post.userId !== user.id) throw httpError(403, 'That is not your post.');
    store.data.posts = store.data.posts.filter((p) => p.id !== postId);
    store.save();
    return { ok: true };
  }

  function toggleLike(user, postId) {
    const post = store.data.posts.find((p) => p.id === postId);
    if (!post) throw httpError(404, 'Post not found.');
    const author = store.data.users.find((u) => u.id === post.userId);
    if (!canView(user, author)) throw httpError(403, 'This account is private.');
    post.likes = post.likes || [];
    const i = post.likes.indexOf(user.id);
    if (i === -1) post.likes.push(user.id); else post.likes.splice(i, 1);
    store.save();
    return decoratePost(post, author, user);
  }

  function decoratePost(post, author, viewer) {
    const user = author || store.data.users.find((u) => u.id === post.userId);
    const likes = post.likes || [];
    return {
      id: post.id,
      quote: post.quote,
      createdAt: post.createdAt,
      likes: likes.length,
      likedByMe: Boolean(viewer && likes.includes(viewer.id)),
      mine: Boolean(viewer && viewer.id === post.userId),
      author: publicUser(user)
    };
  }

  function postsOf(userId) {
    return store.data.posts.filter((p) => p.userId === userId);
  }

  function myPosts(user) {
    return postsOf(user.id)
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((p) => decoratePost(p, user, user));
  }

  /** feed() – posts from the people you follow, newest first (plus your own). */
  function feed(user, { limit = 50 } = {}) {
    const ids = new Set([...followingIds(user.id), user.id]);
    return store.data.posts
      .filter((p) => ids.has(p.userId))
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit)
      .map((p) => decoratePost(p, null, user));
  }

  /** Phase 5 – "recent" = last 24h from the people you follow. */
  function recentFromFollowing(user, { hours = 24, limit = 30 } = {}) {
    const since = Date.now() - hours * 3600 * 1000;
    const ids = new Set(followingIds(user.id));
    return store.data.posts
      .filter((p) => ids.has(p.userId) && p.createdAt >= since)
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit)
      .map((p) => decoratePost(p, null, user));
  }

  /* -------------------------------------------------------------- profile */

  function stats(userId) {
    return {
      posts: postsOf(userId).length,
      followers: followerIds(userId).length,
      following: followingIds(userId).length
    };
  }

  function profileView(viewer, username) {
    const target = requireUser(username);
    const visible = canView(viewer, target);
    return {
      user: publicUser(target),
      stats: stats(target.id),
      relation: relationTo(viewer, target),
      canView: visible,
      followsYou: viewer ? isFollowing(target.id, viewer.id) : false,
      posts: visible
        ? postsOf(target.id).sort((a, b) => b.createdAt - a.createdAt)
            .map((p) => decoratePost(p, target, viewer))
        : [],
      followers: visible ? followerIds(target.id).map(briefFor(viewer)).filter(Boolean) : [],
      following: visible ? followingIds(target.id).map(briefFor(viewer)).filter(Boolean) : []
    };
  }

  function briefFor(viewer) {
    return (id) => {
      const u = store.data.users.find((x) => x.id === id);
      if (!u) return null;
      return { ...publicUser(u), relation: viewer ? relationTo(viewer, u) : 'none' };
    };
  }

  /* ---------------------------------------------------- suggestions/search */

  /**
   * suggestUsers() – friends-of-friends first (how many people you follow also
   * follow them), then the most active accounts, then everybody else.
   */
  function suggestUsers(user, limit = 6) {
    const following = new Set(followingIds(user.id));
    const requested = new Set(
      store.data.requests
        .filter((r) => r.fromId === user.id && r.status === 'pending')
        .map((r) => r.toId)
    );

    const mutualScore = new Map();
    following.forEach((fid) => {
      followingIds(fid).forEach((id) => {
        if (id === user.id || following.has(id)) return;
        mutualScore.set(id, (mutualScore.get(id) || 0) + 1);
      });
    });

    return store.data.users
      .filter((u) => u.id !== user.id && !following.has(u.id))
      .map((u) => ({
        ...publicUser(u),
        relation: requested.has(u.id) ? 'requested' : 'none',
        mutuals: mutualScore.get(u.id) || 0,
        stats: stats(u.id)
      }))
      .sort(
        (a, b) =>
          b.mutuals - a.mutuals ||
          b.stats.followers - a.stats.followers ||
          b.stats.posts - a.stats.posts ||
          a.username.localeCompare(b.username)
      )
      .slice(0, limit);
  }

  function searchUsers(viewer, query, limit = 25) {
    const q = String(query || '').trim().toLowerCase();
    return store.data.users
      .filter((u) => !viewer || u.id !== viewer.id)
      .filter((u) => !q || u.username.includes(q) || u.name.toLowerCase().includes(q))
      .map((u) => ({
        ...publicUser(u),
        relation: viewer ? relationTo(viewer, u) : 'none',
        stats: stats(u.id)
      }))
      .sort((a, b) => b.stats.followers - a.stats.followers || a.username.localeCompare(b.username))
      .slice(0, limit);
  }

  /* ----------------------------------------------------------------- chat */

  function conversations(user) {
    const byPartner = new Map();
    store.data.messages
      .filter((m) => m.fromId === user.id || m.toId === user.id)
      .sort((a, b) => a.createdAt - b.createdAt)
      .forEach((m) => {
        const partnerId = m.fromId === user.id ? m.toId : m.fromId;
        byPartner.set(partnerId, m);
      });

    return [...byPartner.entries()]
      .map(([partnerId, last]) => {
        const partner = store.data.users.find((u) => u.id === partnerId);
        if (!partner) return null;
        return {
          user: publicUser(partner),
          lastMessage: { text: last.text, createdAt: last.createdAt, mine: last.fromId === user.id },
          unread: store.data.messages.filter(
            (m) => m.fromId === partnerId && m.toId === user.id && !m.readAt
          ).length
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.lastMessage.createdAt - a.lastMessage.createdAt);
  }

  function messagesWith(user, username, { markRead = true } = {}) {
    const other = requireUser(username);
    const thread = store.data.messages
      .filter(
        (m) =>
          (m.fromId === user.id && m.toId === other.id) ||
          (m.fromId === other.id && m.toId === user.id)
      )
      .sort((a, b) => a.createdAt - b.createdAt)
      .map((m) => ({
        id: m.id,
        text: m.text,
        createdAt: m.createdAt,
        mine: m.fromId === user.id
      }));

    if (markRead) {
      let touched = false;
      store.data.messages.forEach((m) => {
        if (m.fromId === other.id && m.toId === user.id && !m.readAt) {
          m.readAt = Date.now();
          touched = true;
        }
      });
      if (touched) store.save();
    }

    return { user: publicUser(other), messages: thread };
  }

  function sendMessage(user, username, text) {
    const other = requireUser(username);
    const body = String(text || '').trim();
    if (!body) throw httpError(400, 'Message cannot be empty.');
    if (body.length > 500) throw httpError(400, 'Message too long (500 max).');
    if (other.id === user.id) throw httpError(400, 'You cannot message yourself.');

    const message = {
      id: store.nextId('message'),
      fromId: user.id,
      toId: other.id,
      text: body,
      createdAt: Date.now(),
      readAt: null
    };
    store.data.messages.push(message);
    store.save();
    return { id: message.id, text: body, createdAt: message.createdAt, mine: true };
  }

  /* --------------------------------------------------------------- badges */

  function badges(user) {
    return {
      requests: incomingRequests(user).length,
      unread: store.data.messages.filter((m) => m.toId === user.id && !m.readAt).length
    };
  }

  module.exports = {
    createProfile, publicUser, updateSettings, requireUser,
    follow, unfollow, removeFollower, isFollowing, canView, relationTo,
    incomingRequests, outgoingRequests, answerRequest,
    createPost, deletePost, toggleLike, myPosts, feed, recentFromFollowing,
    profileView, stats, suggestUsers, searchUsers,
    conversations, messagesWith, sendMessage, badges
  };
});

define('./authentication', function (require, module, exports) {
  'use strict';

  /**
   * Authentication
   * --------------
   * signUp() / signIn() – the two doors into QuotesOGram.
   */

  const ops = require('./authOperations');
  const quotesOgram = require('./quotesOgram');

  /** signUp() – create the user, its profile, and hand back login + suggestions. */
  function signUp({ username, password, name, bio, isPrivate }) {
    const user = ops.createUser({ username, password, name, bio, isPrivate });
    quotesOgram.createProfile(user);
    const token = ops.createSession(user);
    return {
      token,
      user: quotesOgram.publicUser(user),
      suggestions: quotesOgram.suggestUsers(user, 6)
    };
  }

  /** signIn() – verify credentials and hand back a session. */
  function signIn({ username, password }) {
    const user = ops.getUserDetails(String(username || '').trim().toLowerCase());
    if (!user || !ops.verifyPassword(String(password || ''), user.salt, user.hash)) {
      throw ops.httpError(401, 'Wrong username or password.');
    }
    return { token: ops.createSession(user), user: quotesOgram.publicUser(user) };
  }

  /** signOut() – drop the session token. */
  function signOut(token) {
    ops.destroySession(token);
    return { ok: true };
  }

  module.exports = { signUp, signIn, signOut };
});

define('./demo', function (require, module, exports) {
  'use strict';

  /**
   * Demo
   * ----
   * Flow diagrams for the console build of QuotesOGram: which class calls which,
   * what travels along each arrow, and in what order.
   *
   * A flow is a small graph:
   *   nodes  - boxes placed on a row/col grid
   *   edges  - labelled arrows between boxes
   *   steps  - the order the diagram lights up, with the explanation for each
   */

  /* ------------------------------------------------------------- builders */

  const node = (id, label, opts = {}) => ({
    id,
    label,
    kind: 'method',      // class | method | data | file
    ...opts
  });

  const edge = (from, to, label = '', opts = {}) => ({ id: `${from}>${to}`, from, to, label, ...opts });

  const step = (focus, title, text) => ({
    focus: Array.isArray(focus) ? focus : [focus],
    title,
    text
  });

  /* ----------------------------------------------------------------- flows */

  const FLOWS = [
    /* ============================================================ SIGN UP */
    {
      id: 'sign-up',
      group: 'Authentication',
      name: 'signUp()',
      title: 'Sign Up',
      subtitle: 'Main → Authentication.signUp() → createUser() → createProfile() → write()',
      nodes: [
        node('main', 'Main.java', { kind: 'class', row: 0, col: 1, sub: 'menu loop · Scanner' }),
        node('auth', 'Authentication.java', { kind: 'class', row: 1, col: 1, methods: ['signUp()'] }),
        node('createUser', 'createUser()', { row: 2, col: 1, sub: 'Operations.java' }),
        node('users', 'ArrayList<User>', { kind: 'data', row: 3, col: 0 }),
        node('profile', 'createProfile()', { row: 3, col: 2, sub: 'QuotesOgram.java',
          note: 'bio · public / private' }),
        node('file', 'write()', { kind: 'file', row: 4, col: 1, sub: 'FileHandling.java' })
      ],
      edges: [
        edge('main', 'auth', 'option 2 → username, password'),
        edge('auth', 'createUser', 'validate, then build the User'),
        edge('createUser', 'users', 'add(user)'),
        edge('createUser', 'profile', 'Go with User Object'),
        edge('profile', 'file', 'save the list'),
        edge('users', 'file', '', { dashed: true })
      ],
      steps: [
        step('main', 'Main reads the form',
          'Main prints the first menu, reads username, password, bio and the public/private ' +
          'answer from the Scanner. It never decides whether any of it is valid.'),
        step('main>auth', 'Main hands over',
          'The strings go straight to Authentication.signUp(). Main does not look inside the ' +
          'user list — that is not its job.'),
        step('auth', 'Authentication.signUp()',
          'The entry point for a brand new account. It owns the rule "you must not already exist" ' +
          'and then delegates the actual record creation.'),
        step(['auth>createUser', 'createUser'], 'createUser() builds the User',
          'Checks the username shape, checks the password length, checks nobody has taken the ' +
          'name — then creates the User object with a fresh id.'),
        step(['createUser>users', 'users'], 'The user joins the list',
          'ArrayList<User> is the in-memory database. Every later sign-in searches this same list.'),
        step(['createUser>profile', 'profile'], 'Go with User Object',
          'The new User object travels to QuotesOgram.createProfile(), which attaches the bio and ' +
          'the public/private flag. From here on, every call carries this object.'),
        step(['profile>file', 'file'], 'FileHandling.write()',
          'One class, one job: serialise the lists to the file. Nothing above it opens a stream.')
      ]
    },

    /* ============================================================ SIGN IN */
    {
      id: 'sign-in',
      group: 'Authentication',
      name: 'signIn()',
      title: 'Sign In',
      subtitle: 'Main → Authentication.signIn() → getUserDetails() → checkTheUser() → User object',
      nodes: [
        node('main', 'Main.java', { kind: 'class', row: 0, col: 1, sub: 'menu loop · Scanner' }),
        node('auth', 'Authentication.java', { kind: 'class', row: 1, col: 1, methods: ['signIn()'] }),
        node('get', 'getUserDetails()', { row: 2, col: 1, sub: 'Operations.java' }),
        node('users', 'ArrayList<User>', { kind: 'data', row: 2, col: 0 }),
        node('check', 'checkTheUser()', { row: 3, col: 1, sub: 'Operations.java',
          note: 'compare the password' }),
        node('current', 'User object', { kind: 'data', row: 4, col: 1,
          note: 'Main keeps it as currentUser' })
      ],
      edges: [
        edge('main', 'auth', 'option 1 → username, password'),
        edge('auth', 'get', 'who is this?'),
        edge('get', 'users', 'search by username', { dashed: true }),
        edge('get', 'check', 'the stored User'),
        edge('check', 'current', 'success')
      ],
      steps: [
        step('main', 'Main reads the credentials',
          'Two strings from the Scanner, nothing more. Main has no idea whether the user exists.'),
        step(['main>auth', 'auth'], 'Authentication.signIn()',
          'The class that owns "is this really you". It answers with a User object, or with null.'),
        step(['auth>get', 'get'], 'getUserDetails()',
          'Operations is the only class that knows how users are stored. signIn() asks it for the ' +
          'record instead of walking the list itself.'),
        step(['get>users', 'users'], 'Search the list',
          'Walk ArrayList<User> for a matching username. No match means sign-in stops right here — ' +
          'no post, no feed, no file access.'),
        step(['get>check', 'check'], 'checkTheUser()',
          'Compare the typed password with the stored one. A wrong password fails exactly like an ' +
          'unknown username, so neither tells an attacker which half was wrong.'),
        step(['check>current', 'current'], 'The User object goes back to Main',
          'Main stores it as currentUser. Every later call — createPost(), feed, follow — is made ' +
          'on behalf of this object.')
      ]
    },

    /* ========================================================= CREATE POST */
    {
      id: 'create-post',
      group: 'Posts',
      name: 'createPost()',
      title: 'Create Post',
      subtitle: 'Main → Authentication → createUser() / checkTheUser() → QuotesOgram → createPost()',
      nodes: [
        node('main', 'Main.java', { kind: 'class', row: 0, col: 1, sub: 'menu loop · Scanner' }),
        node('auth', 'Authentication.java', { kind: 'class', row: 1, col: 1,
          methods: ['signIn()', 'signUp()'] }),
        node('createUser', 'createUser()', { row: 2, col: 0, sub: 'Operations.java' }),
        node('check', 'checkTheUser()', { row: 2, col: 2, sub: 'Operations.java' }),
        node('users', 'ArrayList<User>', { kind: 'data', row: 3, col: 0 }),
        node('qo', 'QuotesOgram.java', { kind: 'class', row: 4, col: 1,
          note: 'UserObject [ userPosts ]' }),
        node('create', 'createPost()', { row: 5, col: 1, note: 'quote + user id + time' }),
        node('file', 'write()', { kind: 'file', row: 6, col: 1, sub: 'FileHandling.java' })
      ],
      edges: [
        edge('main', 'auth', ''),
        edge('auth', 'createUser', 'SignUp'),
        edge('auth', 'check', 'SignIn'),
        edge('createUser', 'users', 'ArrayList<User>', { dashed: true }),
        edge('createUser', 'qo', 'Go with User Object'),
        edge('check', 'qo', 'success'),
        edge('qo', 'create', 'currentUser + quote'),
        edge('create', 'file', 'save')
      ],
      steps: [
        step('main', 'Main.java runs the menu',
          'The program starts here. Main prints the menu, reads one line, and calls the class that ' +
          'owns that job. It holds no data of its own.'),
        step(['main>auth', 'auth'], 'Authentication.java',
          'Two doors into the app: signUp() for somebody new, signIn() for somebody returning. ' +
          'Both end with the same thing in hand — a User object.'),
        step(['auth>createUser', 'createUser'], 'SignUp → createUser()',
          'A new user is validated and built here, in Operations. QuotesOgram is never involved in ' +
          'making an account.'),
        step(['createUser>users', 'users'], 'ArrayList<User>',
          'The list every account lives in. createUser() appends to it; checkTheUser() searches it.'),
        step(['auth>check', 'check'], 'SignIn → checkTheUser()',
          'The returning user path: find the record, compare the password, hand back the User.'),
        step(['createUser>qo', 'check>qo', 'qo'], 'Go with User Object',
          'Both paths meet at QuotesOgram with the same thing: the signed-in User. That object is ' +
          'the permission slip for everything that follows — it carries the id whose posts, ' +
          'followers and following the class is allowed to touch.'),
        step(['qo>create', 'create'], 'createPost()',
          'Trim the quote, refuse it if empty or too long, stamp the user id and the time, add the ' +
          'Post to the list. The post is tied to the User object Main passed in — that is why you ' +
          'can never post as somebody else.'),
        step(['create>file', 'file'], 'FileHandling.write()',
          'The last hop. QuotesOgram changed the list in memory, then asked FileHandling to put it ' +
          'on disk. Restart the program and the post is still there.')
      ]
    },

    /* ======================================================== VIEW MY POSTS */
    {
      id: 'view-my-posts',
      group: 'Posts',
      name: 'viewMyPosts()',
      title: 'View My Posts',
      subtitle: 'Main → QuotesOgram.viewMyPosts(currentUser) → displayPosts()',
      nodes: [
        node('main', 'Main.java', { kind: 'class', row: 0, col: 1, sub: 'currentUser in hand' }),
        node('qo', 'QuotesOgram.java', { kind: 'class', row: 1, col: 1, methods: ['viewMyPosts()'] }),
        node('posts', 'ArrayList<Post>', { kind: 'data', row: 2, col: 0 }),
        node('filter', 'filter by user id', { row: 2, col: 2, note: 'p.userId == currentUser.id' }),
        node('display', 'displayPosts()', { row: 3, col: 1, sub: 'Main.java',
          note: 'username : "quote"' })
      ],
      edges: [
        edge('main', 'qo', 'option 2 → currentUser'),
        edge('qo', 'posts', 'read every post', { dashed: true }),
        edge('qo', 'filter', 'keep mine only'),
        edge('filter', 'display', 'ArrayList<Post>')
      ],
      steps: [
        step('main', 'Main passes currentUser',
          'Main does not say "show posts of rajan_t". It passes the User object it got at sign-in, ' +
          'so there is no way to ask for somebody else\'s posts by typing a different name.'),
        step(['main>qo', 'qo'], 'viewMyPosts()',
          'QuotesOgram owns the post list, so the question goes to it.'),
        step(['qo>posts', 'posts'], 'One list for everybody',
          'Every post of every user sits in the same ArrayList<Post>. Each Post remembers the id of ' +
          'the user who wrote it.'),
        step(['qo>filter', 'filter'], 'Keep only mine',
          'Compare each post\'s user id with currentUser.getId(). That single comparison is the ' +
          'whole feature.'),
        step(['filter>display', 'display'], 'displayPosts()',
          'Main prints the returned list, newest first, as username : "quote". The printing code ' +
          'makes no decisions — everything was decided before the list reached it.')
      ]
    },

    /* ============================================================ THE FEED */
    {
      id: 'show-feed',
      group: 'Posts',
      name: 'getAllUsersPosts()',
      title: 'Feed (posts from following)',
      subtitle: 'Main → QuotesOgram.getAllUsersPosts(currentUser) → displayPosts()',
      nodes: [
        node('main', 'Main.java', { kind: 'class', row: 0, col: 1 }),
        node('qo', 'QuotesOgram.java', { kind: 'class', row: 1, col: 1,
          methods: ['getAllUsersPosts()'] }),
        node('following', 'following list', { kind: 'data', row: 2, col: 0,
          note: 'who currentUser follows' }),
        node('posts', 'ArrayList<Post>', { kind: 'data', row: 2, col: 2 }),
        node('filter', 'filter + sort', { row: 3, col: 1, note: 'author in following · newest first' }),
        node('display', 'displayPosts()', { row: 4, col: 1, sub: 'Main.java' })
      ],
      edges: [
        edge('main', 'qo', 'option 3 → currentUser'),
        edge('qo', 'following', 'step 1: who do I follow?'),
        edge('qo', 'posts', 'step 2: every post', { dashed: true }),
        edge('following', 'filter', ''),
        edge('posts', 'filter', ''),
        edge('filter', 'display', 'ArrayList<Post>')
      ],
      steps: [
        step(['main', 'main>qo'], 'Main asks for the feed',
          'Option 3. Again the User object goes in, not a username.'),
        step('qo', 'getAllUsersPosts()',
          'The name says "all users", but it means "all the users this one follows". The filtering ' +
          'belongs here, not in the printing code.'),
        step(['qo>following', 'following'], 'Step 1 — the follow list',
          'Collect the ids currentUser follows. Plus their own id, so you see your own quotes too.'),
        step(['qo>posts', 'posts'], 'Step 2 — the post list',
          'The same shared ArrayList<Post> that viewMyPosts() reads.'),
        step('filter', 'Step 3 — keep and sort',
          'Keep a post only if its author id is in the follow set, then sort newest first. A post ' +
          'by somebody you do not follow can never enter the list.'),
        step(['filter>display', 'display'], 'displayPosts()',
          'The Instagram-style console view: one line per post, username first, quote in quotes.')
      ]
    },

    /* ======================================================= CREATE PROFILE */
    {
      id: 'create-profile',
      group: 'Profile',
      name: 'createProfile()',
      title: 'Create Profile',
      subtitle: 'Authentication.signUp() → QuotesOgram.createProfile() → write()',
      nodes: [
        node('auth', 'Authentication.java', { kind: 'class', row: 0, col: 1, methods: ['signUp()'] }),
        node('qo', 'QuotesOgram.java', { kind: 'class', row: 1, col: 1, methods: ['createProfile()'] }),
        node('bio', 'bio', { kind: 'data', row: 2, col: 0, note: '"Live & let live"' }),
        node('privacy', 'isPrivate', { kind: 'data', row: 2, col: 2, note: 'public / private switch' }),
        node('user', 'User object', { kind: 'data', row: 3, col: 1,
          note: 'profile now complete' }),
        node('file', 'write()', { kind: 'file', row: 4, col: 1, sub: 'FileHandling.java' })
      ],
      edges: [
        edge('auth', 'qo', 'Go with User Object'),
        edge('qo', 'bio', 'set'),
        edge('qo', 'privacy', 'set'),
        edge('bio', 'user', ''),
        edge('privacy', 'user', ''),
        edge('user', 'file', 'save')
      ],
      steps: [
        step(['auth', 'auth>qo'], 'Straight after createUser()',
          'The account exists but it is bare: a username and a password hash. createProfile() is ' +
          'what makes it a profile somebody can look at.'),
        step('qo', 'QuotesOgram.createProfile()',
          'Profiles belong to QuotesOgram, not to Authentication. Authentication proves who you ' +
          'are; QuotesOgram decides what a user looks like.'),
        step(['qo>bio', 'bio'], 'The bio',
          'A single line under the username. Empty input falls back to a default so the profile ' +
          'view never has a blank hole in it.'),
        step(['qo>privacy', 'privacy'], 'Public or private',
          'One boolean, chosen at sign-up and changeable later. Every privacy rule in the app is ' +
          'read from this one field.'),
        step('user', 'One User object carries all of it',
          'Username, password hash, bio and isPrivate live on the same object — which is why ' +
          'passing that object around is enough for later calls.'),
        step(['user>file', 'file'], 'Saved',
          'FileHandling.write() again. Every class that changes something ends in this same box.')
      ]
    },

    /* ========================================================= SHOW PROFILE */
    {
      id: 'show-profile',
      group: 'Profile',
      name: 'showProfile()',
      title: 'Show a Profile (public vs private)',
      subtitle: 'Main → QuotesOgram.showProfile(target) → canView() → posts / "private"',
      nodes: [
        node('main', 'Main.java', { kind: 'class', row: 0, col: 1, sub: 'option 4 · search' }),
        node('qo', 'QuotesOgram.java', { kind: 'class', row: 1, col: 1, methods: ['showProfile()'] }),
        node('header', 'print header', { row: 2, col: 0, note: 'bio · public/private · counts' }),
        node('can', 'canView()', { row: 2, col: 2,
          note: 'me? public? already following?' }),
        node('open', '1. posts  2. followers  3. following', { row: 3, col: 2 }),
        node('locked', '"This account is private"', { kind: 'data', row: 3, col: 0 })
      ],
      edges: [
        edge('main', 'qo', 'target username'),
        edge('qo', 'header', 'always'),
        edge('qo', 'can', 'may I see the rest?'),
        edge('can', 'open', 'yes'),
        edge('can', 'locked', 'no')
      ],
      steps: [
        step(['main', 'main>qo'], 'Main looks a user up',
          'Main passes the name typed at the prompt plus currentUser — the class needs to know ' +
          'who is asking, not just who is being asked about.'),
        step('qo', 'showProfile()',
          'One method serves every profile. There is no separate "private profile" screen; the ' +
          'difference is decided inside.'),
        step(['qo>header', 'header'], 'The header always prints',
          'Bio, public or private, and the three counters — posts, followers, following. Instagram ' +
          'shows the same on a locked account, and so does this.'),
        step(['qo>can', 'can'], 'canView() decides',
          'Three questions: is this me, is the account public, do I already follow them? Any yes ' +
          'opens the profile.'),
        step(['can>open', 'open'], 'Allowed — the sub-menu appears',
          '1. Show posts   2. Show follower   3. Show followings. Each one reads a list that ' +
          'canView() already approved.'),
        step(['can>locked', 'locked'], 'Not allowed — nothing is loaded',
          'The lists are never even read, so there is nothing for the printing code to leak by ' +
          'accident. The only option offered is "send follow request".')
      ]
    },

    /* ============================================================== FOLLOW */
    {
      id: 'follow-user',
      group: 'Social',
      name: 'followUser()',
      title: 'Follow / Send Follow Request',
      subtitle: 'Main → QuotesOgram.followUser() → isPrivate ? request : follower',
      nodes: [
        node('main', 'Main.java', { kind: 'class', row: 0, col: 1 }),
        node('qo', 'QuotesOgram.java', { kind: 'class', row: 1, col: 1, methods: ['followUser()'] }),
        node('isPrivate', 'target.isPrivate ?', { row: 2, col: 1 }),
        node('followers', 'followers list', { kind: 'data', row: 3, col: 0,
          note: 'follow takes effect now' }),
        node('requests', 'requests list', { kind: 'data', row: 3, col: 2,
          note: 'status = pending' }),
        node('file', 'write()', { kind: 'file', row: 4, col: 1, sub: 'FileHandling.java' })
      ],
      edges: [
        edge('main', 'qo', 'currentUser + target'),
        edge('qo', 'isPrivate', 'the only question that matters'),
        edge('isPrivate', 'followers', 'public → follow'),
        edge('isPrivate', 'requests', 'private → request'),
        edge('followers', 'file', ''),
        edge('requests', 'file', '')
      ],
      steps: [
        step(['main', 'main>qo'], 'Main passes both users',
          'Who is following, and who is being followed. Both are User objects.'),
        step('qo', 'followUser()',
          'A single method handles both cases so the caller never has to know whether the target ' +
          'is private.'),
        step('isPrivate', 'One boolean decides the branch',
          'This is the whole privacy feature: read target.isPrivate and go left or right.'),
        step(['isPrivate>followers', 'followers'], 'Public → straight into followers',
          'The follow is real immediately. Their posts start appearing in your feed on the next ' +
          'getAllUsersPosts() call.'),
        step(['isPrivate>requests', 'requests'], 'Private → a pending request',
          'No follow is created. A request row is added instead, and nothing about the target ' +
          'becomes visible — canView() still answers no.'),
        step('file', 'Saved either way',
          'Both branches end at FileHandling.write(), so a pending request survives a restart just ' +
          'like a follow does.')
      ]
    },

    /* ====================================================== ACCEPT REQUEST */
    {
      id: 'accept-request',
      group: 'Social',
      name: 'acceptRequest()',
      title: 'Accept a Follow Request',
      subtitle: 'Main → showRequests() → acceptRequest() → followers list',
      nodes: [
        node('main', 'Main.java', { kind: 'class', row: 0, col: 1, sub: 'option 5 · Requests' }),
        node('show', 'showRequests()', { row: 1, col: 1, sub: 'QuotesOgram.java',
          note: 'my pending requests' }),
        node('requests', 'requests list', { kind: 'data', row: 2, col: 0 }),
        node('accept', 'acceptRequest()', { row: 3, col: 1, sub: 'QuotesOgram.java' }),
        node('followers', 'followers list', { kind: 'data', row: 4, col: 0,
          note: 'the follow finally exists' }),
        node('file', 'write()', { kind: 'file', row: 5, col: 1, sub: 'FileHandling.java' })
      ],
      edges: [
        edge('main', 'show', 'currentUser'),
        edge('show', 'requests', 'status == pending', { dashed: true }),
        edge('show', 'accept', 'user picks one'),
        edge('accept', 'followers', 'addFollower()'),
        edge('accept', 'file', 'status = accepted'),
        edge('followers', 'file', '', { dashed: true })
      ],
      steps: [
        step(['main', 'main>show'], 'The inbox',
          'This is the notification area from the brief: the screen where a private account watches ' +
          'for people asking to follow.'),
        step(['show>requests', 'requests'], 'Only the pending ones',
          'Filter the request list by "sent to me" and "still pending", then print them numbered so ' +
          'the answer is one keystroke.'),
        step(['show>accept', 'accept'], 'acceptRequest()',
          'Mark that request accepted. Rejecting takes the same path and simply stops here.'),
        step(['accept>followers', 'followers'], 'The request becomes a follow',
          'addFollower() writes the follow that follow-user deliberately did not write. This row is ' +
          'what canView() has been looking for all along.'),
        step(['accept>file', 'file'], 'Saved',
          'From the requester\'s next screen on, the private profile opens: posts, followers and ' +
          'following all load, because one row changed.')
      ]
    },

    /* ================================================================ CHAT */
    {
      id: 'send-message',
      group: 'Chat',
      name: 'sendMessage()',
      title: 'Chat',
      subtitle: 'Main → QuotesOgram.sendMessage() → ArrayList<Message> → displayChat()',
      nodes: [
        node('main', 'Main.java', { kind: 'class', row: 0, col: 1, sub: 'option 6 · Chat' }),
        node('qo', 'QuotesOgram.java', { kind: 'class', row: 1, col: 1,
          methods: ['sendMessage()', 'getChat()'] }),
        node('messages', 'ArrayList<Message>', { kind: 'data', row: 2, col: 0,
          note: 'from · to · text · time' }),
        node('file', 'write()', { kind: 'file', row: 3, col: 0, sub: 'FileHandling.java' }),
        node('display', 'displayChat()', { row: 3, col: 2, sub: 'Main.java',
          note: 'both sides, oldest first' })
      ],
      edges: [
        edge('main', 'qo', 'currentUser + to + text'),
        edge('qo', 'messages', 'add(message)'),
        edge('messages', 'file', 'save'),
        edge('qo', 'display', 'getChat(me, other)')
      ],
      steps: [
        step(['main', 'main>qo'], 'Main collects the message',
          'Who it goes to and what it says. Sender is currentUser — never typed in.'),
        step('qo', 'sendMessage()',
          'One more list in the same class. A Message is just sender id, receiver id, text and time.'),
        step(['qo>messages', 'messages'], 'Append to ArrayList<Message>',
          'No conversation objects: a chat is simply every message where the two ids match, in ' +
          'either direction.'),
        step(['messages>file', 'file'], 'Saved',
          'Same last box as every other write in the app.'),
        step(['qo>display', 'display'], 'displayChat()',
          'getChat(me, other) pulls the pair out of the list, sorts oldest first, and Main prints ' +
          'it. Your own lines and theirs come from the same list.')
      ]
    }
  ];

  /* ------------------------------------------------------------------ api */

  function list() {
    const groups = [];
    FLOWS.forEach((f) => {
      let g = groups.find((x) => x.name === f.group);
      if (!g) groups.push((g = { name: f.group, flows: [] }));
      g.flows.push({ id: f.id, name: f.name, title: f.title });
    });
    return { groups };
  }

  function get(id) {
    const flow = FLOWS.find((f) => f.id === id);
    if (!flow) {
      const err = new Error(`No demo flow called "${id}".`);
      err.status = 404;
      throw err;
    }
    return flow;
  }

  module.exports = { list, get };
});

define('./api', function (require, module, exports) {
  'use strict';

  /**
   * API – maps HTTP requests onto Authentication / QuotesOgram calls.
   */

  const auth = require('./authentication');
  const app = require('./quotesOgram');
  const ops = require('./authOperations');
  const demo = require('./demo');

  function requireAuth(ctx) {
    if (!ctx.user) throw ops.httpError(401, 'Please sign in first.');
    return ctx.user;
  }

  const routes = [
    ['POST', /^\/api\/signup$/, (ctx) => auth.signUp(ctx.body)],
    ['POST', /^\/api\/signin$/, (ctx) => auth.signIn(ctx.body)],
    ['POST', /^\/api\/signout$/, (ctx) => auth.signOut(ctx.token)],

    ['GET', /^\/api\/me$/, (ctx) => {
      const me = requireAuth(ctx);
      return { user: app.publicUser(me), stats: app.stats(me.id), badges: app.badges(me) };
    }],
    ['PATCH', /^\/api\/me$/, (ctx) => ({ user: app.updateSettings(requireAuth(ctx), ctx.body) })],

    ['GET', /^\/api\/feed$/, (ctx) => ({ posts: app.feed(requireAuth(ctx)) })],
    ['GET', /^\/api\/recent$/, (ctx) => ({
      posts: app.recentFromFollowing(requireAuth(ctx), {
        hours: Number(ctx.query.hours) || 24
      })
    })],

    ['GET', /^\/api\/posts\/mine$/, (ctx) => ({ posts: app.myPosts(requireAuth(ctx)) })],
    ['POST', /^\/api\/posts$/, (ctx) => ({ post: app.createPost(requireAuth(ctx), ctx.body.quote) })],
    ['DELETE', /^\/api\/posts\/([\w]+)$/, (ctx) => app.deletePost(requireAuth(ctx), ctx.params[0])],
    ['POST', /^\/api\/posts\/([\w]+)\/like$/, (ctx) => ({
      post: app.toggleLike(requireAuth(ctx), ctx.params[0])
    })],

    ['GET', /^\/api\/users$/, (ctx) => ({ users: app.searchUsers(requireAuth(ctx), ctx.query.q) })],
    ['GET', /^\/api\/suggestions$/, (ctx) => ({ users: app.suggestUsers(requireAuth(ctx), 8) })],
    ['GET', /^\/api\/profile\/([\w.]+)$/, (ctx) => app.profileView(requireAuth(ctx), ctx.params[0])],

    ['POST', /^\/api\/follow\/([\w.]+)$/, (ctx) => app.follow(requireAuth(ctx), ctx.params[0])],
    ['POST', /^\/api\/unfollow\/([\w.]+)$/, (ctx) => app.unfollow(requireAuth(ctx), ctx.params[0])],
    ['POST', /^\/api\/remove-follower\/([\w.]+)$/, (ctx) =>
      app.removeFollower(requireAuth(ctx), ctx.params[0])],

    ['GET', /^\/api\/requests$/, (ctx) => {
      const me = requireAuth(ctx);
      return { incoming: app.incomingRequests(me), outgoing: app.outgoingRequests(me) };
    }],
    ['POST', /^\/api\/requests\/([\w]+)\/accept$/, (ctx) =>
      app.answerRequest(requireAuth(ctx), ctx.params[0], true)],
    ['POST', /^\/api\/requests\/([\w]+)\/reject$/, (ctx) =>
      app.answerRequest(requireAuth(ctx), ctx.params[0], false)],

    ['GET', /^\/api\/demo$/, (ctx) => { requireAuth(ctx); return demo.list(); }],
    ['GET', /^\/api\/demo\/([\w-]+)$/, (ctx) => { requireAuth(ctx); return demo.get(ctx.params[0]); }],

    ['GET', /^\/api\/chats$/, (ctx) => ({ chats: app.conversations(requireAuth(ctx)) })],
    ['GET', /^\/api\/chats\/([\w.]+)$/, (ctx) =>
      app.messagesWith(requireAuth(ctx), ctx.params[0], { markRead: ctx.query.peek !== '1' })],
    ['POST', /^\/api\/chats\/([\w.]+)$/, (ctx) => ({
      message: app.sendMessage(requireAuth(ctx), ctx.params[0], ctx.body.text)
    })]
  ];

  function match(method, pathname) {
    for (const [verb, re, handler] of routes) {
      if (verb !== method) continue;
      const m = re.exec(pathname);
      if (m) return { handler, params: m.slice(1).map(decodeURIComponent) };
    }
    return null;
  }

  module.exports = { match };
});

define('./seed', function (require, module, exports) {
  'use strict';

  /**
   * Seed – gives a fresh install something to look at: a few accounts (one of
   * them private), quotes, follows, a pending follow request and a chat thread.
   */

  const store = require('./store');
  const { createUser } = require('./authOperations');
  const app = require('./quotesOgram');

  const MIN = 60 * 1000;
  const HOUR = 60 * MIN;

  const PEOPLE = [
    { username: 'rajan_t', name: 'Rajan T', bio: 'Live & let live', isPrivate: false,
      quotes: ['Anchor Than ⚓️🌿', 'Slow mornings build fast years.'] },
    { username: 'meera.k', name: 'Meera K', bio: 'Collecting small sentences', isPrivate: false,
      quotes: ['The quiet ones are reading the room.', 'Begin badly, but begin.'] },
    { username: 'arun_dev', name: 'Arun', bio: 'Code, coffee, couplets', isPrivate: false,
      quotes: ['A bug is just a feature with bad manners.', 'Ship it, then sleep on it.'] },
    { username: 'nila_reads', name: 'Nila', bio: 'Two books behind, always', isPrivate: false,
      quotes: ['Rain is the sky reading out loud.'] },
    { username: 'tharun.s', name: 'Tharun S', bio: 'Running towards nothing in particular', isPrivate: false,
      quotes: ['Discipline is remembering what you wanted.'] },
    { username: 'kavi.writes', name: 'Kavi', bio: 'Private notes, public heart', isPrivate: true,
      quotes: ['Some poems are only for the drawer.', 'Silence is a full sentence.'] }
  ];

  const FOLLOWS = [
    ['rajan_t', 'meera.k'], ['rajan_t', 'arun_dev'], ['rajan_t', 'nila_reads'],
    ['meera.k', 'rajan_t'], ['meera.k', 'nila_reads'], ['meera.k', 'kavi.writes'],
    ['arun_dev', 'rajan_t'], ['arun_dev', 'tharun.s'],
    ['nila_reads', 'meera.k'], ['nila_reads', 'rajan_t'],
    ['tharun.s', 'arun_dev'], ['kavi.writes', 'rajan_t']
  ];

  function ensureSeed() {
    if (store.data.users.length > 0) return;

    const now = Date.now();
    const byName = {};
    let age = 0;

    PEOPLE.forEach((p) => {
      const user = createUser({ ...p, password: 'quotes123' });
      byName[p.username] = user;
      p.quotes.forEach((quote) => {
        age += 47 * MIN;
        store.data.posts.push({
          id: store.nextId('post'),
          userId: user.id,
          quote,
          likes: [],
          createdAt: now - age
        });
      });
    });

    FOLLOWS.forEach(([a, b]) => {
      store.data.follows.push({
        followerId: byName[a].id,
        followeeId: byName[b].id,
        createdAt: now - 20 * HOUR
      });
    });

    // tharun.s is waiting for kavi.writes to accept him.
    store.data.requests.push({
      id: store.nextId('request'),
      fromId: byName['tharun.s'].id,
      toId: byName['kavi.writes'].id,
      status: 'pending',
      createdAt: now - 3 * HOUR
    });

    [
      ['meera.k', 'rajan_t', 'That anchor quote lived in my head all day.', 5 * HOUR],
      ['rajan_t', 'meera.k', 'Ha! Stole it from a boat in Kanyakumari.', 4 * HOUR],
      ['meera.k', 'rajan_t', 'Post more of those.', 3 * HOUR]
    ].forEach(([from, to, text, ago]) => {
      store.data.messages.push({
        id: store.nextId('message'),
        fromId: byName[from].id,
        toId: byName[to].id,
        text,
        createdAt: now - ago,
        readAt: now - ago + MIN
      });
    });

    store.save();
    console.log('  Seeded demo accounts (password for all: quotes123)');
    return app;
  }

  module.exports = { ensureSeed };
});


/* ------------------------------------------------------------------- boot
   server.js turned an HTTP request into a ctx and handed it to api.match().
   Same thing here, minus the socket. */

const api = require('./api');
const ops = require('./authOperations');
const store = require('./store');
const fileHandling = require('./fileHandling');
require('./seed').ensureSeed();

function request(method, fullPath, { body = null, token = '' } = {}) {
  const url = new URL(fullPath, 'http://quotesogram.local');
  const route = api.match(method, url.pathname);
  if (!route) return { status: 404, data: { error: 'Unknown endpoint.' } };

  const ctx = {
    token,
    user: ops.userFromToken(token),
    params: route.params,
    query: Object.fromEntries(url.searchParams),
    body: ['POST', 'PATCH', 'PUT'].includes(method) ? (body || {}) : {}
  };

  try {
    const result = route.handler(ctx);
    return { status: 200, data: result ?? { ok: true } };
  } catch (err) {
    const status = err.status || 500;
    if (status >= 500) console.error('[api]', err);
    return { status, data: { error: err.message || 'Something went wrong.' } };
  }
}

/** Throw away this browser's data and reseed — the lab's `npm run reset`. */
function reset() {
  fileHandling.wipe();
  store.reload();
  require('./seed').ensureSeed();
}

window.QuotesOgramServer = { request, reset };
}());
