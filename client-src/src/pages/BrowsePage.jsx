import { useMemo, useState } from 'react';
import { allLessons, courses } from '../data/courses';
import CategoryFilter from '../components/CategoryFilter';
import Toolbar from '../components/Toolbar';
import TopicGrid from '../components/TopicGrid';

/* The old flat catalog, kept intact for anyone who knows exactly what they
   want. Everything comes from courses.js, so it never drifts from the paths. */
export default function BrowsePage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');

  const items = useMemo(() => allLessons(), []);

  const categories = useMemo(
    () => courses.map(c => ({ name: c.title, count: items.filter(l => l.courseTitle === c.title).length })),
    [items]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(l => {
      if (category !== 'all' && l.courseTitle !== category) return false;
      if (!q) return true;
      return [l.title, l.blurb, l.courseTitle, l.moduleTitle].join(' ').toLowerCase().includes(q);
    });
  }, [items, query, category]);

  return (
    <div className="browse">
      <header className="browse-head">
        <h1>Browse everything</h1>
        <p>Every page across the three courses, in one grid.</p>
      </header>

      <CategoryFilter
        categories={categories}
        total={items.length}
        active={category}
        onSelect={setCategory}
      />

      <Toolbar query={query} onQuery={setQuery} />

      <p className="result-count" aria-live="polite">
        Showing {filtered.length} of {items.length}
      </p>

      <TopicGrid items={filtered} />
    </div>
  );
}
