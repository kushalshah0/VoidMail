export default function EmailList({ emails, selectedId, onSelect }) {
  if (emails.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 mb-4 rounded-full bg-dark-800 flex items-center justify-center">
          <svg className="w-8 h-8 text-dark-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-dark-300 mb-2">
          No emails yet
        </h3>
        <p className="text-dark-500 text-sm max-w-xs">
          Emails sent to your temporary address will appear here automatically.
        </p>
        <div className="mt-6 flex items-center gap-2 text-dark-600 text-xs">
          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Auto-refreshing every 5 seconds
        </div>
      </div>
    );
  }

  return (
    <div className="divide-y divide-dark-800">
      {emails.map((email) => {
        const isSelected = email.id === selectedId;
        const date = new Date(email.receivedAt);
        const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        return (
          <button
            key={email.id}
            onClick={() => onSelect(email.id)}
            className={`w-full text-left p-4 transition-all duration-200 hover:bg-dark-800/50
              ${isSelected ? 'bg-brand-600/10 border-l-2 border-brand-500' : 'border-l-2 border-transparent'}
              ${!email.read ? 'bg-dark-800/30' : ''}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {!email.read && (
                    <span className="w-2 h-2 bg-brand-500 rounded-full shrink-0" />
                  )}
                  <span className={`text-sm truncate ${!email.read ? 'font-semibold text-white' : 'text-dark-300'}`}>
                    {email.from}
                  </span>
                </div>
                <p className={`text-sm truncate ${!email.read ? 'text-dark-200' : 'text-dark-400'}`}>
                  {email.subject || '(No Subject)'}
                </p>
                <p className="text-xs text-dark-500 mt-1 truncate">
                  {email.snippet}
                </p>
              </div>
              <span className="text-xs text-dark-500 shrink-0 mt-0.5">
                {timeStr}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
