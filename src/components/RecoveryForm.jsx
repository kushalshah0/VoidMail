import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { recoverInbox } from '../utils/api';
import Notification from './Notification';

export default function RecoveryForm() {
  const [username, setUsername] = useState('');
  const [recoveryKey, setRecoveryKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !recoveryKey.trim()) {
      setNotification({ type: 'error', message: 'Please fill in all fields' });
      return;
    }

    setLoading(true);
    try {
      const data = await recoverInbox(username.toLowerCase(), recoveryKey.toUpperCase());
      sessionStorage.setItem(`recovery_${username.toLowerCase()}`, recoveryKey.toUpperCase());
      sessionStorage.setItem(`expires_${username.toLowerCase()}`, data.expiresAt);
      navigate(`/inbox/${username.toLowerCase()}`);
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.message || 'Invalid recovery key or inbox expired',
      });
    } finally {
      setLoading(false);
    }
  };

  const domain = import.meta.env.VITE_EMAIL_DOMAIN || 'yourdomain.com';

  const handleKeyChange = (e) => {
    let val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    val = val.match(/.{1,4}/g)?.join('-') || val;
    setRecoveryKey(val.substring(0, 19));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {notification && (
        <Notification {...notification} onClose={() => setNotification(null)} />
      )}

      <div>
        <label className="block text-sm font-medium text-light-600 dark:text-dark-300 mb-2">
          Username
        </label>
        <div className="relative">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            placeholder="username"
            className="input-field pr-36"
            autoComplete="off"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 
                           text-light-500 dark:text-dark-500 text-sm">
            @{domain}
          </span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-light-600 dark:text-dark-300 mb-2">
          Recovery Key
        </label>
        <input
          type="text"
          value={recoveryKey}
          onChange={handleKeyChange}
          placeholder="XXXX-XXXX-XXXX-XXXX"
          className="input-field font-mono tracking-widest text-center"
          autoComplete="off"
          spellCheck="false"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-secondary w-full"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Recovering...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            Access Inbox
          </span>
        )}
      </button>
    </form>
  );
}
