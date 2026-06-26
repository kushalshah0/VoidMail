const GRADIENTS = [
  'from-blue-500 to-purple-500',
  'from-emerald-500 to-teal-500',
  'from-orange-500 to-red-500',
  'from-pink-500 to-rose-500',
  'from-violet-500 to-indigo-500',
  'from-cyan-500 to-blue-500',
  'from-amber-500 to-orange-500',
  'from-lime-500 to-green-500',
];

function getGradient(name) {
  const charCode = (name || '').charCodeAt(0) || 0;
  return GRADIENTS[charCode % GRADIENTS.length];
}

function getInitials(from) {
  if (!from) return '?';
  const name = from.split('@')[0].replace(/[._-]/g, ' ').trim();
  const parts = name.split(' ').filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export default function EmailList({ emails, selectedId, onSelect }) {
  if (emails.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 mb-4 rounded-full bg-light-100 dark:bg-dark-800 flex items-center justify-center">
          <svg className="w-8 h-8 text-light-500 dark:text-dark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-light-800 dark:text-dark-300 mb-2">
          No emails yet
        </h3>
        <p className="text-light-700 dark:text-dark-500 text-sm max-w-xs font-medium">
          Emails sent to your temporary address will appear here automatically.
        </p>
        <div className="mt-6 flex items-center gap-2 text-light-500 dark:text-dark-600 text-xs">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          Checking every 2 seconds
        </div>
      </div>
    );
  }

  return (
    <div className="divide-y divide-light-200 dark:divide-dark-800">
      {emails.map((email) => {
        const isSelected = email.id === selectedId;
        const date = new Date(email.received_at * 1000);
        const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const gradient = getGradient(email.from_addr);
        const initials = getInitials(email.from_addr);

        return (
          <button
            key={email.id}
            onClick={() => onSelect(email.id)}
            className={`w-full text-left p-4 transition-all duration-200 
              hover:bg-light-100 dark:hover:bg-dark-800/50
              ${isSelected
                ? 'bg-brand-50 dark:bg-brand-600/10 border-l-2 border-brand-500'
                : 'border-l-2 border-transparent'
              }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0`}>
                <span className="text-xs font-bold text-white">{initials}</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-sm truncate 
                    ${email.read ? 'text-light-600 dark:text-dark-300' : 'font-semibold text-light-900 dark:text-white'
                    }`}>
                    {email.from_addr}
                  </span>
                </div>
                <p className={`text-sm truncate 
                  ${email.read
                    ? 'text-light-500 dark:text-dark-400'
                    : 'text-light-800 dark:text-dark-200'
                  }`}>
                  {email.subject || '(No Subject)'}
                </p>
                <p className="text-xs text-light-400 dark:text-dark-500 mt-1 truncate">
                  {email.snippet || email.text?.substring(0, 100) || 'No preview'}
                </p>
              </div>
              <span className="text-xs text-light-400 dark:text-dark-500 shrink-0 mt-0.5">
                {timeStr}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}