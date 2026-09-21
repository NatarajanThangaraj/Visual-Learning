import { Link } from 'react-router-dom';
import LessonThumb from './course/LessonThumb';

/* One lesson as a card. Two callers, one design:
 *
 *   Browse   — every lesson in the site, so the corner badge names the course
 *              and the footer names the module the lesson came from.
 *   A course — the lessons of the topic you picked, so the course and module
 *              are already known; the badge carries the lesson's status
 *              instead, and a locked lesson is not a link.
 *
 * `status` is what separates them: absent on Browse, one of
 * done | current | open | locked on a course page. */

const STATUS_LABEL = { done: 'Completed', current: 'Up next', open: 'Not started', locked: 'Locked' };

export default function TopicCard({ lesson, status = null }) {
  const locked = status === 'locked';

  const inner = (
    <>
      <div className="thumb">
        <LessonThumb lesson={lesson} />
        {status ? (
          <span className="cat-badge" data-status={status}>{STATUS_LABEL[status]}</span>
        ) : (
          <span className="cat-badge" data-cat={lesson.courseId}>{lesson.courseTitle}</span>
        )}
      </div>
      <div className="body">
        <div className="title">{lesson.title}</div>
        <div className="desc">{lesson.blurb}</div>
        <div className="footer">
          {/* On a course page the module is the tile you just clicked. */}
          {status ? null : <span className="updated">{lesson.moduleTitle}</span>}
          {lesson.minutes ? <span className="updated">{lesson.minutes} min</span> : null}
        </div>
      </div>
    </>
  );

  if (locked) {
    return (
      <span
        className="card is-locked"
        aria-disabled="true"
        title="Finish the lesson before this one to unlock it"
      >
        {inner}
      </span>
    );
  }

  return (
    <Link
      className={'card' + (status ? ` is-${status}` : '')}
      to={lesson.route}
      style={{ '--course-accent': lesson.accent }}
    >
      {inner}
    </Link>
  );
}
