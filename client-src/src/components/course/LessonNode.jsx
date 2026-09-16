import { Link } from 'react-router-dom';
import LessonThumb from './LessonThumb';

/* One icon per state, and only one — the dot has to be readable at a glance
   down a long path, which it isn't if two states both mean "start this".
   done = a tick, current = play (act on this now), open = an empty step,
   locked = a lock. Colour carries the same information (course.css), so the
   states stay distinguishable without relying on hue alone. */
const ICON = {
  done: (
    <svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  current: (
    <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
      <path d="M9 6.5l9 5.5-9 5.5z" fill="currentColor" />
    </svg>
  ),
  open: (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
      <circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  locked: (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <rect x="5.5" y="10.5" width="13" height="9" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8.5 10.5V8a3.5 3.5 0 017 0v2.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  ),
};

const LABEL = { done: 'Completed', current: 'Up next', locked: 'Locked', open: 'Not started' };

/* One step on the course path: the rail, the status circle, and the lesson
   card. `status` is one of done | current | open | locked. */
export default function LessonNode({ lesson, status, isLast }) {
  const locked = status === 'locked';

  const card = (
    <>
      <LessonThumb lesson={lesson} />
      <span className="lnode-body">
        <span className="lnode-title">{lesson.title}</span>
        <span className="lnode-blurb">{lesson.blurb}</span>
        {lesson.minutes ? <span className="lnode-min">{lesson.minutes} min</span> : null}
      </span>
      <span className="lnode-go" aria-hidden="true">{locked ? '' : '→'}</span>
    </>
  );

  return (
    <li className={`lnode is-${status}`}>
      <span className="lnode-rail" aria-hidden="true">
        <span className="lnode-dot" title={LABEL[status]}>{ICON[status]}</span>
        {!isLast && <span className="lnode-line" />}
      </span>

      {locked ? (
        <span className="lnode-card is-locked" aria-disabled="true" title="Finish the lesson before this one to unlock it">
          {card}
        </span>
      ) : (
        <Link className="lnode-card" to={lesson.route}>
          {card}
        </Link>
      )}

      <span className="visually-hidden">{LABEL[status]}</span>
    </li>
  );
}
