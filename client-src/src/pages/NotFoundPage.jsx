import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="topic-page">
      <div className="wrap" style={{ maxWidth: 420, textAlign: 'center', margin: '40px auto' }}>
        <h1 style={{ fontSize: 64, color: 'var(--navy-900)', margin: 0 }}>404</h1>
        <p style={{ color: 'var(--text-muted)', margin: '8px 0 22px' }}>
          That page isn’t in the catalog.
        </p>
        <Link
          to="/"
          style={{
            display: 'inline-block', background: 'var(--navy-900)', color: '#fff',
            fontWeight: 700, padding: '11px 20px', borderRadius: 12,
          }}
        >
          ← Back to the catalog
        </Link>
      </div>
    </div>
  );
}
