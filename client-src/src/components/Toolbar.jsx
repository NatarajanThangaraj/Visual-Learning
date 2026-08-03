/* Search box + tag dropdown + grid/list toggle. Fully controlled by HomePage. */
export default function Toolbar({ query, onQuery, tag, onTag, tags, view, onToggleView }) {
  const isList = view === 'list';
  return (
    <div className="toolbar">
      <label className="search">
        <span className="visually-hidden" hidden>Search</span>
        <input
          type="search"
          placeholder="Search assignments…"
          autoComplete="off"
          value={query}
          onChange={e => onQuery(e.target.value)}
        />
      </label>

      <select
        className="filter-select"
        aria-label="Filter by tag"
        value={tag}
        onChange={e => onTag(e.target.value)}
      >
        <option value="all">All tags</option>
        {tags.map(t => <option key={t} value={t}>{t}</option>)}
      </select>

      <button
        type="button"
        className="view-toggle"
        aria-pressed={isList}
        aria-label="Toggle grid or list view"
        onClick={onToggleView}
      >
        <span className="vt-icon" aria-hidden="true">{isList ? '⊞' : '⊟'}</span>
        <span className="vt-label">{isList ? 'Grid' : 'List'}</span>
      </button>
    </div>
  );
}
