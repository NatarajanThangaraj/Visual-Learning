import { Link } from 'react-router-dom';
import defaultThumb from '../assets/default-thumb.svg';
import javaThumb from '../assets/thumb-java.svg';
import pythonThumb from '../assets/thumb-python.svg';
import othersThumb from '../assets/thumb-others.svg';

const THUMBS = { Java: javaThumb, Python: pythonThumb, Others: othersThumb };

export default function TopicCard({ topic }) {
  const { path, title, category, thumbnail, external } = topic;
  const thumb = thumbnail || THUMBS[category] || defaultThumb;

  // External topics are standalone static pages (not in-app React routes), so
  // they use a plain anchor that triggers a real navigation to the file.
  const CardTag = external ? 'a' : Link;
  const linkProps = external ? { href: path } : { to: path };

  return (
    <CardTag className="card" {...linkProps}>
      <div className="thumb">
        <img src={thumb} alt="" loading="lazy" />
      </div>
      <div className="body">
        <div className="title">{title || path}</div>
      </div>
    </CardTag>
  );
}
