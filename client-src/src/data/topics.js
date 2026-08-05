/* Single source of truth for the catalog.
 *
 * Each entry becomes a card on the home page (and, for in-app React pages, a
 * route in the app). To add an assignment as a standalone static page:
 *   1. Drop its self-contained folder under public/<category>/<slug>/index.html.
 *   2. Add one entry below with `external: true` and a `path` ending in
 *      /index.html. Optionally point `thumbnail` at a preview image in the same
 *      folder so the card shows the project's real home page.
 * The card and the category/tag filters update automatically.
 */

// Controls the order the category pills appear in.
export const CATEGORY_ORDER = ['Java', 'Python', 'Others'];

export const topics = [
  {
    // Standalone, self-contained HTML page hosted verbatim under public/.
    // `external: true` makes its card a plain link to the static file instead
    // of an in-app React route — see TopicCard.jsx and App.jsx.
    path: '/java/riya-job-hunt/index.html',
    external: true,
    title: "Riya's Job Hunt",
    description: 'An interactive 13-scene story deck for learning Java String methods — read the story, guess the method, then flip.',
    category: 'Java',
    tags: ['Java', 'Strings'],
    dateAdded: '2026-08-04',
    thumbnail: null,
  },
  {
    path: '/java/fraud-detective/index.html',
    external: true,
    title: 'Bank Fraud Detective',
    description: 'Play the fraud analyst: dissect a suspicious transaction with Java String methods, expose every red flag, then approve or reject.',
    category: 'Java',
    tags: ['Java', 'Strings'],
    dateAdded: '2026-08-05',
    thumbnail: '/java/fraud-detective/thumb.png',
  },
  {
    path: '/java/lifecare-hospital/index.html',
    external: true,
    title: 'LifeCare Hospital',
    description: 'A 10-department hospital adventure where each real-world problem teaches one Java String method — from registration to the dashboard.',
    category: 'Java',
    tags: ['Java', 'Strings'],
    dateAdded: '2026-08-05',
    thumbnail: '/java/lifecare-hospital/thumb.png',
  },
  {
    path: '/java/monster-battle/index.html',
    external: true,
    title: 'Monster Battle Academy',
    description: 'Design a monster battle game step by step — learn how objects model real things by deciding what every monster needs.',
    category: 'Java',
    tags: ['Java', 'Objects'],
    dateAdded: '2026-08-05',
    thumbnail: '/java/monster-battle/thumb.png',
  },
  {
    path: '/java/smart-data-guardian/index.html',
    external: true,
    title: 'Smart Data Guardian',
    description: 'Build a 7-day mobile data checker by doing — variables, conditionals, loops and a running total, one stage at a time.',
    category: 'Java',
    tags: ['Java', 'Logic'],
    dateAdded: '2026-08-05',
    thumbnail: '/java/smart-data-guardian/thumb.png',
  },
];
