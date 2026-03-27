export default function EmailDetail({ email, onBack }) {
  if (!email) {
    return (
      <div className="flex items-center justify-center h-full text-light-500 dark:text-dark-500">
        <div className="text-center">
          <div className="w-14 h-14 mb-3 rounded-full bg-light-100 dark:bg-dark-800 flex items-center justify-center mx-auto">
            <svg className="w-7 h-7 text-light-500 dark:text-dark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div className="bg-white dark:bg-dark-900 rounded-xl shadow-sm border border-light-200 dark:border-dark-700 overflow-hidden">
            <iframe
              srcDoc={`<!DOCTYPE html>
<html>
<head>
<style>
  * { box-sizing: border-box; }
  body { 
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    font-size: 15px;
    line-height: 1.6;
    padding: 20px;
    margin: 0;
    background: transparent;
    color: #1f2937;
  }
  @media (prefers-color-scheme: dark) {
    body { color: #e5e7eb; }
  }
  img { max-width: 100%; height: auto; border-radius: 4px; }
  a { color: #2563eb; text-decoration: underline; }
  @media (prefers-color-scheme: dark) {
    a { color: #60a5fa; }
  }
  blockquote { 
    border-left: 4px solid #e5e7eb;
    margin: 16px 0;
    padding: 8px 16px;
    color: #4b5563;
    background: #f9fafb;
    border-radius: 0 4px 4px 0;
  }
  @media (prefers-color-scheme: dark) {
    blockquote { 
      border-color: #4b5563;
      color: #9ca3af;
      background: #1f2937;
    }
  }
  pre { 
    background: #f3f4f6;
    padding: 12px;
    border-radius: 6px;
    overflow-x: auto;
    font-size: 13px;
  }
  @media (prefers-color-scheme: dark) {
    pre { background: #1f2937; }
  }
  table { border-collapse: collapse; width: 100%; }
  td, th { padding: 8px; border: 1px solid #e5e7eb; }
  @media (prefers-color-scheme: dark) {
    td, th { border-color: #4b5563; }
  }
  h1, h2, h3, h4, h5, h6 { margin: 16px 0 8px; font-weight: 600; }
  p { margin: 12px 0; }
</style>
</head>
<body>${email.html}</body>
</html>`}
              title="Email content"
              className="w-full min-h-[400px] border-0"
              sandbox="allow-same-origin"
            />
          </div>
        ) : (
          <div className="bg-white dark:bg-dark-900 rounded-xl p-5 shadow-sm border border-light-200 dark:border-dark-700">
            <pre className="whitespace-pre-wrap text-light-700 dark:text-dark-300 text-sm font-sans leading-relaxed m-0">
              {email.text || 'No content'}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
