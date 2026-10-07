import { NavLink } from 'react-router-dom';
import { courses } from '../../data/courses';

/* The three courses as tabs across the top of a course page. Each tab carries
   its own accent, so the underline under the active one is that course's
   colour rather than the page's. */
export default function CourseTabs() {
  return (
    <nav className="course-tabs" aria-label="Courses">
      {courses.map(c => (
        <NavLink
          key={c.id}
          className="course-tab"
          to={`/${c.id}`}
          end
          style={{ '--course-accent': c.accent }}
        >
          {c.title}
        </NavLink>
      ))}
    </nav>
  );
}
