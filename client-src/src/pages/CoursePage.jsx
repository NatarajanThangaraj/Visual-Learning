import { useParams, Navigate } from 'react-router-dom';
import { getCourse } from '../data/courses';
import { useProgress } from '../hooks/useProgress';
import CourseHero from '../components/course/CourseHero';
import ModuleSection from '../components/course/ModuleSection';

/* The course page: hero, then every module as a numbered section with its own
   vertical lesson path. */
export default function CoursePage() {
  const { courseId } = useParams();
  const course = getCourse(courseId);
  const { isComplete, isUnlocked, courseProgress, moduleProgress, nextLesson } = useProgress();

  if (!course) return <Navigate to="/" replace />;

  const progress = courseProgress(course.id);
  const next = nextLesson(course.id);

  /* done → current (the single lesson Continue points at) → locked → open. */
  const statusOf = (moduleId, lessonId) => {
    const key = `${course.id}/${moduleId}/${lessonId}`;
    if (isComplete(key)) return 'done';
    if (!isUnlocked(course.id, key)) return 'locked';
    if (next && next.key === key) return 'current';
    return 'open';
  };

  return (
    <div className="course-page">
      <CourseHero course={course} progress={progress} next={next} />

      {course.modules.map((module, i) => (
        <ModuleSection
          key={module.id}
          course={course}
          module={module}
          index={i}
          statusOf={statusOf}
          progress={moduleProgress(course.id, module.id)}
        />
      ))}
    </div>
  );
}
