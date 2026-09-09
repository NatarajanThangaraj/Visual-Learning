/* Single source of truth for the whole site.
 *
 * A course → modules → lessons. Every lesson is one of the self-contained
 * interactive pages under client-src/public/<folder>/<id>/, shown inside the
 * course chrome.
 *
 * A lesson entry is just identity — { id, title, minutes, blurb }. Every path
 * is derived from it, so no entry ever spells out a file name:
 *
 *   route   /<courseId>/<lessonId>            the page a learner links to
 *   lab     /<courseId>/<lessonId>/full       the lab on its own, no chrome
 *   file    /<folder>/<lessonId>/index.html   the raw file the host serves
 *   thumb   /<folder>/<lessonId>/thumb.png    add `thumb: false` if there
 *                                             is none yet — the card then
 *                                             falls back to course art
 *
 * `folder` is the directory under public/ that holds the course's labs; it is
 * spelt out per course because Problem Solving's labs live in `others/`, a
 * name that predates the course and that live URLs still point at.
 *
 * To add a lesson: drop its folder under public/ and add an entry below.
 * Routes, the sidebar, progress, unlocking and next/prev all follow from this
 * file — there is nothing else to register.
 */

export const courses = [
  // ─────────────────────────────────────────────── Java
  {
    id: 'java',
    folder: 'java',
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
            blurb: "Pour values between Java's primitive containers — see what fits, what spills, and watch the bits fall away when you cast." },
        ],
      },
      {
        id: 'decisions',
        title: 'Loops and Conditional Statement',
        summary: 'Branching, priority, and repeating work without copy-paste.',
        lessons: [
          { id: 'smart-data-guardian', title: 'Smart Data Guardian', minutes: 25,
            blurb: 'Build a 7-day mobile data checker by doing — variables, conditionals, loops and a running total, one stage at a time.' },
        ],
      },
      {
        id: 'strings',
        title: 'Strings and String Methods',
        summary: 'The methods that turn fiddly text handling into one readable line.',
        lessons: [
          { id: 'riya-job-hunt', title: "Riya's Job Hunt", minutes: 20,
            blurb: 'An interactive 13-scene story deck for learning Java String methods — read the story, guess the method, then flip.', thumb: false },
          { id: 'fraud-detective', title: 'Bank Fraud Detective', minutes: 25,
            blurb: 'Play the fraud analyst: dissect a suspicious transaction with Java String methods, expose every red flag, then approve or reject.' },
          { id: 'lifecare-hospital', title: 'LifeCare Hospital', minutes: 30,
            blurb: 'A 10-department hospital adventure where each real-world problem teaches one Java String method — from registration to the dashboard.' },
        ],
      },
      {
        id: 'arrays',
        title: 'Arrays',
        summary: 'Many values under one name — and what happens when you give that idea rows and columns.',
        lessons: [
          { id: 'grid-world', title: 'GridWorld', minutes: 35,
            blurb: 'Nine worlds and three playgrounds — a cineplex, a farm, a wildfire, a chessboard, a dungeon crawl and more — all the same int[][] underneath. Flip Matrix X-ray for the raw numbers, and the Code Mirror echoes the Java behind every move.' },
        ],
      },
      {
        id: 'objects',
        title: 'Classes and Objects',
        summary: 'Describe the thing once, then build as many as you need.',
        lessons: [
          { id: 'monster-battle', title: 'Monster Battle Academy', minutes: 25,
            blurb: 'Design a monster battle game step by step — learn how objects model real things by deciding what every monster needs.' },
          { id: 'rapido-backend', title: 'Build the Rapido Backend', minutes: 35,
            blurb: 'A six-step assignment: design the Passenger, Vehicle, Rider and Ride classes behind a ride-booking app, then see the same ride as the passenger, the rider and the owner.' },
          { id: 'swiggy-kitchen', title: 'Build the Swiggy Backend', minutes: 40,
            blurb: 'A seven-step assignment: model a food order end to end — and meet the idea that one object can hold a whole list of others.' },
          { id: 'event-registration', title: 'Event Registration Playground', minutes: 25,
            blurb: 'Step through one action at a time and watch four classes collaborate — Main asks, EventRegistration decides, Participant objects get built, FileManager keeps the records. Then read the same program as a participant list, as raw file rows, and as a UML diagram.' },
          { id: 'booking-and-rental', title: 'Room Booking & Vehicle Rental', minutes: 30,
            blurb: 'Two playgrounds, one idea: book a hotel room, then rent a vehicle, and watch the same four-class shape underneath — Main asks, the service decides, a Booking or Rental object is created, and a Room or Vehicle is marked unavailable. Each side comes with its own file records, report and UML diagram.' },
        ],
      },
      {
        id: 'file-handling',
        title: 'File Handling',
        summary: 'Making what a program writes survive after it stops running.',
        lessons: [
          { id: 'mission-control', title: 'Mission Control', minutes: 30,
            blurb: 'A spacecraft goes silent at 10:07 — work the black-box log one record at a time, decide what matters, and find out you have been thinking like a file-reading program all along.' },
          { id: 'alien-decoder', title: 'Alien Decoder', minutes: 20,
            blurb: 'Step into the computer and decode an alien transmission by hand — read a dictionary file line by line, build the lookup in memory, then meet the code that has no meaning.' },
          { id: 'diary-app', title: 'Build the Diary App', minutes: 35,
            blurb: 'A four-step assignment: sign up, open a calendar on a blank page, write the day down, then close the diary and open it again to find every written day still there.' },
          { id: 'quiz-app', title: 'Build the Quiz App', minutes: 40,
            blurb: 'A six-step assignment: take a name, pick a level and a topic, run ten questions against one clock, then save the score and fight for a place in the top five.' },
          { id: 'file-detective', title: 'File Detective', minutes: 30,
            blurb: 'Work a case out of five raw text files: pin the records, build the timeline, catch the statement that contradicts the evidence — then write the engine that does it for any case.' },
          { id: 'songbox', title: 'SongBox', minutes: 30,
            blurb: 'Sixty real songs live in one text file — split a line into its five fields, pick any mix of genres and artists, then play the shortlist you built and walk it with next and previous.' },
          { id: 'my-expense-tracker', title: 'Expense Tracker Playground', minutes: 25,
            blurb: 'Step through the calls one at a time and watch four classes talk to each other — Main asks, ExpenseTracker delegates, Expense objects get built, FileManager writes the CSV. Then read the same program as a report and as a UML diagram.' },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────── Python
  {
    id: 'python',
    folder: 'python',
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
            blurb: 'Understand variables with a restaurant-discount jar analogy.' },
        ],
      },
      {
        id: 'operators',
        title: 'Operators and Expressions',
        summary: 'Doing the maths, and what the program does with the result.',
        lessons: [
          { id: 'python-calculator', title: 'Python Calculator Demo', minutes: 15,
            blurb: 'An interactive UI that demonstrates how a Python calculator evaluates input.' },
        ],
      },
      {
        id: 'decisions',
        title: 'Conditional Statements',
        summary: 'if / elif / else, five different ways of making the branching physical.',
        lessons: [
          { id: 'pyif-conditionals', title: 'PyIf: Python Conditionals', minutes: 15,
            blurb: 'Learn Python if / elif / else through a guided interactive app.' },
          { id: 'pystory', title: 'PyStory: Learn Through Stories', minutes: 20,
            blurb: 'Learn Python conditionals through short, interactive story-driven scenarios.' },
          { id: 'time-decision-lab', title: 'Time Decision Lab', minutes: 15,
            blurb: 'Learn conditional statements by making time-based decisions.' },
          { id: 'decision-playground', title: 'Decision Playground', minutes: 15,
            blurb: 'An interactive playground for practising Python conditional logic.' },
          { id: 'detective-robot', title: 'Detective Robot', minutes: 20,
            blurb: 'Help a detective robot crack cases to learn Python logic and conditionals.' },
        ],
      },
      {
        id: 'logic-and-data',
        title: 'Lists and Logic',
        summary: 'Holding many values at once, and following a program one line at a time.',
        lessons: [
          { id: 'list-integer-lab', title: 'List Integer Lab', minutes: 15,
            blurb: 'Experiment interactively with Python integer lists.' },
          { id: 'logic-step-explorer', title: 'Logic Step Explorer', minutes: 15,
            blurb: 'Step through Python program logic one line at a time.' },
          { id: 'code-drop', title: 'Code Drop: Learn by Playing', minutes: 20,
            blurb: 'Build Python programs by dragging and dropping code blocks into place.' },
          { id: 'python-code-jumble', title: 'Python Code Jumble', minutes: 15,
            blurb: 'Reassemble scrambled Python code in a biology-themed coding game.' },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────── Problem Solving
  {
    id: 'problem-solving',
    folder: 'others',
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
            blurb: 'Explore how to design a calculator from a systems-thinking perspective.' },
          { id: 'division-remainder', title: 'The Remainder', minutes: 15,
            blurb: 'A thinking journey through division and the remainder (modulo) operation.' },
        ],
      },
      {
        id: 'algorithms',
        title: 'Algorithms',
        summary: 'Rules precise enough for a machine to follow without asking a question.',
        lessons: [
          { id: 'max-finder-1', title: 'Max Finder — Part 1', minutes: 15,
            blurb: 'A cinematic 3D visualization of finding the maximum value in a list (part 1).' },
          { id: 'max-finder-2', title: 'Max Finder — Part 2', minutes: 15,
            blurb: 'A cinematic 3D visualization of finding the maximum value in a list (part 2).' },
          { id: 'luhn-algorithm', title: 'Luhn Algorithm: 3D Explorer', minutes: 20,
            blurb: 'A cinematic 3D walkthrough of the Luhn checksum used to validate card numbers.' },
        ],
      },
    ],
  },
];

/* ── Helpers ──────────────────────────────────────────────────────────────
 * Everything below is derived. Components never walk the tree themselves, and
 * nothing outside this file builds a URL by hand. */

export const lessonKey = (courseId, moduleId, lessonId) => `${courseId}/${moduleId}/${lessonId}`;

export const getCourse = courseId => courses.find(c => c.id === courseId) || null;

/* Course pages live at /<courseId>, so a lab folder whose name differs from
   its course id would otherwise be unreachable by the pretty URL. Mapping the
   folder back onto the course lets /others/luhn-algorithm redirect to the
   canonical /problem-solving/luhn-algorithm instead of 404ing. */
export function resolveCourseId(idOrFolder) {
  const course = courses.find(c => c.id === idOrFolder || c.folder === idOrFolder);
  return course ? course.id : null;
}

/** Every lesson in every course, in course order, each one flattened with the
 *  context a card needs — its key, its URLs and its course/module. */
export function allLessons() {
  const out = [];
  courses.forEach(course => {
    course.modules.forEach(module => {
      module.lessons.forEach(lesson => {
        /* Two prefixes, deliberately: every URL a person sees is built from
           the course id, while the files keep the folder they have always
           been served from. */
        const route = `/${course.id}/${lesson.id}`;
        const dir = `/${course.folder}/${lesson.id}`;
        out.push({
          ...lesson,
          key: lessonKey(course.id, module.id, lesson.id),
          route,                                    // the lab inside course chrome
          labRoute: `${route}/full`,                // the lab alone, no chrome
          src: `${dir}/index.html`,                 // the file itself, fetched not linked
          thumbnail: lesson.thumb === false ? null : `${dir}/thumb.png`,
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

/** A lesson by course and id. The module is not part of the URL — ids are
 *  unique within a course — so it is not part of the lookup either. */
export function findLesson(courseId, lessonId) {
  return allLessons().find(l => l.courseId === courseId && l.id === lessonId) || null;
}

/** Previous / next across module boundaries, so a course reads as one path. */
export function neighbours(courseId, key) {
  const order = flatOrder(courseId);
  const i = order.findIndex(l => l.key === key);
  return { prev: i > 0 ? order[i - 1] : null, next: i >= 0 && i < order.length - 1 ? order[i + 1] : null };
}

export const courseLessonCount = courseId => flatOrder(courseId).length;

export const totalLessonCount = () => allLessons().length;
