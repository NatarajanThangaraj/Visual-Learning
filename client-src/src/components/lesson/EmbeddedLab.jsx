import { useEffect, useRef, useState } from 'react';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import LessonThumb from '../course/LessonThumb';

/* A lab is one of the self-contained pages under public/. On a desktop it runs
   inside the lesson chrome so the course frame (breadcrumb, next, mark
   complete) stays put; on a phone that nested scroll is unusable, so the lab
   is handed over full-screen instead.

   The host serves every file with `X-Frame-Options: DENY`, which blocks an
   <iframe src> even same-origin. So the lab is fetched and handed to the frame
   as `srcdoc` instead: no HTTP response is being framed, so the header never
   applies. A <base> is injected so any relative URL inside a lab still
   resolves against the lab's own folder rather than the course route. */

const dirOf = src => src.slice(0, src.lastIndexOf('/') + 1);

/** Put a <base> right after <head> so relative URLs keep working under srcdoc. */
function withBase(html, src) {
  const base = `<base href="${dirOf(src)}">`;
  return /<head[^>]*>/i.test(html)
    ? html.replace(/<head[^>]*>/i, m => m + base)
    : base + html;
}

/* Native fullscreen where the browser allows it; otherwise the frame is pinned
   over the page instead, so the button always does something. Both states live
   in React state — never in classList, which the next render would wipe. */
function useFullscreen(ref) {
  const [native, setNative] = useState(false);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    const sync = () => {
      const on = Boolean(document.fullscreenElement || document.webkitFullscreenElement);
      setNative(on);
      if (on) setPinned(false);
    };
    document.addEventListener('fullscreenchange', sync);
    document.addEventListener('webkitfullscreenchange', sync);
    return () => {
      document.removeEventListener('fullscreenchange', sync);
      document.removeEventListener('webkitfullscreenchange', sync);
    };
  }, []);

  /* Escape leaves the pinned fallback, matching what Escape does in real
     fullscreen — otherwise the frame would look stuck. */
  useEffect(() => {
    if (!pinned) return undefined;
    const onKey = e => { if (e.key === 'Escape') setPinned(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [pinned]);

  const toggle = () => {
    const el = ref.current;
    if (!el) return;

    if (document.fullscreenElement || document.webkitFullscreenElement) {
      (document.exitFullscreen || document.webkitExitFullscreen)?.call(document);
      return;
    }
    if (pinned) { setPinned(false); return; }

    const request = el.requestFullscreen || el.webkitRequestFullscreen;
    if (!request) { setPinned(true); return; }
    try {
      Promise.resolve(request.call(el)).catch(() => setPinned(true));
    } catch {
      setPinned(true);
    }
  };

  return [native, pinned, toggle];
}

export default function EmbeddedLab({ lesson }) {
  const narrow = useMediaQuery('(max-width: 900px)');
  const frameRef = useRef(null);
  const [native, pinned, toggleFull] = useFullscreen(frameRef);
  const full = native || pinned;
  const [doc, setDoc] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (narrow) return undefined;
    let live = true;
    setDoc(null);
    setFailed(false);

    fetch(lesson.src)
      .then(r => (r.ok ? r.text() : Promise.reject(new Error(String(r.status)))))
      .then(html => { if (live) setDoc(withBase(html, lesson.src)); })
      .catch(() => { if (live) setFailed(true); });

    return () => { live = false; };
  }, [lesson.src, narrow]);

  if (narrow) {
    return (
      <div className="lab-handoff">
        <LessonThumb lesson={lesson} />
        <p className="lab-handoff-text">
          This lab runs best full screen. It opens in a new tab — come back here to mark it complete.
        </p>
        <a className="lab-open-btn" href={lesson.src} target="_blank" rel="noopener noreferrer">
          Start the lab ↗
        </a>
      </div>
    );
  }

  return (
    <div
      className={`lab-frame${native ? ' is-full' : ''}${pinned ? ' is-pinned' : ''}`}
      ref={frameRef}
    >
      <div className="lab-frame-bar">
        <span className="lab-frame-title">{lesson.title}</span>
      </div>

      {failed ? (
        <div className="lab-frame-fallback">
          <p>This lab could not be loaded here.</p>
          <a className="lab-open-btn" href={lesson.src} target="_blank" rel="noopener noreferrer">
            Open it in a new tab ↗
          </a>
        </div>
      ) : (
        <iframe
          className="lab-iframe"
          srcDoc={doc ?? ''}
          title={lesson.title}
          allow="fullscreen"
        />
      )}

      <button
        type="button"
        className="lab-full-btn"
        onClick={toggleFull}
        aria-label={full ? 'Exit full screen' : 'View full screen'}
        title={full ? 'Exit full screen' : 'View full screen'}
      >
        {full ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
               strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 3v6H3M15 3v6h6M9 21v-6H3M15 21v-6h6" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
               strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 9V3h6M21 9V3h-6M3 15v6h6M21 15v6h-6" />
          </svg>
        )}
      </button>
    </div>
  );
}
