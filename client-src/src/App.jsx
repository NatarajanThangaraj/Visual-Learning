import { Routes, Route } from 'react-router-dom';
import AppShell from './components/shell/AppShell';
import HomePage from './pages/HomePage';
import BrowsePage from './pages/BrowsePage';
import CoursePage from './pages/CoursePage';
import LessonPage from './pages/LessonPage';
import NotFoundPage from './pages/NotFoundPage';

/* Every route sits inside AppShell so the sidebar persists. Lesson routes are
   prefixed with /learn/ deliberately: the labs themselves are real files under
   public/ (/java/riya-job-hunt/index.html and friends), and the prefix keeps
   SPA routes from ever shadowing them. */
export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/browse" element={<BrowsePage />} />
        <Route path="/learn/:courseId" element={<CoursePage />} />
        <Route path="/learn/:courseId/:moduleId/:lessonId" element={<LessonPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
