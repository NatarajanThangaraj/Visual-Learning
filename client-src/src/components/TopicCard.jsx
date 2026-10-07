import { Link } from 'react-router-dom';
import LessonThumb from './course/LessonThumb';

/* One lesson as a card: its screenshot and its title, nothing else. */
export default function TopicCard({ lesson }) {
  return (
    <Link className="card" to={lesson.route}>
      <div className="thumb">
        <LessonThumb lesson={lesson} />
      </div>
      <div className="body">
        <div className="title">{lesson.title}</div>
      </div>
    </Link>
  );
}
