import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

/* Layout route: the sidebar persists across Home, Browse, a course and a
   lesson, so navigating never re-renders the rail. */
export default function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();

  /* A lesson is a lab in a frame, so its page is sized to the viewport rather
     than left to grow — see the lab block in lesson.css. Read off the route
     because the shell renders the lesson through <Outlet>. */
  const isLesson = /^\/learn\/[^/]+\/[^/]+\/[^/]+/.test(pathname);

  /* Any navigation closes the mobile drawer and returns you to the top. A
     viewport-fitted lesson scrolls the <main> instead of the window, and the
     shell outlives the route, so reset both. */
  const mainRef = useRef(null);
  useEffect(() => {
    setMobileOpen(false);
    window.scrollTo({ top: 0 });
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, [pathname]);

  useEffect(() => {
    const onKey = e => e.key === 'Escape' && setMobileOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className={'shell' + (collapsed ? ' shell-collapsed' : '') + (mobileOpen ? ' shell-open' : '')}>
      <button type="button" className="mobile-bar-btn" onClick={() => setMobileOpen(o => !o)} aria-label="Open menu">
        <span aria-hidden="true">☰</span>
      </button>

      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(c => !c)}
        onNavigate={() => setMobileOpen(false)}
      />

      <div className="shell-scrim" onClick={() => setMobileOpen(false)} aria-hidden="true" />

      <main ref={mainRef} className={'shell-main' + (isLesson ? ' is-lesson' : '')}>
        <Outlet />
      </main>
    </div>
  );
}
