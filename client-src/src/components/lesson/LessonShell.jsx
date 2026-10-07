import { Link } from 'react-router-dom';

/* Chrome around every lesson: where you are and what this is. */
export default function LessonShell({ course, lesson, children }) {
  return (
    <div className="lesson-page" style={{ '--course-accent': course.accent, '--course-accent-bg': course.accentBg }}>
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to={`/${course.id}`}>{course.title}</Link>
        <span aria-hidden="true">/</span>
        <span>{lesson.moduleTitle}</span>
      </nav>

      <header className="lesson-head">
        {lesson.minutes ? (
          <div className="lesson-head-meta">
            <span className="lesson-min">{lesson.minutes} min</span>
          </div>
        ) : null}
        <h1 className="lesson-title">{lesson.title}</h1>
        {lesson.blurb && <p className="lesson-blurb">{lesson.blurb}</p>}
      </header>

      <div className="lesson-body">{children}</div>
    </div>
  );
}
