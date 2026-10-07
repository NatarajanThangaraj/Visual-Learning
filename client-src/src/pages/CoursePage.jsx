import { useParams, Navigate, useSearchParams } from 'react-router-dom';
import { getCourse, resolveCourseId, findLesson, activeTopicId } from '../data/courses';
import CourseTabs from '../components/course/CourseTabs';
import CourseHero from '../components/course/CourseHero';
import TopicCard from '../components/TopicCard';
import NotFoundPage from './NotFoundPage';

/* A course page: the course tabs, the course header, and the lessons of the
   topic picked in the sidebar. The topic rides in the URL (?topic=…) so it can
   be linked and survives a refresh, and it is the only state this page keeps. */
export default function CoursePage() {
  const { courseId: param } = useParams();
  const [params] = useSearchParams();
  const canonical = resolveCourseId(param);
  const course = getCourse(canonical);

  if (!course) return <NotFoundPage />;
  /* /others → /problem-solving: the lab folder is not the course id. */
  if (canonical !== param) return <Navigate to={`/${course.id}`} replace />;

  const active = activeTopicId(course, params.get('topic'));
  const module = course.modules.find(m => m.id === active) || null;

  return (
    /* The accent is set once here so the hero and the cards below read as one
       course rather than each re-declaring it. */
    <div
      className="course-page"
      style={{ '--course-accent': course.accent, '--course-accent-bg': course.accentBg }}
    >
      <CourseTabs />

      <CourseHero course={course} />

      {module && (
        <section className="topic-panel" aria-labelledby="topic-panel-title">
          <header className="topic-panel-head">
            <h2 className="topic-panel-title" id="topic-panel-title">{module.title}</h2>
            {module.summary && <p className="topic-panel-sub">{module.summary}</p>}
          </header>

          <div className="grid">
            {module.lessons.map(entry => (
              <TopicCard key={entry.id} lesson={findLesson(course.id, entry.id)} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
