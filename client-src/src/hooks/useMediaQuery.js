import { useSyncExternalStore } from 'react';

/* Small matchMedia binding — used to swap the embedded lab for a full-screen
   hand-off on narrow screens, where an iframe inside a scrolling page is
   genuinely unusable. */
export function useMediaQuery(query) {
  return useSyncExternalStore(
    cb => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', cb);
      return () => mql.removeEventListener('change', cb);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}
