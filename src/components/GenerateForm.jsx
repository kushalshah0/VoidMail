import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateAddress } from '../utils/api';
import Notification from './Notification';

export default function GenerateForm() {
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await generateAddress();
      localStorage.setItem('voidmail_email', data.address);
      localStorage.setItem('voidmail_expires', Date.now() + 3600000);
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
          Your temporary address
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary flex-1 py-3 px-4 text-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Generate New Inbox
              </span>
            )}
          </button>
        </div>
        <p className="text-xs text-light-500 dark:text-dark-500 mt-2 text-center">
          Address will be random. Emails arrive instantly via short polling.
        </p>
      </div>
    </form>
  );
}