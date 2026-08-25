import javaThumb from '../../assets/thumb-java.svg';
import pythonThumb from '../../assets/thumb-python.svg';
import othersThumb from '../../assets/thumb-others.svg';
import defaultThumb from '../../assets/default-thumb.svg';

const FALLBACK = { java: javaThumb, python: pythonThumb, 'problem-solving': othersThumb };

/* A lesson's screenshot, falling back to the per-course card art for the few
   pages that don't have a thumb.png yet. */
export default function LessonThumb({ lesson }) {
  const src = lesson.thumbnail || FALLBACK[lesson.courseId] || defaultThumb;
  return (
    <span className="lthumb">
      <img src={src} alt="" loading="lazy" />
    </span>
  );
}
