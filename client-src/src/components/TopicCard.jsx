import { Link } from 'react-router-dom';
import LessonThumb from './course/LessonThumb';

/* One lesson as a card. Two callers, one design:
 *
 *   Browse   — every lesson in the site, so the corner badge names the course
 *              and the footer names the module the lesson came from.
 *   A course — the lessons of the topic you picked, so the course and module
 *              are already known and neither is repeated on the card. */

export default function TopicCard({ lesson, inCourse = false }) {
  return (
    <Link
      className="card"
      to={lesson.route}
      style={{ '--course-accent': lesson.accent }}
    >
      <div className="thumb">
        <LessonThumb lesson={lesson} />
        {inCourse ? null : (
          <span className="cat-badge" data-cat={lesson.courseId}>{lesson.courseTitle}</span>
        )}
      </div>
      <div className="body">
        <div className="title">{lesson.title}</div>
        <div className="desc">{lesson.blurb}</div>
        <div className="footer">
          {/* On a course page the module is the tile you just clicked. */}
          {inCourse ? null : <span className="updated">{lesson.moduleTitle}</span>}
          {lesson.minutes ? <span className="updated">{lesson.minutes} min</span> : null}
        </div>
      </div>
    </Link>
  );
}
