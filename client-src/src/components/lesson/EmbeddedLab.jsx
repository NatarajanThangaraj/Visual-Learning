import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import LessonThumb from '../course/LessonThumb';

/* A lab is one of the self-contained pages under public/. On a desktop it runs
   inside the lesson chrome so the course frame (breadcrumb, next, mark
   complete) stays put; on a phone that nested scroll is unusable, so the lab
   is handed over full-screen instead.

   Two paths, and they are not interchangeable: `lesson.src` is the file, only
   ever fetched; `lesson.labRoute` is the clean URL a person is sent to. Never
   link to the file — that is what put /…/index.html in the address bar.

   The host serves every file with `X-Frame-Options: DENY`, which blocks an
   <iframe src> even same-origin. So the lab is fetched and handed to the frame
   as `srcdoc` instead: no HTTP response is being framed, so the header never
   applies. A <base> is injected so any relative URL inside a lab still
   resolves against the lab's own folder rather than the course route. */

const dirOf = src => src.slice(0, src.lastIndexOf('/') + 1);

/* The <base> above has one nasty side effect, and only in Firefox.

   The frame's document URL is `about:srcdoc`, but an href is resolved against
   the *base* URL — so `<a href="#/demo">` resolves to
   https://host/labs/java/quotesogram/#/demo. Chrome still treats that click as
   a same-document fragment change. Firefox treats it as a real navigation to
   another URL, the host answers with `X-Frame-Options: DENY`, and the lab is
   replaced by "Firefox Can't Open This Page" — the very header the srcdoc
   trick exists to dodge.

   Assigning `location.hash` is resolved against the document URL instead, so it
   stays inside the frame in both browsers. This turns every in-page fragment
   click into that assignment. A lab that routes its own anchors still wins:
   it calls preventDefault, and we leave a defaultPrevented event alone. */
const FRAGMENT_LINK_FIX = `<script>(function () {
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target && e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || a.target || a.hasAttribute('download')) return;
    var href = a.getAttribute('href');
    if (!href) return;
    e.preventDefault();
    if (href === '#') { window.scrollTo(0, 0); return; }
    location.hash = href;
  });
}());<\/script>`;

/** Put a <base> right after <head> so relative URLs keep working under srcdoc. */
function withBase(html, src) {
  const head = `<base href="${dirOf(src)}">${FRAGMENT_LINK_FIX}`;
  return /<head[^>]*>/i.test(html)
    ? html.replace(/<head[^>]*>/i, m => m + head)
    : head + html;
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

const iconProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: '2',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': 'true',
};

/* Full screen is the mode a learner reaches for to make the lab bigger, but a
   lab is a fixed-width card inside a full-width body: give it a 2560px screen
   and the card stays exactly the same size and just floats in more emptiness.
   Measuring "what the lab really wants to be" is guesswork — a full-width
   wrapper around a narrow card measures full-width — so instead of guessing,
   the lab is laid out at a nominal desktop width and that whole viewport is
   scaled up to fill the screen.
 *
 * So on a laptop nothing changes (the screen is at or below nominal and the
 * lab renders 1:1); on a large display everything in the lab gets bigger
 * together, which is what asking for full screen meant. `transform` rather
 * than `zoom`: it is uniform, it is reversible in one line, and the browser
 * maps pointer coordinates through it, so the lab's own controls still work. */
const NOMINAL_WIDTH = 1280;
const MAX_SCALE = 1.6;

function useFitToFrame(ref, active) {
  useEffect(() => {
    const frame = ref.current;
    if (!frame) return undefined;

    const reset = () => {
      frame.style.width = '';
      frame.style.height = '';
      frame.style.flex = '';
      frame.style.transform = '';
      frame.style.transformOrigin = '';
    };

    const apply = () => {
      reset();
      if (!active) return;

      /* Measured after the reset, so this is the box the lab would fill on
         its own — the frame in full screen, the whole viewport standalone. */
      const { width, height } = frame.getBoundingClientRect();
      const scale = Math.min(width / NOMINAL_WIDTH, MAX_SCALE);
      if (!width || scale <= 1.02) return;

      frame.style.flex = 'none';
      frame.style.width = `${width / scale}px`;
      frame.style.height = `${height / scale}px`;
      frame.style.transformOrigin = 'top left';
      frame.style.transform = `scale(${scale})`;
    };

    apply();
    window.addEventListener('resize', apply);
    return () => {
      window.removeEventListener('resize', apply);
      reset();
    };
  }, [ref, active]);
}

/** Fetch a lab and hand it back ready for srcdoc. `enabled` is false when the
 *  lab is not going to be framed at all, so a phone never downloads it. */
function useLabDoc(src, enabled) {
  const [doc, setDoc] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!enabled) return undefined;
    let live = true;
    setDoc(null);
    setFailed(false);

    fetch(src)
      .then(r => (r.ok ? r.text() : Promise.reject(new Error(String(r.status)))))
      .then(html => { if (live) setDoc(withBase(html, src)); })
      .catch(() => { if (live) setFailed(true); });

    return () => { live = false; };
  }, [src, enabled]);

  return [doc, failed];
}

export default function EmbeddedLab({ lesson, standalone = false }) {
  const narrow = useMediaQuery('(max-width: 900px)') && !standalone;
  const frameRef = useRef(null);
  const labRef = useRef(null);
  const [native, pinned, toggleFull] = useFullscreen(frameRef);
  const full = native || pinned;
  const [doc, failed] = useLabDoc(lesson.src, !narrow);

  /* Scale the lab to the space it has whenever it owns the screen — the
     standalone route always, the framed lab only once it is full screen. */
  useFitToFrame(labRef, standalone || full);

  /* Standalone is the hand-off target: the lab already owns the viewport, so
     there is no bar to add and nowhere further to go full screen to. */
  if (standalone) {
    return failed ? (
      <div className="lab-frame-fallback">
        <p>This lab could not be loaded.</p>
      </div>
    ) : (
      <iframe
        ref={labRef}
        className="lab-iframe"
        srcDoc={doc ?? ''}
        title={lesson.title}
        allow="fullscreen"
      />
    );
  }

  if (narrow) {
    return (
      <div className="lab-handoff">
        <LessonThumb lesson={lesson} />
        <p className="lab-handoff-text">
          This lab runs best full screen. It opens in a new tab — come back here to mark it complete.
        </p>
        <Link className="lab-open-btn" to={lesson.labRoute}>
          Start the lab →
        </Link>
      </div>
    );
  }

  return (
    <div
      className={`lab-frame${native ? ' is-full' : ''}${pinned ? ' is-pinned' : ''}`}
      ref={frameRef}
    >
      {/* Both controls live in the bar rather than floating over the lab: a lab
          fills the frame edge to edge, so anything overlaying it sits on top of
          the lab's own UI. */}
      <div className="lab-frame-bar">
        {/* Not the lesson name — the page H1 two lines above already says it. */}
        <span className="lab-frame-title">Lab</span>

        <div className="lab-tools">
          <Link
            className="lab-tool"
            to={lesson.labRoute}
            target="_blank"
            rel="noopener noreferrer"
            title="Open this lab in a new tab"
          >
            <svg {...iconProps}>
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <path d="M15 3h6v6M10 14 21 3" />
            </svg>
            <span>New tab</span>
          </Link>

          <button
            type="button"
            className="lab-tool lab-tool-icon"
            onClick={toggleFull}
            aria-label={full ? 'Exit full screen' : 'View full screen'}
            title={full ? 'Exit full screen' : 'View full screen'}
          >
            {full ? (
              <svg {...iconProps}>
                <path d="M9 3v6H3M15 3v6h6M9 21v-6H3M15 21v-6h6" />
              </svg>
            ) : (
              <svg {...iconProps}>
                <path d="M3 9V3h6M21 9V3h-6M3 15v6h6M21 15v6h-6" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {failed ? (
        <div className="lab-frame-fallback">
          <p>This lab could not be loaded here.</p>
          <Link className="lab-open-btn" to={lesson.labRoute} target="_blank" rel="noopener noreferrer">
            Open it in a new tab ↗
          </Link>
        </div>
      ) : (
        <iframe
          ref={labRef}
          className="lab-iframe"
          srcDoc={doc ?? ''}
          title={lesson.title}
          allow="fullscreen"
        />
      )}
    </div>
  );
}
