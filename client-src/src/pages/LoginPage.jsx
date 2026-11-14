import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.svg';
import zohoLogo from '../assets/zoho-logo.svg';
import LoginIllustration from '../components/login/LoginIllustration';

/* The sign-in page at /login. Like a standalone lab it is the whole viewport —
   no AppShell, no sidebar.

   The button does not sign anyone in yet: every page is still open, so it
   takes you to the courses. When Catalyst Authentication is set up with Zoho
   as a provider, its sign-in call replaces the navigate below. */
export default function LoginPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const previous = document.title;
    document.title = 'Sign in — Visual Learning';
    return () => { document.title = previous; };
  }, []);

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
          <button type="button" className="login-zoho" onClick={() => navigate('/')}>
            <img src={zohoLogo} alt="" width="54" height="24" />
            <span className="login-zoho-rule" aria-hidden="true" />
            <span>Sign in with Zoho</span>
          </button>
          <p className="login-note">Use your Zoho account to continue.</p>
        </section>
      </main>

      <footer className="login-tagline">See · Try · Understand</footer>
    </div>
  );
}
