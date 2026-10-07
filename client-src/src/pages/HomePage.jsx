import { Link } from 'react-router-dom';
import { courses, courseLessonCount, totalLessonCount } from '../data/courses';
import CourseIcon from '../components/course/CourseIcon';

/* The front door: pick a course. */
export default function HomePage() {
  const total = totalLessonCount();

  return (
    <div className="home">
      <header className="home-head">
        <span className="home-eyebrow">Zoho Schools</span>
        <h1 className="home-title">Learn by building things that behave like the real world.</h1>
        <p className="home-lead">
          Three courses, {total} interactive pages. Pick a language and open any page you like.
        </p>
      </header>

      <div className="course-cards">
        {courses.map(course => {
          const pages = courseLessonCount(course.id);
          const modules = course.modules.length;
          return (
            <Link
              key={course.id}
              className="ccard"
              to={`/${course.id}`}
              style={{ '--course-accent': course.accent, '--course-accent-bg': course.accentBg }}
            >
              <CourseIcon courseId={course.id} size={52} />
              <span className="ccard-title">{course.title}</span>
              <span className="ccard-tagline">{course.tagline}</span>

              <span className="ccard-meta">
                {modules} modules · {pages} pages
              </span>

              <span className="ccard-cta">
                Open course
                <span aria-hidden="true"> →</span>
              </span>
            </Link>
          );
        })}
      </div>

      <p className="home-foot">
        Looking for one specific page? <Link to="/browse">Browse all {total} pages →</Link>
      </p>
    </div>
  );
}
