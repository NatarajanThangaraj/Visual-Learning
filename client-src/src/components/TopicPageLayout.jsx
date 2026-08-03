import { Link } from 'react-router-dom';

/* Shared layout for an assignment page. `codeHtml` is authored, static markup
   (syntax-highlight spans) rendered as-is. Set `placeholder={false}` once a real
   assignment replaces the dummy content. */
export default function TopicPageLayout({
  badge, title, lead, accent, accentBg, codeHtml, placeholder = true, children,
}) {
  const style = accent ? { '--accent': accent, '--accent-bg': accentBg } : undefined;
  return (
    <div className="topic-page" style={style}>
      <div className="wrap">
        <Link className="back" to="/">← Back to catalog</Link>
        <div className="panel">
          <span className="badge">{badge}</span>
          <h1>{title}</h1>
          {lead && <p className="lead">{lead}</p>}
          {codeHtml && <pre dangerouslySetInnerHTML={{ __html: codeHtml }} />}
          {children}
          {placeholder && (
            <div className="note">
              <span>🚧</span>
              <span>
                <b>Placeholder.</b> This is a dummy page so the catalog card renders and
                links correctly. Replace it with the real assignment — edit this component
                under <code>src/pages/topics/</code>.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
