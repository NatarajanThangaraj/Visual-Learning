import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="notfound">
      <h1>404</h1>
      <p>That page isn’t part of any course.</p>
      <Link className="nf-btn" to="/">← Back to the courses</Link>
    </div>
  );
}
