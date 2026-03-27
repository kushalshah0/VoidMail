import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getInbox, getEmails, getEmail, deleteInbox } from '../utils/api';
import EmailList from '../components/EmailList';
import EmailDetail from '../components/EmailDetail';
import CopyButton from '../components/CopyButton';
import CountdownTimer from '../components/CountdownTimer';
import Notification from '../components/Notification';
import usePolling from '../hooks/usePolling';

export default function InboxPage() {
  const { username } = useParams();
  const navigate = useNavigate();

  const [inbox, setInbox] = useState(null);
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [showRecovery, setShowRecovery] = useState(true);

  const domain = import.meta.env.VITE_EMAIL_DOMAIN || 'yourdomain.com';
  const emailAddress = `${username}@${domain}`;
  const recoveryKey = sessionStorage.getItem(`recovery_${username}`);
  const expiresAt = sessionStorage.getItem(`expires_${username}`);

  useEffect(() => {
    const loadInbox = async () => {
      try {
        const data = await getInbox(username);
        setInbox(data);
        setLoading(false);
      } catch (err) {
        setNotification({ type: 'error', message: 'Inbox not found or expired' });
        setTimeout(() => navigate('/'), 2000);
      }
    };
    loadInbox();
  }, [username, navigate]);

  const fetchEmails = useCallback(async () => {
    try {
      const data = await getEmails(username);
      setEmails(data.emails || []);
    } catch (err) {
      console.error('Failed to fetch emails:', err);
    }
  }, [username]);

  usePolling(fetchEmails, 5000);

  const handleSelectEmail = async (emailId) => {
    setSelectedId(emailId);
    try {
      const data = await getEmail(emailId);
      setSelectedEmail(data);
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to load email' });
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this inbox and all emails permanently?')) return;
    try {
      await deleteInbox(username, recoveryKey);
      sessionStorage.removeItem(`recovery_${username}`);
      sessionStorage.removeItem(`created_${username}`);
      sessionStorage.removeItem(`expires_${username}`);
      navigate('/');
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to delete inbox' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-brand-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-light-500 dark:text-dark-400">Loading inbox...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-fade-in">
      {notification && (
        <Notification {...notification} onClose={() => setNotification(null)} />
      )}

      <div className="card mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 
                            bg-brand-50 dark:bg-brand-600/10 
                            border border-brand-200 dark:brand-border-600/20 
                            rounded-xl flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-semibold text-light-900 dark:text-white truncate max-w-[150px] sm:max-w-none">
                  {emailAddress}
                </h1>
                <CopyButton text={emailAddress} iconOnly className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 p-1.5 sm:hidden" />
                <button onClick={handleDelete} className="p-1.5 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 sm:hidden" title="Delete">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="sm:hidden w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="hidden sm:inline badge-green text-xs">Active</span>
                {expiresAt && (
                  <span className="text-light-500 dark:text-dark-500">
                    <CountdownTimer expiresAt={expiresAt} />
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <CopyButton text={emailAddress} label="Copy" className="btn-secondary py-2 px-3 text-sm" />
            <button onClick={handleDelete} className="btn-secondary inline-flex items-center gap-1.5 py-2 px-3 text-sm 
                       text-red-500 dark:text-red-400 
                       hover:text-red-600 dark:hover:text-red-300" title="Delete inbox">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span className="ml-1">Delete</span>
            </button>
          </div>
        </div>

        {recoveryKey && showRecovery && (
          <div className="mt-4 p-4 
                          bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 
                          border-2 border-amber-300 dark:border-amber-700/50
                          rounded-xl relative">
            <button 
              onClick={() => setShowRecovery(false)} 
              className="absolute top-3 right-3 text-amber-600 dark:text-amber-400 
                         hover:text-amber-800 dark:hover:text-amber-300 p-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-amber-200 dark:bg-amber-800/50 rounded-xl flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-amber-700 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <div>
                <p className="text-base font-bold text-amber-900 dark:text-amber-300">
                  Recovery Key
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-400/70 mt-0.5">
                  Save this key to access your inbox from another device
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <code className="flex-1 
                               bg-white dark:bg-dark-900 
                               border-2 border-amber-300 dark:border-amber-600
                               rounded-lg px-4 py-3 font-mono 
                               text-amber-700 dark:text-amber-400 
                               tracking-widest text-center text-sm break-all font-bold">
                {recoveryKey}
              </code>
              <CopyButton text={recoveryKey} iconOnly className="bg-amber-200 dark:bg-amber-800 text-amber-700 dark:text-amber-300 hover:bg-amber-300 dark:hover:bg-amber-700 p-3" />
            </div>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-5 gap-4 min-h-[60vh]">
        <div className={`lg:col-span-2 card p-0 overflow-hidden ${selectedId ? 'hidden lg:block' : ''}`}>
          <div className="p-3 border-b border-light-200 dark:border-dark-800 flex items-center justify-between">
            <h2 className="text-sm font-medium text-light-600 dark:text-dark-300">
              Inbox ({emails.length})
            </h2>
            <button onClick={fetchEmails} className="p-1.5 text-light-500 dark:text-dark-400 hover:text-light-700 dark:hover:text-white" title="Refresh">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
          <div className="overflow-auto max-h-[65vh]">
            <EmailList
              emails={emails}
              selectedId={selectedId}
              onSelect={handleSelectEmail}
            />
          </div>
        </div>

        <div className={`lg:col-span-3 card p-0 overflow-hidden ${!selectedId ? 'hidden lg:block' : ''}`}>
          <EmailDetail
            email={selectedEmail}
            onBack={() => {
              setSelectedId(null);
              setSelectedEmail(null);
            }}
          />
        </div>
      </div>
    </div>
  );
}
