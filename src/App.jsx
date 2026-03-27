import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import InboxPage from './pages/InboxPage';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col 
                    bg-light-50 dark:bg-dark-950 
                    text-light-900 dark:text-dark-100
                    transition-colors duration-300">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/inbox/:username" element={<InboxPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
