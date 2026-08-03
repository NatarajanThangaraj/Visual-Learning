import { useMemo, useState } from 'react';
import { topics, CATEGORY_ORDER } from '../data/topics';
import Header from '../components/Header';
import CategoryFilter from '../components/CategoryFilter';
import Toolbar from '../components/Toolbar';
import TopicGrid from '../components/TopicGrid';

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [tag, setTag] = useState('all');
  const [view, setView] = useState('grid');

  // Category pills with counts, in the configured order, plus any extras.
  const categories = useMemo(() => {
    const counts = {};
    topics.forEach(t => { counts[t.category] = (counts[t.category] || 0) + 1; });
    const known = CATEGORY_ORDER.filter(c => counts[c]);
    const extras = Object.keys(counts).filter(c => !CATEGORY_ORDER.includes(c)).sort();
    return [...known, ...extras].map(name => ({ name, count: counts[name] }));
  }, []);

  // Union of all tags for the dropdown.
  const tags = useMemo(() => {
    const set = new Set();
    topics.forEach(t => (t.tags || []).forEach(x => set.add(x)));
    return [...set].sort();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return topics.filter(t => {
      if (category !== 'all' && t.category !== category) return false;
      if (tag !== 'all' && !(t.tags || []).includes(tag)) return false;
      if (!q) return true;
      const hay = [t.title, t.description, t.category, ...(t.tags || [])].join(' ').toLowerCase();
      return hay.includes(q);
    });
  }, [query, category, tag]);

  return (
    <main className="page">
      <Header />

      <CategoryFilter
        categories={categories}
        total={topics.length}
        active={category}
        onSelect={setCategory}
      />

      <Toolbar
        query={query}
        onQuery={setQuery}
        tag={tag}
        onTag={setTag}
        tags={tags}
        view={view}
        onToggleView={() => setView(v => (v === 'grid' ? 'list' : 'grid'))}
      />

      <p className="result-count" aria-live="polite">
        {topics.length === 0
          ? ''
          : `Showing ${filtered.length} of ${topics.length} assignment${topics.length === 1 ? '' : 's'}`}
      </p>

      <TopicGrid items={filtered} view={view} hasTopics={topics.length > 0} />
    </main>
  );
}
