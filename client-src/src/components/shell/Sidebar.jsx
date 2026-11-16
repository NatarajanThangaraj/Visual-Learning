import { Link } from 'react-router-dom';
import logo from '../../assets/logo.svg';
import { useAuth } from '../../auth/AuthContext';

/* The permanent left rail: the brand, then the topics of the course in view.
   Picking a topic opens its lessons on the course page. Collapsed, the rail
   keeps each topic's number so it still works as navigation. Below 900px it
   slides in over the content — AppShell owns the open/closed state. */
export default function Sidebar({ course, topicId, collapsed, onToggle, onNavigate }) {
  return (
    <aside
      className="sidebar"
      style={{ '--course-accent': course.accent, '--course-accent-bg': course.accentBg }}
    >
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
          aria-expanded={!collapsed}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
            <rect x="2.5" y="3.5" width="15" height="13" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <line x1="8" y1="3.5" x2="8" y2="16.5" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        </button>
      </div>

      <div className="sb-section">
        <span className="sb-section-title">{course.title} topics</span>
      </div>

      <nav className="sb-nav" aria-label={`${course.title} topics`}>
        {course.modules.map((m, i) => {
          const active = m.id === topicId;
          return (
            <Link
              key={m.id}
              className={'sb-link sb-topic' + (active ? ' active' : '')}
              to={`/${course.id}?topic=${m.id}`}
              aria-current={active ? 'true' : undefined}
              title={m.title}
              onClick={onNavigate}
            >
              <span className="sb-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <span className="sb-label">{m.title}</span>
            </Link>
          );
        })}
      </nav>

      <SidebarUser />
    </aside>
  );
}

/* Pinned to the foot of the rail: who is signed in, and the way out.
   Collapsed, only the initials and the sign-out button remain. */
function SidebarUser() {
  const { user, signOut } = useAuth();
  if (!user) return null;

  const name = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email_id;
  const initials = name.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="sb-user">
      <span className="sb-avatar" aria-hidden="true">{initials}</span>
      <span className="sb-label sb-user-name" title={user.email_id}>{name}</span>
      <button type="button" className="sb-signout" onClick={signOut} aria-label="Sign out" title="Sign out">
        <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
          <path d="M8 4H5.5A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16H8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M12 6.5 15.5 10 12 13.5M15.5 10H8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}
