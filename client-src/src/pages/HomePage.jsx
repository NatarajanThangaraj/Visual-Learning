import { Link } from 'react-router-dom';
import { courses } from '../data/courses';
import { useProgress } from '../hooks/useProgress';
import CourseIcon from '../components/course/CourseIcon';

/* The front door: pick a course. If there is progress, the page opens with a
   card that resumes it. */
export default function HomePage() {
  const { courseProgress, nextLesson, overall } = useProgress();
  const total = overall();

  // The course with progress that isn't finished — what "resume" should mean.
  const resumeCourse = courses.find(c => {
    const p = courseProgress(c.id);
    return p.done > 0 && p.done < p.total;
  });
  const resumeLesson = resumeCourse ? nextLesson(resumeCourse.id) : null;

  return (
    <div className="home">
      <header className="home-head">
        <span className="home-eyebrow">Zoho Schools</span>
        <h1 className="home-title">Learn by building things that behave like the real world.</h1>
        <p className="home-lead">
          Three courses, {total.total} interactive pages. Pick a language and work down the path —
          each page unlocks the next.
        </p>
      </header>

      {resumeLesson && (
        <Link
          className="resume"
          to={resumeLesson.route}
          style={{ '--course-accent': resumeCourse.accent, '--course-accent-bg': resumeCourse.accentBg }}
        >
          <span className="resume-eyebrow">Pick up where you left off · {resumeCourse.title}</span>
          <span className="resume-title">{resumeLesson.title}</span>
          <span className="resume-blurb">{resumeLesson.blurb}</span>
          <span className="resume-go">Continue →</span>
        </Link>
      )}

      <div className="course-cards">
        {courses.map(course => {
          const p = courseProgress(course.id);
          const modules = course.modules.length;
          return (
            <Link
              key={course.id}
              className="ccard"
              to={`/learn/${course.id}`}
              style={{ '--course-accent': course.accent, '--course-accent-bg': course.accentBg }}
            >
              <CourseIcon courseId={course.id} size={52} />
              <span className="ccard-title">{course.title}</span>
              <span className="ccard-tagline">{course.tagline}</span>

              <span className="ccard-meta">
                {modules} modules · {p.total} pages
              </span>

              <span className="ccard-progress">
                <span className="bar"><span style={{ width: `${p.pct}%` }} /></span>
                <span className="ccard-pct">{p.done > 0 ? `${p.done}/${p.total}` : 'Start'}</span>
              </span>
            </Link>
          );
        })}
      </div>

      <p className="home-foot">
        Looking for one specific page? <Link to="/browse">Browse all {total.total} pages →</Link>
      </p>
    </div>
  );
}
