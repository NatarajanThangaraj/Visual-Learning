/* Sign-in, through Catalyst Authentication with Zoho as the only provider.

   The Catalyst Web SDK is loaded on demand rather than from index.html: its
   second script, /__catalyst/sdk/init.js, is written by the Catalyst host for
   this project and exists only on the deployed site. On the Vite dev server
   there is no /__catalyst/, so in development sign-in is skipped and everyone
   is a stand-in user — the labs stay workable locally.

   The Zoho button itself is Catalyst's, rendered in an iframe from our own
   domain; public/zoho-signin.css restyles it to match the login page. */

const SDK_URL = 'https://static.zohocdn.com/catalyst/sdk/js/4.6.2/catalystWebSDK.js';
const BASE = import.meta.env.BASE_URL;

/* Off switch. While false, no page asks anyone to sign in, the sidebar shows
   no user, and /login goes straight to the courses. */
export const signInRequired = false;

export const authEnabled = signInRequired && !import.meta.env.DEV;

const DEV_USER = { first_name: 'Local', last_name: 'Developer', email_id: 'dev@localhost' };

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const el = document.createElement('script');
    el.src = src;
    el.onload = resolve;
    el.onerror = () => reject(new Error(`Could not load ${src}`));
    document.head.appendChild(el);
  });
}

let sdk;
function loadCatalyst() {
  /* init.js calls catalyst.initApp, so it has to run after the SDK. A failed
     load is not cached — the next call tries again. */
  sdk ??= loadScript(SDK_URL)
    .then(() => loadScript(`${BASE}__catalyst/sdk/init.js`))
    .then(() => window.catalyst)
    .catch(err => { sdk = undefined; throw err; });
  return sdk;
}

/* The signed-in user, or null. Rejects only when Catalyst can't be reached,
   so a network failure is not mistaken for being signed out. */
export async function getCurrentUser() {
  if (!authEnabled) return signInRequired ? DEV_USER : null;
  const catalyst = await loadCatalyst();
  try {
    const res = await catalyst.auth.isUserAuthenticated();
    return res.content;
  } catch {
    return null;
  }
}

/* Puts Catalyst's "Sign in with Zoho" button into the element with this id.
   After Zoho, Catalyst sends the browser back to `next` (a path on this site). */
export async function renderZohoSignIn(elementId, next) {
  const catalyst = await loadCatalyst();
  catalyst.auth.signIn(elementId, {
    signin_providers_only: true,
    css_url: `${BASE}zoho-signin.css`,
    service_url: next,
  });
}

export async function signOut() {
  const to = `${BASE}login`;
  if (!authEnabled) {
    window.location.assign(to);
    return;
  }
  const catalyst = await loadCatalyst();
  catalyst.auth.signOut(to);
}

/* Where to go after signing in. Only paths on this site are honoured, so a
   crafted ?next= can't send someone elsewhere. */
export function safeNext(value) {
  return value && value.startsWith('/') && !value.startsWith('//') ? value : '/';
}
