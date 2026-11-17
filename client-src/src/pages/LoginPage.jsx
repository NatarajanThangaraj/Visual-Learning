import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import logo from '../assets/logo.svg';
import zohoLogo from '../assets/zoho-logo.svg';
import LoginIllustration from '../components/login/LoginIllustration';
import { useAuth } from '../auth/AuthContext';
import { authEnabled, renderZohoSignIn, safeNext, signInRequired } from '../auth/catalyst';

const SIGNIN_ID = 'zoho-signin';

/* The sign-in page at /login. Like a standalone lab it is the whole viewport —
   no AppShell, no sidebar.

   On the deployed site the button is Catalyst's own "Sign in with Zoho",
   rendered into #zoho-signin and restyled by public/zoho-signin.css. On the
   dev server there is no Catalyst, so our drawn button stands in and just
   continues. ?next= is the page to return to afterwards. */
export default function LoginPage() {
  const { status } = useAuth();
  const [params] = useSearchParams();
  const next = safeNext(params.get('next'));
  const [renderFailed, setRenderFailed] = useState(false);
  const failed = status === 'error' || renderFailed;

  useEffect(() => {
    const previous = document.title;
    document.title = 'Sign in — Visual Learning';
    return () => { document.title = previous; };
  }, []);

  useEffect(() => {
    if (!authEnabled || status !== 'out') return;
    renderZohoSignIn(SIGNIN_ID, next).catch(() => setRenderFailed(true));
  }, [status, next]);

  // With sign-in switched off there is nothing to do here.
  if (status === 'in' || !signInRequired) return <Navigate to={next} replace />;

  return (
    <div className="login-page">
      <header className="login-brand">
        <img src={logo} alt="" width="34" height="34" />
        <span className="login-brand-text">
          <span>Visual</span>
          <span className="login-accent">Learning</span>
        </span>
      </header>

      <main className="login-main">
        <LoginIllustration />

        <section className="login-panel" aria-labelledby="login-title">
          <p className="login-eyebrow">Welcome to</p>
          <h1 id="login-title" className="login-title">
            Visual<br />
            <span className="login-accent">Learning</span>
          </h1>
          <p className="login-lede">
            See the code run, watch the idea take shape, then try it yourself in a hands-on lab.
          </p>

          <p className="login-using">Sign in using</p>
          {authEnabled ? (
            <div id={SIGNIN_ID} className="login-zoho-frame" />
          ) : (
            <DevSignIn next={next} />
          )}
          {failed ? (
            <p className="login-note login-error" role="alert">
              Couldn't reach Zoho sign-in. Check your connection and refresh the page.
            </p>
          ) : (
            <p className="login-note">Use your Zoho account to continue.</p>
          )}
        </section>
      </main>

      <footer className="login-tagline">See · Try · Understand</footer>
    </div>
  );
}

/* Development only: the same-looking button, without Zoho behind it. */
function DevSignIn({ next }) {
  const navigate = useNavigate();
  return (
    <button type="button" className="login-zoho" onClick={() => navigate(next)}>
      <img src={zohoLogo} alt="" width="54" height="24" />
      <span className="login-zoho-rule" aria-hidden="true" />
      <span>Sign in with Zoho</span>
    </button>
  );
}
