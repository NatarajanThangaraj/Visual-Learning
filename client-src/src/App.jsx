import { Routes, Route } from 'react-router-dom';
import { topics } from './data/topics';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';

/* Routes are generated from the topics data — adding an entry to
   src/data/topics.js automatically registers its route here. */
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      {topics.map(t => (
        <Route key={t.path} path={t.path} element={<t.Component />} />
      ))}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
