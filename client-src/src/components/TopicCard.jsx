import { Link } from 'react-router-dom';
import defaultThumb from '../assets/default-thumb.svg';
import javaThumb from '../assets/thumb-java.svg';
import pythonThumb from '../assets/thumb-python.svg';
import othersThumb from '../assets/thumb-others.svg';

const THUMBS = { Java: javaThumb, Python: pythonThumb, Others: othersThumb };

function formatDate(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return '';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function TopicCard({ topic }) {
  const { path, title, description, category, tags = [], dateAdded, thumbnail } = topic;
  const thumb = thumbnail || THUMBS[category] || defaultThumb;

  return (
    <Link className="card" to={path}>
      <div className="thumb">
        <span className="cat-badge" data-cat={category}>{category}</span>
        <img src={thumb} alt="" loading="lazy" />
      </div>
      <div className="body">
        <div className="title">{title || path}</div>
        {description && <div className="desc">{description}</div>}
        {tags.length > 0 && (
          <div className="tags">
            {tags.map(t => <span className="tag" key={t}>{t}</span>)}
          </div>
        )}
        <div className="footer">
          <span className="updated">{dateAdded ? formatDate(dateAdded) : ''}</span>
          <span className="open">Open →</span>
        </div>
      </div>
    </Link>
  );
}
