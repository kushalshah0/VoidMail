import { Routes, Route, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import InboxPage from './pages/InboxPage';

function AutoRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const email = localStorage.getItem('voidmail_email');
    const expiresAt = localStorage.getItem('voidmail_expires');

    if (email && expiresAt) {
      const expTime = parseInt(expiresAt);
      if (expTime > Date.now()) {
        navigate(`/inbox/${email}`, { replace: true });
      } else {
        localStorage.removeItem('voidmail_email');
        localStorage.removeItem('voidmail_expires');
      }
    }
  }, [navigate]);

  return <HomePage />;
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col 
                    bg-light-50 dark:bg-dark-950 
                    text-light-900 dark:text-dark-100
                    transition-colors duration-300">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<AutoRedirect />} />
          <Route path="/inbox/:address" element={<InboxPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
