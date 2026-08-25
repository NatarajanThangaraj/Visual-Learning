import { Link } from 'react-router-dom';

/* Chrome around every lesson: where you are, what this is, and the bar that
   moves you along. */
export default function LessonShell({
  course, lesson, prev, next, complete, onToggleComplete, children,
}) {
  return (
    <div className="lesson-page" style={{ '--course-accent': course.accent, '--course-accent-bg': course.accentBg }}>
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to={`/learn/${course.id}`}>{course.title}</Link>
        <span aria-hidden="true">/</span>
        <span>{lesson.moduleTitle}</span>
      </nav>

      <header className="lesson-head">
        <div className="lesson-head-meta">
          {lesson.minutes ? <span className="lesson-min">{lesson.minutes} min</span> : null}
          {complete && <span className="lesson-done-chip">✓ Completed</span>}
        </div>
        <h1 className="lesson-title">{lesson.title}</h1>
        {lesson.blurb && <p className="lesson-blurb">{lesson.blurb}</p>}
      </header>

      <div className="lesson-body">{children}</div>

      <div className="lesson-nav">
        {prev ? (
          <Link className="ln-side" to={prev.route}>
            <span className="ln-dir">← Previous</span>
            <span className="ln-name">{prev.title}</span>
          </Link>
        ) : (
          <Link className="ln-side" to={`/learn/${course.id}`}>
            <span className="ln-dir">←</span>
            <span className="ln-name">Course overview</span>
          </Link>
        )}

        <button
          type="button"
          className={'ln-complete' + (complete ? ' is-done' : '')}
          onClick={onToggleComplete}
        >
          {complete ? '✓ Completed — undo' : 'Mark complete'}
        </button>

        {next ? (
          <Link className="ln-side ln-next" to={next.route}>
            <span className="ln-dir">Next →</span>
            <span className="ln-name">{next.title}</span>
          </Link>
        ) : (
          <Link className="ln-side ln-next" to={`/learn/${course.id}`}>
            <span className="ln-dir">Finish →</span>
            <span className="ln-name">Back to the course</span>
          </Link>
        )}
      </div>
    </div>
  );
}
