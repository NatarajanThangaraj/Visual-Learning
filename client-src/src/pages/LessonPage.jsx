import { useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { getCourse, findLesson, neighbours, resolveCourseId } from '../data/courses';
import { useProgress } from '../hooks/useProgress';
import LessonShell from '../components/lesson/LessonShell';
import EmbeddedLab from '../components/lesson/EmbeddedLab';

export default function LessonPage() {
  const { courseId: param, lessonId } = useParams();
  const canonical = resolveCourseId(param);
  const course = getCourse(canonical);
  const lesson = findLesson(canonical, lessonId);
  const { isComplete, isUnlocked, markComplete, clearComplete, touch } = useProgress();

  const key = lesson?.key;

  // Remember where the learner was, so Continue and the sidebar stay honest.
  useEffect(() => {
    if (key) touch(key, canonical);
  }, [key, canonical, touch]);

  /* Reached through a lab folder rather than the course id (/others/… instead
     of /problem-solving/…): same page, so send them to the canonical URL. */
  if (lesson && canonical !== param) return <Navigate to={lesson.route} replace />;

  if (!course || !lesson) return <Navigate to={course ? `/${course.id}` : '/'} replace />;
  // Deep link into a locked lesson: send them back to the path rather than 404.
  if (!isUnlocked(canonical, key)) return <Navigate to={`/${canonical}`} replace />;

  const complete = isComplete(key);
  const { prev, next } = neighbours(canonical, key);

  return (
    <LessonShell
      course={course}
      lesson={lesson}
      prev={prev}
      next={next}
      complete={complete}
      onToggleComplete={() => (complete ? clearComplete(key) : markComplete(key, canonical))}
    >
      <EmbeddedLab lesson={lesson} />
    </LessonShell>
  );
}
