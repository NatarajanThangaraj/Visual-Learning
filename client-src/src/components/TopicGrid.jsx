import TopicCard from './TopicCard';

export default function TopicGrid({ items }) {
  if (items.length === 0) {
    return (
      <section className="grid">
        <div className="empty">
          <h2>No matches</h2>
          <p>Try a different search or course.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="grid" aria-live="polite">
      {items.map(l => <TopicCard key={l.key} lesson={l} />)}
    </section>
  );
}
