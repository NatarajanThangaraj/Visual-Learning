import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation, useSearchParams } from 'react-router-dom';
import { courses, getCourse, resolveCourseId, findLesson, activeTopicId } from '../../data/courses';
import Sidebar from './Sidebar';

/* Layout route: the sidebar persists across a course and its lessons, so
   navigating never re-renders the rail. */
export default function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  const [params] = useSearchParams();

  /* A lesson is a lab in a frame, so its page is sized to the viewport rather
     than left to grow — see the lab block in lesson.css. Read off the route
     because the shell renders the lesson through <Outlet>: a lesson is the
     only two-segment route the shell serves. */
  const isLesson = /^\/[^/]+\/[^/]+\/?$/.test(pathname);

  /* The sidebar lists the topics of the course in the URL — on a lesson, the
     lesson's own topic is the one marked. Anything else (a 404) falls back to
     the first course so the rail is never empty. */
  const [first, second] = pathname.split('/').filter(Boolean);
  const course = getCourse(resolveCourseId(first)) || courses[0];
  const lesson = isLesson ? findLesson(course.id, second) : null;
  const topicId = lesson ? lesson.moduleId : activeTopicId(course, params.get('topic'));

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
        course={course}
        topicId={topicId}
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
