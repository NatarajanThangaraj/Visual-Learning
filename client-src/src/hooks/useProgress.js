import { useSyncExternalStore, useCallback } from 'react';
import { flatOrder, courseLessonCount, totalLessonCount } from '../data/courses';

/* Progress lives in localStorage — there is no backend and no login.
 *
 *   { completed: { 'java/strings/riya-job-hunt': '2026-08-22T…' },
 *     last:      { java: 'java/strings/riya-job-hunt' },
 *     explore:   false }
 *
 * Every read and write is wrapped: a private window, cleared site data or a
 * browser that blocks storage should degrade to "nothing completed yet", never
 * to a crash. A tiny external store (rather than context) keeps the sidebar,
 * the course page and the lesson footer in sync without a provider.
 */

const KEY = 'vl:progress:v1';
const EMPTY = { completed: {}, last: {}, explore: false };

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw);
    return {
      completed: parsed.completed && typeof parsed.completed === 'object' ? parsed.completed : {},
      last: parsed.last && typeof parsed.last === 'object' ? parsed.last : {},
      explore: !!parsed.explore,
    };
  } catch {
    return EMPTY;
  }
}

let state = read();
const listeners = new Set();

function set(next) {
  state = next;
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage unavailable — session-only */ }
  listeners.forEach(l => l());
}

const subscribe = l => { listeners.add(l); return () => listeners.delete(l); };
const snapshot = () => state;

export function useProgress() {
  const s = useSyncExternalStore(subscribe, snapshot, () => EMPTY);

  const isComplete = useCallback(key => !!s.completed[key], [s]);

  const markComplete = useCallback((key, courseId) => {
    if (state.completed[key]) return;
    set({
      ...state,
      completed: { ...state.completed, [key]: new Date().toISOString() },
      last: courseId ? { ...state.last, [courseId]: key } : state.last,
    });
  }, []);

  const clearComplete = useCallback(key => {
    if (!state.completed[key]) return;
    const completed = { ...state.completed };
    delete completed[key];
    set({ ...state, completed });
  }, []);

  const touch = useCallback((key, courseId) => {
    if (!courseId || state.last[courseId] === key) return;
    set({ ...state, last: { ...state.last, [courseId]: key } });
  }, []);

  const setExplore = useCallback(v => set({ ...state, explore: !!v }), []);

  const resetAll = useCallback(() => set({ ...EMPTY, explore: state.explore }), []);

  /* A lesson is open if it is the first of its course, if the lesson before it
     is complete, if it is already complete itself, or if Explore mode is on. */
  const isUnlocked = useCallback((courseId, key) => {
    if (s.explore) return true;
    const order = flatOrder(courseId);
    const i = order.findIndex(l => l.key === key);
    if (i <= 0) return true;
    return !!s.completed[key] || !!s.completed[order[i - 1].key];
  }, [s]);

  const courseProgress = useCallback(courseId => {
    const total = courseLessonCount(courseId);
    const done = flatOrder(courseId).filter(l => s.completed[l.key]).length;
    return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
  }, [s]);

  const moduleProgress = useCallback((courseId, moduleId) => {
    const lessons = flatOrder(courseId).filter(l => l.moduleId === moduleId);
    return { done: lessons.filter(l => s.completed[l.key]).length, total: lessons.length };
  }, [s]);

  /* Where "Continue" goes: the first lesson of the course not yet finished,
     falling back to the last one so a finished course still opens somewhere. */
  const nextLesson = useCallback(courseId => {
    const order = flatOrder(courseId);
    return order.find(l => !s.completed[l.key]) || order[order.length - 1] || null;
  }, [s]);

  const overall = useCallback(() => {
    const total = totalLessonCount();
    const done = Object.keys(s.completed).length;
    return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
  }, [s]);

  return {
    completed: s.completed,
    explore: s.explore,
    isComplete, markComplete, clearComplete, touch,
    setExplore, resetAll,
    isUnlocked, courseProgress, moduleProgress, nextLesson, overall,
  };
}
