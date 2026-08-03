import TopicCard from './TopicCard';

export default function TopicGrid({ items, view, hasTopics }) {
  if (items.length === 0) {
    return (
      <section className="grid">
        <div className="empty">
          <h2>{hasTopics ? 'No matches' : 'No assignments yet'}</h2>
          <p>
            {hasTopics
              ? 'Try a different search, category or tag.'
              : 'Add an entry to src/data/topics.js and a card will appear here.'}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className={'grid' + (view === 'list' ? ' list-view' : '')} aria-live="polite">
      {items.map(t => <TopicCard key={t.path} topic={t} />)}
    </section>
  );
}
