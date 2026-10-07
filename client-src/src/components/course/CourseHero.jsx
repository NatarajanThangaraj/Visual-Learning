import CourseIcon from './CourseIcon';
import { courseLessonCount } from '../../data/courses';

/* The head of a course page: what this course is. No action button — the
   topics below are the action, and a single "Start course" competing with
   them only guessed at which one you wanted. */
export default function CourseHero({ course }) {
  const total = courseLessonCount(course.id);
  return (
    <header className="hero">
      <CourseIcon courseId={course.id} size={64} />

      <div className="hero-main">
        <div className="hero-eyebrow">
          <span className="hero-label">{course.label}</span>
          <span className="hero-sep">·</span>
          <span>{course.modules.length} topics</span>
          <span className="hero-sep">·</span>
          <span>{total} {total === 1 ? 'page' : 'pages'}</span>
        </div>
        <h1 className="hero-title">{course.title}</h1>
        <p className="hero-tagline">{course.tagline}</p>
      </div>
    </header>
  );
}
