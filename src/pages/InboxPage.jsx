import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getInbox, deleteInbox } from '../utils/api';
import EmailList from '../components/EmailList';
import EmailDetail from '../components/EmailDetail';
import CopyButton from '../components/CopyButton';
import Notification from '../components/Notification';
import { useShortPolling } from '../hooks/useShortPolling';

export default function InboxPage() {
  const { address } = useParams();
  const navigate = useNavigate();

  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [notification, setNotification] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  const [showRecovery, setShowRecovery] = useState(true);

  const emailAddress = address;
  const recoveryKey = localStorage.getItem('voidmail_recovery');
  const expiresAt = localStorage.getItem('voidmail_expires');

  const fetchEmails = useCallback(async () => {
    setFetchError(null);
    try {
      const data = await getInbox(emailAddress);
      setEmails(data.messages || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch emails:', err);
      setFetchError(err.message || 'Failed to fetch emails');
    }
  }, [emailAddress]);

  const { mode } = useShortPolling(emailAddress, {
    onNewEmails: (newEmails) => {
      if (newEmails) {
        setEmails((prev) => {
          const existingIds = new Set(prev.map(e => e.id));
          const uniqueNew = newEmails.filter(e => !existingIds.has(e.id));
          return [...uniqueNew, ...prev];
        });
      } else {
        fetchEmails();
      }
      setLastUpdated(new Date());
    },
  }, 10000);

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  const handleSelectEmail = async (emailId) => {
    setSelectedId(emailId);
    const email = emails.find(e => e.id === emailId);
    if (email) {
      setSelectedEmail(email);
    }
  };

  const handleDelete = async () => {
    if (!recoveryKey) {
      navigate('/');
      return;
    }
    if (!confirm('Delete this inbox and all emails permanently?')) return;
    try {
      await deleteInbox(emailAddress, recoveryKey);
      localStorage.removeItem('voidmail_email');
      localStorage.removeItem('voidmail_recovery');
      localStorage.removeItem('voidmail_expires');
      navigate('/');
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to delete inbox' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-fade-in">
      {notification && (
        <Notification {...notification} onClose={() => setNotification(null)} />
      )}

      <div className="card !p-3 mb-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 
                            bg-brand-50 dark:bg-brand-600/10 
                            border border-brand-200 dark:border-brand-600/20 
                            rounded-xl flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-semibold text-light-900 dark:text-white break-all">
                {emailAddress}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <CopyButton text={emailAddress} iconOnly className="btn-secondary p-1.5" />
            <button onClick={handleDelete} className="btn-secondary p-1.5 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300" title="Delete inbox">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

        {recoveryKey && showRecovery && (
          <div className="mb-4 p-3 
                          bg-amber-50 dark:bg-amber-500/5 
                          border border-amber-200 dark:border-amber-500/20 
                          rounded-xl relative">
            <button 
              onClick={() => setShowRecovery(false)} 
              className="absolute top-2 right-2 text-amber-600 dark:text-amber-500 
                         hover:text-amber-700 dark:hover:text-amber-400 p-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              <div>
                <p className="text-sm text-amber-800 dark:text-amber-300 font-semibold pr-6">
                  Recovery Key — Save this!
                </p>
                <p className="text-xs text-amber-700 dark:text-dark-400 mt-0.5">
                  Use this key to access your inbox from another device
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <code className="flex-1 
                               bg-amber-100 dark:bg-dark-800 
                               border border-amber-200 dark:border-dark-700
                               rounded-lg px-3 py-2 font-mono 
                               text-amber-800 dark:text-amber-400 
                               tracking-widest text-center text-sm break-all font-semibold">
                {recoveryKey}
              </code>
              <CopyButton text={recoveryKey} iconOnly className="btn-secondary py-2 px-2 shrink-0" />
            </div>
          </div>
        )}

      <div className="grid lg:grid-cols-5 gap-4 min-h-[60vh]">
        <div className={`lg:col-span-2 card p-0 overflow-hidden ${selectedId ? 'hidden lg:block' : ''}`}>
          <div className="p-3 border-b border-light-200 dark:border-dark-800 flex items-center justify-between">
            <h2 className="text-sm font-medium text-light-600 dark:text-dark-300">
              Inbox ({emails.length})
            </h2>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${mode === 'polling' ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
              {lastUpdated && (
                <span className="text-xs font-medium text-light-500 dark:text-dark-400 whitespace-nowrap">
                  {lastUpdated.toLocaleTimeString()}
                </span>
              )}
              <button onClick={fetchEmails} className="p-1.5 text-light-500 dark:text-dark-400 hover:text-light-700 dark:hover:text-white" title="Refresh">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
          <div className="overflow-auto max-h-[65vh]">
            {fetchError ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="w-12 h-12 mb-3 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <p className="text-sm text-red-600 dark:text-red-400 mb-1">Failed to load emails</p>
                <p className="text-xs text-light-500 dark:text-dark-500 mb-3">{fetchError}</p>
                <button onClick={fetchEmails} className="btn-primary py-2 px-4 text-sm">
                  Retry
                </button>
              </div>
            ) : (
              <EmailList
                emails={emails}
                selectedId={selectedId}
                onSelect={handleSelectEmail}
              />
            )}
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