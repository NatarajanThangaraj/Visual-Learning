import { useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { getCourse, findLesson, neighbours } from '../data/courses';
import { useProgress } from '../hooks/useProgress';
import LessonShell from '../components/lesson/LessonShell';
import EmbeddedLab from '../components/lesson/EmbeddedLab';

export default function LessonPage() {
  const { courseId, moduleId, lessonId } = useParams();
  const course = getCourse(courseId);
  const lesson = findLesson(courseId, moduleId, lessonId);
  const { isComplete, isUnlocked, markComplete, clearComplete, touch } = useProgress();

  const key = lesson?.key;

  // Remember where the learner was, so Continue and the sidebar stay honest.
  useEffect(() => {
    if (key) touch(key, courseId);
  }, [key, courseId, touch]);

  if (!course || !lesson) return <Navigate to={course ? `/learn/${course.id}` : '/'} replace />;
  // Deep link into a locked lesson: send them back to the path rather than 404.
  if (!isUnlocked(courseId, key)) return <Navigate to={`/learn/${courseId}`} replace />;

  const complete = isComplete(key);
  const { prev, next } = neighbours(courseId, key);

  return (
    <LessonShell
      course={course}
      lesson={lesson}
      prev={prev}
      next={next}
      complete={complete}
      onToggleComplete={() => (complete ? clearComplete(key) : markComplete(key, courseId))}
    >
      <EmbeddedLab lesson={lesson} />
    </LessonShell>
  );
}
