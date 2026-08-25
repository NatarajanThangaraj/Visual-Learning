import { useState } from 'react';
import LessonNode from './LessonNode';

/* A numbered module: the header strip from the design (index, title, label,
   lesson count, notes button) followed by its vertical lesson path. */
export default function ModuleSection({ course, module, index, statusOf, progress }) {
  const [notesOpen, setNotesOpen] = useState(false);

  return (
    <section className="module" aria-labelledby={`mod-${module.id}`}>
      <div className="module-head">
        <div className="module-head-main">
          <h2 className="module-title" id={`mod-${module.id}`}>
            <span className="module-num">{index + 1}.</span> {module.title}
          </h2>
        </div>

        <div className="module-head-right">
          <span className="module-count">{progress.done}/{progress.total} {progress.total === 1 ? 'page' : 'pages'}</span>
          <button
            type="button"
            className={'module-notes-btn' + (notesOpen ? ' is-on' : '')}
            onClick={() => setNotesOpen(o => !o)}
            aria-expanded={notesOpen}
            aria-label="What this module covers"
            title="What this module covers"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <rect x="5" y="3.5" width="14" height="17" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.7" />
              <line x1="9" y1="3.5" x2="9" y2="20.5" stroke="currentColor" strokeWidth="1.7" />
            </svg>
          </button>
        </div>
      </div>

      {notesOpen && <p className="module-notes">{module.summary}</p>}

      <ol className="lesson-path">
        {module.lessons.map((lesson, i) => (
          <LessonNode
            key={lesson.id}
            lesson={{
              ...lesson,
              courseId: course.id,
              route: `/learn/${course.id}/${module.id}/${lesson.id}`,
            }}
            status={statusOf(module.id, lesson.id)}
            isLast={i === module.lessons.length - 1}
          />
        ))}
      </ol>
    </section>
  );
}
