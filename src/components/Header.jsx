import { Link, useLocation } from 'react-router-dom';

export default function Header() {
  const location = useLocation();
  const isInbox = location.pathname.startsWith('/inbox');

  return (
    <header className="border-b border-dark-800 bg-dark-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center 
                          text-white group-hover:scale-110 transition-transform">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-white">
            Void<span className="text-brand-400">Mail</span>
          </span>
        </Link>

        <nav className="flex items-center gap-4">
          {isInbox && (
            <Link to="/" className="btn-secondary text-sm py-2 px-4 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              New Inbox
            </Link>
          )}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-dark-400 hover:text-dark-200 transition-colors text-sm"
          >
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}
