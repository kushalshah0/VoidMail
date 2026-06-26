import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateAddress } from '../utils/api';
import Notification from './Notification';

export default function GenerateForm() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  const domain = import.meta.env.VITE_EMAIL_DOMAIN || 'kushal.qzz.io';

  const generateRandomUsername = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 10; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    setUsername(result);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await generateAddress(username || undefined);
      localStorage.setItem('voidmail_email', data.address);
      localStorage.setItem('voidmail_recovery', data.recoveryKey);
      localStorage.setItem('voidmail_expires', data.expiresAt);
      navigate(`/inbox/${data.address}`);
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to generate address',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {notification && (
        <Notification {...notification} onClose={() => setNotification(null)} />
      )}

      <div>
        <label className="block text-sm font-medium text-light-600 dark:text-dark-300 mb-2">
          Choose your temporary address
        </label>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''))}
              placeholder="username"
              className="input-field pr-28"
              maxLength={30}
              autoComplete="off"
              spellCheck="false"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 
                             text-light-500 dark:text-dark-500 text-sm">
              @{domain}
            </span>
          </div>
          <button
            type="button"
            onClick={generateRandomUsername}
            className="btn-secondary py-3 px-3 text-sm shrink-0"
            title="Generate random username"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-light-500 dark:text-dark-500 mt-2 text-center">
          Leave blank for a random address. Emails arrive instantly.
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
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