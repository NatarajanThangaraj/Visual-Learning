/* Category pills with live counts. `categories` is an ordered array of
   { name, count }; `active` is the selected category name or 'all'. */
export default function CategoryFilter({ categories, total, active, onSelect }) {
  return (
    <nav className="categories" aria-label="Filter by category">
      <Pill cat="all" label="All" count={total} active={active === 'all'} onSelect={onSelect} />
      {categories.map(c => (
        <Pill
          key={c.name}
          cat={c.name}
          label={c.name}
          count={c.count}
          active={active === c.name}
          onSelect={onSelect}
        />
      ))}
    </nav>
  );
}

function Pill({ cat, label, count, active, onSelect }) {
  return (
    <button
      type="button"
      className="cat-pill"
      data-cat={cat}
      aria-pressed={active}
      onClick={() => onSelect(cat)}
    >
      <span className="dot" />
      {label}
      <span className="count">{count}</span>
    </button>
  );
}
