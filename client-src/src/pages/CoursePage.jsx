import { useParams, Navigate, useSearchParams } from 'react-router-dom';
import { getCourse, resolveCourseId, findLesson } from '../data/courses';
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

  if (!course) return <NotFoundPage />;
  /* /others → /problem-solving: the lab folder is not the course id. */
  if (canonical !== param) return <Navigate to={`/${course.id}`} replace />;

  const requested = params.get('topic');
  const active =
    course.modules.find(m => m.id === requested)?.id
    ?? course.modules[0]?.id
    ?? null;

  const module = course.modules.find(m => m.id === active) || null;

  const selectTopic = id => {
    const nextParams = new URLSearchParams(params);
    nextParams.set('topic', id);
    setParams(nextParams, { replace: true });
  };

  return (
    /* The accent is set once here so the hero, the tiles and the cards below
       all read as one course rather than each re-declaring it. */
    <div
      className="course-page"
      style={{ '--course-accent': course.accent, '--course-accent-bg': course.accentBg }}
    >
      <CourseHero course={course} />

      <TopicTiles
        modules={course.modules}
        active={active}
        onSelect={selectTopic}
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
                inCourse
              />
            ))}
          </section>
        </section>
      )}
    </div>
  );
}
