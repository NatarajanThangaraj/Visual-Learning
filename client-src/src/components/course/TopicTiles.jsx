/* The topics of a course as a grid of tiles — the course page's index.
 *
 * This replaced a vertical stack of full-width module sections. With eleven
 * modules in Java that stack was several screens of scrolling before you could
 * see what the course even covered; a grid puts every topic on one screen and
 * lets you jump straight to the one you want. Picking a tile is what chooses
 * the lessons shown below it, so these are buttons in a tablist, not links. */
export default function TopicTiles({ modules, active, onSelect }) {
  return (
    <div className="topics" role="tablist" aria-label="Topics">
      {modules.map((module, i) => {
        const count = module.lessons.length;
        const selected = module.id === active;

        return (
          <button
            key={module.id}
            type="button"
            role="tab"
            id={`topic-tab-${module.id}`}
            aria-selected={selected}
            aria-controls={`topic-panel-${module.id}`}
            className={'topic-tile' + (selected ? ' is-active' : '')}
            onClick={() => onSelect(module.id)}
          >
            <span className="topic-num">{String(i + 1).padStart(2, '0')}</span>
            <span className="topic-title">{module.title}</span>

            <span className="topic-foot">
              <span className="topic-count">
                {count} {count === 1 ? 'page' : 'pages'}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
