import { createContext, useContext, useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getCurrentUser, signInRequired, signOut } from './catalyst';

/* Who is signed in, asked once when the app starts. Signing in leaves the app
   for Zoho and comes back with a full page load, so there is nothing to
   refresh in between.

   status: 'checking' → 'in' | 'out' | 'error' (Catalyst unreachable). */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [state, setState] = useState({ status: 'checking', user: null });

  useEffect(() => {
    let live = true;
    getCurrentUser()
      .then(user => live && setState({ status: user ? 'in' : 'out', user }))
      .catch(() => live && setState({ status: 'error', user: null }));
    return () => { live = false; };
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

/* Layout route around every course page: anyone not signed in goes to
   /login, carrying the page they asked for so they land back on it. */
export function RequireAuth() {
  const { status } = useAuth();
  const { pathname, search } = useLocation();

  if (!signInRequired) return <Outlet />;
  if (status === 'checking') return <div className="auth-checking" aria-busy="true" />;
  if (status !== 'in') {
    const next = encodeURIComponent(pathname + search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }
  return <Outlet />;
}
