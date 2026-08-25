import { Link } from 'react-router-dom';
import LessonThumb from './LessonThumb';

const ICON = {
  done: (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path d="M2 13l4 4 8-9" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 13l4 4 8-9" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  current: (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 7.5V12l3 2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  locked: (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <rect x="5.5" y="10.5" width="13" height="9" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8.5 10.5V8a3.5 3.5 0 017 0v2.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  ),
  open: (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path d="M9 7l8 5-8 5z" fill="currentColor" />
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
        <span className="lnode-dot">{ICON[status]}</span>
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
