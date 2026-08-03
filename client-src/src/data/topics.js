/* Single source of truth for the catalog.
 *
 * Each entry becomes BOTH a card on the home page and a route in the app.
 * To add an assignment:
 *   1. Create a page component under src/pages/topics/<category>/<Name>.jsx
 *      (the quickest start is to reuse <TopicPageLayout>).
 *   2. Import it here and add one entry to the `topics` array below.
 * The card, the route, and the category/tag filters all update automatically.
 */

import HelloJava from '../pages/topics/java/HelloJava';
import CollectionsDemo from '../pages/topics/java/CollectionsDemo';
import FizzBuzz from '../pages/topics/python/FizzBuzz';
import ListComprehensions from '../pages/topics/python/ListComprehensions';
import CssCardGallery from '../pages/topics/others/CssCardGallery';
import RegexTester from '../pages/topics/others/RegexTester';

// Controls the order the category pills appear in.
export const CATEGORY_ORDER = ['Java', 'Python', 'Others'];

export const topics = [
  {
    path: '/java/hello-java',
    title: 'Hello, Java',
    description: 'The starter Java assignment — a minimal program that prints a greeting.',
    category: 'Java',
    tags: ['Java', 'Basics'],
    dateAdded: '2026-08-03',
    thumbnail: null,
    Component: HelloJava,
  },
  {
    path: '/java/collections-demo',
    title: 'Collections Demo',
    description: 'Explore Lists, Sets and Maps from the Java Collections Framework.',
    category: 'Java',
    tags: ['Java', 'Collections'],
    dateAdded: '2026-07-28',
    thumbnail: null,
    Component: CollectionsDemo,
  },
  {
    path: '/python/fizzbuzz',
    title: 'FizzBuzz',
    description: 'The classic FizzBuzz — practise loops and the modulo operator.',
    category: 'Python',
    tags: ['Python', 'Logic'],
    dateAdded: '2026-08-01',
    thumbnail: null,
    Component: FizzBuzz,
  },
  {
    path: '/python/list-comprehensions',
    title: 'List Comprehensions',
    description: 'Build and filter lists in a single expressive line.',
    category: 'Python',
    tags: ['Python', 'Basics'],
    dateAdded: '2026-07-25',
    thumbnail: null,
    Component: ListComprehensions,
  },
  {
    path: '/others/css-card-gallery',
    title: 'CSS Card Gallery',
    description: 'A responsive card layout built with CSS grid and flexbox.',
    category: 'Others',
    tags: ['HTML', 'CSS'],
    dateAdded: '2026-07-30',
    thumbnail: null,
    Component: CssCardGallery,
  },
  {
    path: '/others/regex-tester',
    title: 'Regex Tester',
    description: 'A small tool to test regular expressions against sample text.',
    category: 'Others',
    tags: ['JS', 'Tools'],
    dateAdded: '2026-07-20',
    thumbnail: null,
    Component: RegexTester,
  },
];
