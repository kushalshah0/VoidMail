export default function EmailDetail({ email, onBack }) {
  if (!email) {
    return (
      <div className="flex items-center justify-center h-full text-light-500 dark:text-dark-500">
        <div className="text-center">
          <div className="w-14 h-14 mb-3 rounded-full bg-light-200 dark:bg-dark-800 flex items-center justify-center mx-auto">
            <svg className="w-7 h-7 text-light-400 dark:text-dark-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-light-600 dark:text-dark-400">Select an email to read</p>
        </div>
      </div>
    );
  }

  const date = new Date(email.receivedAt);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-light-200 dark:border-dark-800">
        <button
          onClick={onBack}
          className="lg:hidden text-light-500 dark:text-dark-400 
                     hover:text-light-700 dark:hover:text-white 
                     text-sm mb-3 flex items-center gap-1"
        >
          ← Back
        </button>

        <h2 className="text-lg font-semibold text-light-900 dark:text-white mb-3">
          {email.subject || '(No Subject)'}
        </h2>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <div>
            <span className="text-light-500 dark:text-dark-500">From: </span>
            <span className="text-light-800 dark:text-dark-200">{email.from}</span>
          </div>
          <div>
            <span className="text-light-500 dark:text-dark-500">To: </span>
            <span className="text-light-800 dark:text-dark-200">{email.to}</span>
          </div>
          <div>
            <span className="text-light-500 dark:text-dark-500">Date: </span>
            <span className="text-light-800 dark:text-dark-200">
              {date.toLocaleDateString()} {date.toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {email.html ? (
          <div className="bg-white rounded-xl p-4 text-light-900 shadow-sm border border-light-200 dark:border-dark-700">
            <iframe
              srcDoc={email.html}
              title="Email content"
              className="w-full min-h-[400px] border-0"
              sandbox="allow-same-origin"
              style={{ colorScheme: 'light' }}
            />
          </div>
        ) : (
          <pre className="whitespace-pre-wrap text-light-700 dark:text-dark-300 text-sm font-sans leading-relaxed">
            {email.text || 'No content'}
          </pre>
        )}
      </div>
    </div>
  );
}
