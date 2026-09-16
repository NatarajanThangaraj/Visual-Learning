import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import AppShell from './components/shell/AppShell';
import HomePage from './pages/HomePage';
import BrowsePage from './pages/BrowsePage';
import CoursePage from './pages/CoursePage';
import LessonPage from './pages/LessonPage';
import LabPage from './pages/LabPage';
import NotFoundPage from './pages/NotFoundPage';
import { findLesson } from './data/courses';

/* The URL scheme, in full:
 *
 *   /                                home
 *   /browse                          the flat catalog
 *   /java                            a course
 *   /java/my-expense-tracker         a lab inside the course chrome
 *   /java/my-expense-tracker/full    that lab on its own, no chrome
 *
 * The labs are real files under public/labs/, served at
 * /labs/java/my-expense-tracker/index.html. Nothing links to that path — it is
 * fetched, not navigated to. They sit under /labs/ so they do not occupy the
 * lesson URLs: the host answers a directory with its index.html, so a lab at
 * /java/<id>/ would be served in place of the app.
 *
 * Every route below is also a real directory + index.html in the build, written
 * by scripts/prerender-routes.mjs — the host has no fallback for unknown paths.
 *
 * Ordering below doesn't decide matching: React Router ranks a static segment
 * above a dynamic one, so /browse and /learn/* win over /:courseId even though
 * they could both match. */
export default function App() {
  return (
    <Routes>
      {/* A lab on its own is the whole viewport — no sidebar, no chrome. */}
      <Route path="/:courseId/:lessonId/full" element={<LabPage />} />

      <Route element={<AppShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/browse" element={<BrowsePage />} />
        <Route path="/:courseId" element={<CoursePage />} />
        <Route path="/:courseId/:lessonId" element={<LessonPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* The old /learn/… scheme. Kept as redirects so bookmarks, shared links
          and anything already printed keep landing on the right page. */}
      <Route path="/learn" element={<Navigate to="/browse" replace />} />
      <Route path="/learn/:courseId" element={<LegacyCourse />} />
      <Route path="/learn/:courseId/:moduleId/:lessonId" element={<LegacyLesson />} />
    </Routes>
  );
}

function LegacyCourse() {
  const { courseId } = useParams();
  return <Navigate to={`/${courseId}`} replace />;
}

/* The module dropped out of the URL — lesson ids are unique within a course —
   so the old three-segment path collapses to two. */
function LegacyLesson() {
  const { courseId, lessonId } = useParams();
  const lesson = findLesson(courseId, lessonId);
  return <Navigate to={lesson ? lesson.route : `/${courseId}`} replace />;
}
