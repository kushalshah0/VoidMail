import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createInbox } from '../utils/api';
import Notification from './Notification';

export default function GenerateForm() {
  const [username, setUsername] = useState('');
  const [ttlHours, setTtlHours] = useState(24);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  const generateRandomUsername = () => {
    const adjectives = ['swift', 'quiet', 'brave', 'clever', 'bright', 'calm', 'bold', 'keen'];
    const nouns = ['fox', 'owl', 'wolf', 'hawk', 'bear', 'lynx', 'crow', 'deer'];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const num = Math.floor(Math.random() * 9999);
    setUsername(`${adj}.${noun}${num}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setNotification({ type: 'error', message: 'Please enter a username' });
      return;
    }

    if (!/^[a-zA-Z0-9._-]+$/.test(username)) {
      setNotification({ type: 'error', message: 'Username can only contain letters, numbers, dots, hyphens, and underscores' });
      return;
    }

    setLoading(true);
    try {
      const data = await createInbox(username.toLowerCase(), ttlHours);

      sessionStorage.setItem(`recovery_${username.toLowerCase()}`, data.recoveryKey);
      sessionStorage.setItem(`created_${username.toLowerCase()}`, data.createdAt);
      sessionStorage.setItem(`expires_${username.toLowerCase()}`, data.expiresAt);

      navigate(`/inbox/${username.toLowerCase()}`);
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to create inbox',
      });
    } finally {
      setLoading(false);
    }
  };

  const domain = import.meta.env.VITE_EMAIL_DOMAIN || 'yourdomain.com';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {notification && (
        <Notification
          {...notification}
          onClose={() => setNotification(null)}
        />
      )}

      <div>
        <label className="block text-sm font-medium text-dark-300 mb-2">
          Choose your temporary address
        </label>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              placeholder="username"
              className="input-field pr-24"
              maxLength={30}
              autoComplete="off"
              spellCheck="false"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 text-sm">
              @{domain}
            </span>
          </div>
          <button
            type="button"
            onClick={generateRandomUsername}
            className="btn-secondary py-3 px-4 text-sm shrink-0"
            title="Generate random username"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-dark-300 mb-2">
          Inbox lifetime
        </label>
        <div className="grid grid-cols-4 gap-2">
          {[1, 6, 12, 24].map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => setTtlHours(h)}
              className={`py-2 px-3 rounded-xl text-sm font-medium transition-all
                ${ttlHours === h
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/25'
                  : 'bg-dark-800 text-dark-400 hover:bg-dark-700 border border-dark-700'
                }`}
            >
              {h}h
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !username.trim()}
        className="btn-primary w-full text-base"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Creating...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Generate Inbox
          </span>
        )}
      </button>
    </form>
  );
}
