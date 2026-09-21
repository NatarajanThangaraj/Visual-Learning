import CourseIcon from './CourseIcon';

/* The head of a course page: what this course is, and how far through it you
   are. No action button — the topics below are the action, and a single
   "Start course" competing with them only guessed at which one you wanted. */
export default function CourseHero({ course, progress }) {
  return (
    <header className="hero">
      <CourseIcon courseId={course.id} size={64} />

      <div className="hero-main">
        <div className="hero-eyebrow">
          <span className="hero-label">{course.label}</span>
          <span className="hero-sep">·</span>
          <span>{course.modules.length} topics</span>
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
    </header>
  );
}
