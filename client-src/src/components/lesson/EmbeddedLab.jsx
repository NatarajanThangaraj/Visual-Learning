import { useMediaQuery } from '../../hooks/useMediaQuery';
import LessonThumb from '../course/LessonThumb';

/* A lab is one of the self-contained pages under public/. On a desktop it runs
   inside the lesson chrome so the course frame (breadcrumb, next, mark
   complete) stays put; on a phone that nested scroll is unusable, so the lab
   is handed over full-screen instead. */
export default function EmbeddedLab({ lesson }) {
  const narrow = useMediaQuery('(max-width: 900px)');

  if (narrow) {
    return (
      <div className="lab-handoff">
        <LessonThumb lesson={lesson} />
        <p className="lab-handoff-text">
          This lab runs best full screen. It opens in a new tab — come back here to mark it complete.
        </p>
        <a className="lab-open-btn" href={lesson.src} target="_blank" rel="noopener noreferrer">
          Start the lab ↗
        </a>
      </div>
    );
  }

  return (
    <div className="lab-frame">
      <div className="lab-frame-bar">
        <span className="lab-frame-title">{lesson.title}</span>
        <a className="lab-frame-open" href={lesson.src} target="_blank" rel="noopener noreferrer">
          Open in a new tab ↗
        </a>
      </div>
      <iframe className="lab-iframe" src={lesson.src} title={lesson.title} loading="lazy" />
    </div>
  );
}
