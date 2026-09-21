import { useParams, Navigate, useSearchParams } from 'react-router-dom';
import { getCourse, resolveCourseId, findLesson } from '../data/courses';
import { useProgress } from '../hooks/useProgress';
import CourseHero from '../components/course/CourseHero';
import TopicTiles from '../components/course/TopicTiles';
import TopicCard from '../components/TopicCard';
import NotFoundPage from './NotFoundPage';

/* A course page is its topics: a grid of every module, and the lessons of the
   one you picked shown underneath in the same card grid Browse uses.
   The choice rides in the URL (?topic=…) so a topic can be linked and survives
   a refresh, and it is the only state this page keeps. */
export default function CoursePage() {
  const { courseId: param } = useParams();
  const [params, setParams] = useSearchParams();
  const canonical = resolveCourseId(param);
  const course = getCourse(canonical);
  const { isComplete, isUnlocked, courseProgress, moduleProgress, nextLesson } = useProgress();

  if (!course) return <NotFoundPage />;
  /* /others → /problem-solving: the lab folder is not the course id. */
  if (canonical !== param) return <Navigate to={`/${course.id}`} replace />;

  const progress = courseProgress(course.id);
  const next = nextLesson(course.id);

  /* Default to the topic the learner is actually in, so the page opens on the
     work in front of them rather than on chapter one every time. */
  const requested = params.get('topic');
  const active =
    course.modules.find(m => m.id === requested)?.id
    ?? course.modules.find(m => m.id === next?.moduleId)?.id
    ?? course.modules[0]?.id
    ?? null;

  const module = course.modules.find(m => m.id === active) || null;

  const selectTopic = id => {
    const nextParams = new URLSearchParams(params);
    nextParams.set('topic', id);
    setParams(nextParams, { replace: true });
  };

  /* done → current (the one lesson "up next") → locked → open. */
  const statusOf = lessonId => {
    const key = `${course.id}/${active}/${lessonId}`;
    if (isComplete(key)) return 'done';
    if (!isUnlocked(course.id, key)) return 'locked';
    if (next && next.key === key) return 'current';
    return 'open';
  };

  return (
    /* The accent is set once here so the hero, the tiles and the cards below
       all read as one course rather than each re-declaring it. */
    <div
      className="course-page"
      style={{ '--course-accent': course.accent, '--course-accent-bg': course.accentBg }}
    >
      <CourseHero course={course} progress={progress} />

      <TopicTiles
        modules={course.modules}
        active={active}
        onSelect={selectTopic}
        progressOf={moduleId => moduleProgress(course.id, moduleId)}
      />

      {module && (
        <section
          className="topic-panel"
          id={`topic-panel-${module.id}`}
          role="tabpanel"
          aria-labelledby={`topic-tab-${module.id}`}
        >
          <header className="topic-panel-head">
            <h2 className="topic-panel-title">{module.title}</h2>
            {module.summary && <p className="topic-panel-sub">{module.summary}</p>}
          </header>

          <section className="grid">
            {module.lessons.map(entry => (
              <TopicCard
                key={entry.id}
                lesson={findLesson(course.id, entry.id)}
                status={statusOf(entry.id)}
              />
            ))}
          </section>
        </section>
      )}
    </div>
  );
}
