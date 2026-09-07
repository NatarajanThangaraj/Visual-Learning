import { useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { findLesson, resolveCourseId } from '../data/courses';
import EmbeddedLab from '../components/lesson/EmbeddedLab';

/* A lab on its own at /<course>/<lesson>/full — what "New tab" and the mobile
   hand-off open. It exists so the standalone lab has a clean URL: the file it
   runs is public/<folder>/<lesson>/index.html, and that path should never have
   to appear in anyone's address bar.

   No AppShell, no lesson chrome — just the lab and one way back. */
export default function LabPage() {
  const { courseId: param, lessonId } = useParams();
  const canonical = resolveCourseId(param);
  const lesson = findLesson(canonical, lessonId);

  /* It opens in a new tab, so the tab needs to say which lab it is. */
  useEffect(() => {
    if (!lesson) return undefined;
    const previous = document.title;
    document.title = `${lesson.title} — Visual Learning`;
    return () => { document.title = previous; };
  }, [lesson]);

  if (!lesson) return <Navigate to="/" replace />;
  if (canonical !== param) return <Navigate to={lesson.labRoute} replace />;

  return (
    <div className="lab-standalone">
      <EmbeddedLab lesson={lesson} standalone />
      <Link className="lab-standalone-back" to={lesson.route}>
        ← Back to the lesson
      </Link>
    </div>
  );
}
