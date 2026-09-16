/* Give every route a real file.
 *
 * The host serves exactly two things: a file that exists, and a directory's
 * index.html. There is no "unknown path falls back to the app" — the `404`
 * key in client-package.json is not a Catalyst feature, and the live site
 * answered /browse and /java with its own 404 page, not ours.
 *
 * So each route gets a directory with a copy of index.html in it. The router
 * then reads the URL exactly as it would have, and every deep link, refresh
 * and shared URL resolves.
 *
 * The labs live under /labs/ (see the note in data/courses.js) so they no
 * longer occupy the lesson URLs this script needs to write into.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(here, '../../client');

const { courses, allLessons } = await import('../src/data/courses.js');

function routes() {
  const seen = new Set(['/']);          // '/' is index.html already
  const add = r => { if (r && !seen.has(r)) seen.add(r); };

  add('/browse');
  add('/learn');

  for (const course of courses) {
    add(`/${course.id}`);
    add(`/learn/${course.id}`);
    /* Problem Solving's files sit in others/, and that spelling was handed
       out in links for long enough that the app still redirects it. */
    if (course.folder !== course.id) add(`/${course.folder}`);

    for (const module of course.modules) {
      for (const lesson of module.lessons) {
        add(`/${course.id}/${lesson.id}`);
        add(`/${course.id}/${lesson.id}/full`);
        add(`/learn/${course.id}/${module.id}/${lesson.id}`);
        if (course.folder !== course.id) add(`/${course.folder}/${lesson.id}`);
      }
    }
  }

  seen.delete('/');
  return [...seen];
}

const shell = await readFile(join(OUT, 'index.html'), 'utf8');
const list = routes();

for (const route of list) {
  const dir = join(OUT, route);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, 'index.html'), shell);
}

console.log(`prerendered ${list.length} routes (${allLessons().length} lessons)`);
