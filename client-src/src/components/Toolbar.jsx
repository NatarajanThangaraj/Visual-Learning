/* Search for the Browse page. Fully controlled by BrowsePage. */
export default function Toolbar({ query, onQuery }) {
  return (
    <div className="toolbar">
      <label className="search">
        <span className="visually-hidden" hidden>Search</span>
        <input
          type="search"
          placeholder="Search every page…"
          autoComplete="off"
          value={query}
          onChange={e => onQuery(e.target.value)}
        />
      </label>
    </div>
  );
}
