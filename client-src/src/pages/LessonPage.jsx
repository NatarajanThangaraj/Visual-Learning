import { useParams, Navigate } from 'react-router-dom';
import { getCourse, findLesson, resolveCourseId } from '../data/courses';
import LessonShell from '../components/lesson/LessonShell';
import EmbeddedLab from '../components/lesson/EmbeddedLab';

export default function LessonPage() {
  const { courseId: param, lessonId } = useParams();
  const canonical = resolveCourseId(param);
  const course = getCourse(canonical);
  const lesson = findLesson(canonical, lessonId);

  /* Reached through a lab folder rather than the course id (/others/… instead
     of /problem-solving/…): same page, so send them to the canonical URL. */
  if (lesson && canonical !== param) return <Navigate to={lesson.route} replace />;

  if (!course || !lesson) return <Navigate to={course ? `/${course.id}` : '/'} replace />;

  return (
    <LessonShell course={course} lesson={lesson}>
      <EmbeddedLab lesson={lesson} />
    </LessonShell>
  );
}
