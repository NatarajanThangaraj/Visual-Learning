import { Link } from 'react-router-dom';
import CourseIcon from './CourseIcon';

/* The card at the top of a course page: identity, progress and one button that
   drops the learner exactly where they stopped. */
export default function CourseHero({ course, progress, next }) {
  const started = progress.done > 0;
  const finished = progress.total > 0 && progress.done === progress.total;

  return (
    <header className="hero" style={{ '--course-accent': course.accent, '--course-accent-bg': course.accentBg }}>
      <CourseIcon courseId={course.id} size={64} />

      <div className="hero-main">
        <div className="hero-eyebrow">
          <span className="hero-label">{course.label}</span>
          <span className="hero-sep">·</span>
          <span>{progress.total} {progress.total === 1 ? 'page' : 'pages'}</span>
        </div>
        <h1 className="hero-title">{course.title}</h1>
        <p className="hero-tagline">{course.tagline}</p>

        <div className="hero-progress">
          <div className="bar">
            <span style={{ width: `${progress.pct}%` }} />
          </div>
          <span className="hero-progress-text">
            {progress.done} of {progress.total} complete
          </span>
        </div>
      </div>

      {next && (
        <Link className="hero-cta" to={next.route}>
          {finished ? 'Revisit' : started ? 'Continue' : 'Start course'}
          <span aria-hidden="true"> →</span>
        </Link>
      )}
    </header>
  );
}
