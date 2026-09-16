import { useState } from 'react';
import { findLesson } from '../../data/courses';
import LessonNode from './LessonNode';

/* A numbered module: a header followed by its vertical lesson path.
 *
 * The header comes in two weights. A module that groups several pages gets the
 * full bordered strip — it is doing real structural work. A module that wraps a
 * single page gets an inline label instead: a full-width bar above one card
 * carries no information the card doesn't already show, and on a course page
 * with several such modules it is all the learner scrolls past. */
export default function ModuleSection({ course, module, index, statusOf, progress }) {
  const [notesOpen, setNotesOpen] = useState(false);
  const single = module.lessons.length === 1;

  return (
    <section className={'module' + (single ? ' is-single' : '')} aria-labelledby={`mod-${module.id}`}>
      <div className="module-head">
        <div className="module-head-main">
          <h2 className="module-title" id={`mod-${module.id}`}>
            <span className="module-num">{index + 1}.</span> {module.title}
          </h2>
        </div>

        <div className="module-head-right">
          <span className="module-count">{progress.done}/{progress.total} {progress.total === 1 ? 'page' : 'pages'}</span>
          {/* Labelled, not a bare icon: this toggle changes what is on the page,
              so it says so rather than making every new learner click to find out. */}
          <button
            type="button"
            className={'module-notes-btn' + (notesOpen ? ' is-on' : '')}
            onClick={() => setNotesOpen(o => !o)}
            aria-expanded={notesOpen}
            title="What this module covers"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
              <rect x="5" y="3.5" width="14" height="17" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.7" />
              <line x1="9" y1="3.5" x2="9" y2="20.5" stroke="currentColor" strokeWidth="1.7" />
            </svg>
            <span>About</span>
          </button>
        </div>
      </div>

      {notesOpen && <p className="module-notes">{module.summary}</p>}

      <ol className="lesson-path">
        {module.lessons.map((lesson, i) => (
          <LessonNode
            key={lesson.id}
            lesson={findLesson(course.id, lesson.id)}
            status={statusOf(module.id, lesson.id)}
            isLast={i === module.lessons.length - 1}
          />
        ))}
      </ol>
    </section>
  );
}
