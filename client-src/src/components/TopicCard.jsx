import { Link } from 'react-router-dom';
import LessonThumb from './course/LessonThumb';

/* One result on the Browse page. Links to the in-app lesson route, so a lab
   opened from here still arrives inside its course chrome. */
export default function TopicCard({ lesson }) {
  return (
    <Link className="card" to={lesson.route} style={{ '--course-accent': lesson.accent }}>
      <div className="thumb">
        <LessonThumb lesson={lesson} />
        <span className="cat-badge" data-cat={lesson.courseId}>{lesson.courseTitle}</span>
      </div>
      <div className="body">
        <div className="title">{lesson.title}</div>
        <div className="desc">{lesson.blurb}</div>
        <div className="footer">
          <span className="updated">{lesson.moduleTitle}</span>
          {lesson.minutes ? <span className="updated">{lesson.minutes} min</span> : null}
        </div>
      </div>
    </Link>
  );
}
