import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getInbox } from '../utils/api';
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

  const emailAddress = address;

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
  }, 2000);

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

  const handleDelete = () => {
    // Emails auto-expire after 1 hour, no manual delete needed
    navigate('/');
  };

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
                            border border-brand-200 dark:border-brand-600/20 
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
              </div>
              <div className="flex items-center gap-2">
                <span className="sm:hidden w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="hidden sm:inline badge-green text-xs">Active</span>
                <span className="text-light-500 dark:text-dark-500 text-xs">
                  Auto-expires in 1 hour
                </span>
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <CopyButton text={emailAddress} label="Copy" className="btn-secondary py-2 px-3 text-sm" />
            <button onClick={handleDelete} className="btn-secondary inline-flex items-center gap-1.5 py-2 px-3 text-sm 
                       text-red-500 dark:text-red-400 
                       hover:text-red-600 dark:hover:text-red-300" title="Return to home">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="ml-1">Home</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-4 min-h-[60vh]">
        <div className={`lg:col-span-2 card p-0 overflow-hidden ${selectedId ? 'hidden lg:block' : ''}`}>
          <div className="p-3 border-b border-light-200 dark:border-dark-800 flex items-center justify-between">
            <h2 className="text-sm font-medium text-light-600 dark:text-dark-300">
              Inbox ({emails.length})
            </h2>
            <div className="flex items-center gap-2">
              {lastUpdated && (
                <span className="text-xs text-light-400 dark:text-dark-500">
                  {lastUpdated.toLocaleTimeString()}
                </span>
              )}
              <span className="flex items-center gap-1 text-xs text-light-500 dark:text-dark-400">
                <span className={`w-2 h-2 rounded-full ${mode === 'polling' ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                {mode === 'polling' ? 'Live' : 'Connecting...'}
              </span>
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