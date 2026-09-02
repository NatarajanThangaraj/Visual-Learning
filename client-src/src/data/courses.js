/* Single source of truth for the whole site.
 *
 * A course → modules → lessons. Every lesson is one of the self-contained
 * interactive pages under client-src/public/<category>/<slug>/index.html,
 * shown inside the course chrome.
 *
 * To add one: drop the folder under public/, then add an entry below with
 * `src` pointing at its /index.html and `thumbnail` at its thumb.png. Routes,
 * the sidebar, progress, unlocking and next/prev all follow from this file —
 * there is nothing else to register.
 */

export const courses = [
  // ─────────────────────────────────────────────── Java
  {
    id: 'java',
    title: 'Java',
    label: 'Java',
    tagline: 'From your first line of code to objects that model the real world.',
    accent: 'var(--java)',
    accentBg: 'var(--java-bg)',
    modules: [
      {
        id: 'types-and-casting',
        title: 'Data types',
        summary: 'What a value is, how much room it takes, and what is lost when it moves.',
        lessons: [
          { id: 'type-casting-foundry', title: 'The Casting Foundry', minutes: 20,
            blurb: "Pour values between Java's primitive containers — see what fits, what spills, and watch the bits fall away when you cast.",
            src: '/java/type-casting-foundry/index.html',
            thumbnail: '/java/type-casting-foundry/thumb.png' },
        ],
      },
      {
        id: 'decisions',
        title: 'Loops and Conditional Statement',
        summary: 'Branching, priority, and repeating work without copy-paste.',
        lessons: [
          { id: 'smart-data-guardian', title: 'Smart Data Guardian', minutes: 25,
            blurb: 'Build a 7-day mobile data checker by doing — variables, conditionals, loops and a running total, one stage at a time.',
            src: '/java/smart-data-guardian/index.html',
            thumbnail: '/java/smart-data-guardian/thumb.png' },
        ],
      },
      {
        id: 'strings',
        title: 'Strings and String Methods',
        summary: 'The methods that turn fiddly text handling into one readable line.',
        lessons: [
          { id: 'riya-job-hunt', title: "Riya's Job Hunt", minutes: 20,
            blurb: 'An interactive 13-scene story deck for learning Java String methods — read the story, guess the method, then flip.',
            src: '/java/riya-job-hunt/index.html', thumbnail: null },
          { id: 'fraud-detective', title: 'Bank Fraud Detective', minutes: 25,
            blurb: 'Play the fraud analyst: dissect a suspicious transaction with Java String methods, expose every red flag, then approve or reject.',
            src: '/java/fraud-detective/index.html',
            thumbnail: '/java/fraud-detective/thumb.png' },
          { id: 'lifecare-hospital', title: 'LifeCare Hospital', minutes: 30,
            blurb: 'A 10-department hospital adventure where each real-world problem teaches one Java String method — from registration to the dashboard.',
            src: '/java/lifecare-hospital/index.html',
            thumbnail: '/java/lifecare-hospital/thumb.png' },
        ],
      },
      {
        id: 'arrays',
        title: 'Arrays',
        summary: 'Many values under one name — and what happens when you give that idea rows and columns.',
        lessons: [
          { id: 'grid-world', title: 'GridWorld', minutes: 35,
            blurb: 'Nine worlds and three playgrounds — a cineplex, a farm, a wildfire, a chessboard, a dungeon crawl and more — all the same int[][] underneath. Flip Matrix X-ray for the raw numbers, and the Code Mirror echoes the Java behind every move.',
            src: '/java/grid-world/index.html',
            thumbnail: '/java/grid-world/thumb.png' },
        ],
      },
      {
        id: 'objects',
        title: 'Classes and Objects',
        summary: 'Describe the thing once, then build as many as you need.',
        lessons: [
          { id: 'monster-battle', title: 'Monster Battle Academy', minutes: 25,
            blurb: 'Design a monster battle game step by step — learn how objects model real things by deciding what every monster needs.',
            src: '/java/monster-battle/index.html',
            thumbnail: '/java/monster-battle/thumb.png' },
          { id: 'rapido-backend', title: 'Build the Rapido Backend', minutes: 35,
            blurb: 'A six-step assignment: design the Passenger, Vehicle, Rider and Ride classes behind a ride-booking app, then see the same ride as the passenger, the rider and the owner.',
            src: '/java/rapido-backend/index.html',
            thumbnail: '/java/rapido-backend/thumb.png' },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────── Python
  {
    id: 'python',
    title: 'Python',
    label: 'Python',
    tagline: 'A language that reads like English — and the habits that keep it honest.',
    accent: 'var(--python)',
    accentBg: 'var(--python-bg)',
    modules: [
      {
        id: 'getting-started',
        title: 'Variables and Data types',
        summary: 'Storing a value and getting it back out again.',
        lessons: [
          { id: 'variables-as-jars', title: 'Variables as Jars', minutes: 15,
            blurb: 'Understand variables with a restaurant-discount jar analogy.',
            src: '/python/variables-as-jars/index.html',
            thumbnail: '/python/variables-as-jars/thumb.png' },
        ],
      },
      {
        id: 'operators',
        title: 'Operators and Expressions',
        summary: 'Doing the maths, and what the program does with the result.',
        lessons: [
          { id: 'python-calculator', title: 'Python Calculator Demo', minutes: 15,
            blurb: 'An interactive UI that demonstrates how a Python calculator evaluates input.',
            src: '/python/python-calculator/index.html',
            thumbnail: '/python/python-calculator/thumb.png' },
        ],
      },
      {
        id: 'decisions',
        title: 'Conditional Statements',
        summary: 'if / elif / else, five different ways of making the branching physical.',
        lessons: [
          { id: 'pyif-conditionals', title: 'PyIf: Python Conditionals', minutes: 15,
            blurb: 'Learn Python if / elif / else through a guided interactive app.',
            src: '/python/pyif-conditionals/index.html',
            thumbnail: '/python/pyif-conditionals/thumb.png' },
          { id: 'pystory', title: 'PyStory: Learn Through Stories', minutes: 20,
            blurb: 'Learn Python conditionals through short, interactive story-driven scenarios.',
            src: '/python/pystory/index.html', thumbnail: '/python/pystory/thumb.png' },
          { id: 'time-decision-lab', title: 'Time Decision Lab', minutes: 15,
            blurb: 'Learn conditional statements by making time-based decisions.',
            src: '/python/time-decision-lab/index.html',
            thumbnail: '/python/time-decision-lab/thumb.png' },
          { id: 'decision-playground', title: 'Decision Playground', minutes: 15,
            blurb: 'An interactive playground for practising Python conditional logic.',
            src: '/python/decision-playground/index.html',
            thumbnail: '/python/decision-playground/thumb.png' },
          { id: 'detective-robot', title: 'Detective Robot', minutes: 20,
            blurb: 'Help a detective robot crack cases to learn Python logic and conditionals.',
            src: '/python/detective-robot/index.html',
            thumbnail: '/python/detective-robot/thumb.png' },
        ],
      },
      {
        id: 'logic-and-data',
        title: 'Lists and Logic',
        summary: 'Holding many values at once, and following a program one line at a time.',
        lessons: [
          { id: 'list-integer-lab', title: 'List Integer Lab', minutes: 15,
            blurb: 'Experiment interactively with Python integer lists.',
            src: '/python/list-integer-lab/index.html',
            thumbnail: '/python/list-integer-lab/thumb.png' },
          { id: 'logic-step-explorer', title: 'Logic Step Explorer', minutes: 15,
            blurb: 'Step through Python program logic one line at a time.',
            src: '/python/logic-step-explorer/index.html',
            thumbnail: '/python/logic-step-explorer/thumb.png' },
          { id: 'code-drop', title: 'Code Drop: Learn by Playing', minutes: 20,
            blurb: 'Build Python programs by dragging and dropping code blocks into place.',
            src: '/python/code-drop/index.html', thumbnail: '/python/code-drop/thumb.png' },
          { id: 'python-code-jumble', title: 'Python Code Jumble', minutes: 15,
            blurb: 'Reassemble scrambled Python code in a biology-themed coding game.',
            src: '/python/python-code-jumble/index.html',
            thumbnail: '/python/python-code-jumble/thumb.png' },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────── Problem Solving
  {
    id: 'problem-solving',
    title: 'Problem Solving',
    label: 'Problem Solving',
    tagline: 'Language-agnostic thinking — how to turn a vague request into a rule.',
    accent: 'var(--others)',
    accentBg: 'var(--others-bg)',
    modules: [
      {
        id: 'thinking-in-systems',
        title: 'System Design',
        summary: 'Breaking a problem down before a single line is written.',
        lessons: [
          { id: 'calculator-system-design', title: 'System Design: Calculator', minutes: 20,
            blurb: 'Explore how to design a calculator from a systems-thinking perspective.',
            src: '/others/calculator-system-design/index.html',
            thumbnail: '/others/calculator-system-design/thumb.png' },
          { id: 'division-remainder', title: 'The Remainder', minutes: 15,
            blurb: 'A thinking journey through division and the remainder (modulo) operation.',
            src: '/others/division-remainder/index.html',
            thumbnail: '/others/division-remainder/thumb.png' },
        ],
      },
      {
        id: 'algorithms',
        title: 'Algorithms',
        summary: 'Rules precise enough for a machine to follow without asking a question.',
        lessons: [
          { id: 'max-finder-1', title: 'Max Finder — Part 1', minutes: 15,
            blurb: 'A cinematic 3D visualization of finding the maximum value in a list (part 1).',
            src: '/others/max-finder-1/index.html',
            thumbnail: '/others/max-finder-1/thumb.png' },
          { id: 'max-finder-2', title: 'Max Finder — Part 2', minutes: 15,
            blurb: 'A cinematic 3D visualization of finding the maximum value in a list (part 2).',
            src: '/others/max-finder-2/index.html',
            thumbnail: '/others/max-finder-2/thumb.png' },
          { id: 'luhn-algorithm', title: 'Luhn Algorithm: 3D Explorer', minutes: 20,
            blurb: 'A cinematic 3D walkthrough of the Luhn checksum used to validate card numbers.',
            src: '/others/luhn-algorithm/index.html',
            thumbnail: '/others/luhn-algorithm/thumb.png' },
        ],
      },
    ],
  },
];

/* ── Helpers ──────────────────────────────────────────────────────────────
 * Everything below is derived. Components never walk the tree themselves. */

export const lessonKey = (courseId, moduleId, lessonId) => `${courseId}/${moduleId}/${lessonId}`;

export const getCourse = courseId => courses.find(c => c.id === courseId) || null;

/** Every lesson in every course, in course order, each one flattened with the
 *  context a card needs (course + module + its key and route). */
export function allLessons() {
  const out = [];
  courses.forEach(course => {
    course.modules.forEach(module => {
      module.lessons.forEach(lesson => {
        out.push({
          ...lesson,
          key: lessonKey(course.id, module.id, lesson.id),
          route: `/learn/${course.id}/${module.id}/${lesson.id}`,
          courseId: course.id,
          courseTitle: course.title,
          accent: course.accent,
          accentBg: course.accentBg,
          moduleId: module.id,
          moduleTitle: module.title,
        });
      });
    });
  });
  return out;
}

/** The lessons of one course as a flat ordered list — the spine that drives
 *  unlocking, next/prev and progress counts. */
export function flatOrder(courseId) {
  return allLessons().filter(l => l.courseId === courseId);
}

export function findLesson(courseId, moduleId, lessonId) {
  return allLessons().find(
    l => l.courseId === courseId && l.moduleId === moduleId && l.id === lessonId
  ) || null;
}

/** Previous / next across module boundaries, so a course reads as one path. */
export function neighbours(courseId, key) {
  const order = flatOrder(courseId);
  const i = order.findIndex(l => l.key === key);
  return { prev: i > 0 ? order[i - 1] : null, next: i >= 0 && i < order.length - 1 ? order[i + 1] : null };
}

export const courseLessonCount = courseId => flatOrder(courseId).length;

export const totalLessonCount = () => allLessons().length;
