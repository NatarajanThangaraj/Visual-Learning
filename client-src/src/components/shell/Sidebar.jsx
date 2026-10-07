import { NavLink, Link } from 'react-router-dom';
import { courses, courseLessonCount } from '../../data/courses';
import logo from '../../assets/logo.svg';

/* The permanent left rail: brand, top-level nav and one entry per course.
   Below 900px it slides in over the content — AppShell owns the open/closed
   state. */
export default function Sidebar({ collapsed, onToggle, onNavigate }) {
  return (
    <aside className={'sidebar' + (collapsed ? ' is-collapsed' : '')}>
      <div className="sb-head">
        <Link className="sb-brand" to="/" onClick={onNavigate}>
          <img src={logo} alt="" width="30" height="30" />
          <span className="sb-brand-text">Visual Learning</span>
        </Link>
        <button
          type="button"
          className="sb-collapse"
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
            <rect x="2.5" y="3.5" width="15" height="13" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <line x1="8" y1="3.5" x2="8" y2="16.5" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        </button>
      </div>

      <nav className="sb-nav" aria-label="Main">
        <NavLink className="sb-link" to="/" end onClick={onNavigate}>
          <span className="sb-ico" aria-hidden="true">⌂</span>
          <span className="sb-label">Home</span>
        </NavLink>
        <NavLink className="sb-link" to="/browse" onClick={onNavigate}>
          <span className="sb-ico" aria-hidden="true">▤</span>
          <span className="sb-label">Browse all</span>
        </NavLink>
      </nav>

      <div className="sb-section">
        <span className="sb-section-title">Courses</span>
      </div>

      <nav className="sb-nav" aria-label="Courses">
        {courses.map(c => {
          const total = courseLessonCount(c.id);
          return (
            <NavLink
              key={c.id}
              className="sb-link sb-course"
              to={`/${c.id}`}
              onClick={onNavigate}
              title={`${c.title} — ${total} pages`}
            >
              <span className="sb-dot" style={{ background: c.accent }} aria-hidden="true" />
              <span className="sb-label">{c.title}</span>
              <span className="sb-count">{total}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
