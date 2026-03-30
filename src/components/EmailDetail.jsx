import { useEffect, useMemo, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

const EMAIL_DOCUMENT_STYLES = `
  :root {
    color-scheme: light only;
    supported-color-schemes: light;
  }

  html,
  body {
    margin: 0 !important;
    padding: 0 !important;
    min-height: 100%;
    width: 100%;
    background: #ffffff !important;
    color: #111827;
  }

  body {
    -webkit-text-size-adjust: 100%;
    overflow-wrap: anywhere;
  }

  img {
    max-width: 100% !important;
    height: auto !important;
  }

  table {
    max-width: 100% !important;
  }

  pre {
    white-space: pre-wrap !important;
    word-break: break-word !important;
  }

  blockquote {
    max-width: 100%;
  }

  a {
    color: #2563eb;
  }
`;

function buildEmailSrcDoc(html) {
  const headInjection = `
    <meta charset="utf-8" />
    <meta name="color-scheme" content="light only" />
    <meta name="supported-color-schemes" content="light" />
    <style>${EMAIL_DOCUMENT_STYLES}</style>
  `;

  if (/<head[\s>]/i.test(html)) {
    return html.replace(/<head([^>]*)>/i, `<head$1>${headInjection}`);
  }

  if (/<html[\s>]/i.test(html)) {
    return html.replace(/<html([^>]*)>/i, `<html$1><head>${headInjection}</head>`);
  }

  return `<!DOCTYPE html>
  <html>
    <head>${headInjection}</head>
    <body>${html}</body>
  </html>`;
}

export default function EmailDetail({ email, onBack }) {
  const iframeRef = useRef(null);
  const { isDark } = useTheme();

  const resizeIframe = () => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) return;

      const height = Math.max(
        doc.documentElement?.scrollHeight || 0,
        doc.body?.scrollHeight || 0,
        400
      );

      iframe.style.height = `${height + 1}px`;
    } catch {
      iframe.style.height = '400px';
    }
  };

  useEffect(() => {
    if (!email?.html) return;

    const frame = iframeRef.current;
    if (!frame) return;

    const timers = [
      window.setTimeout(resizeIframe, 0),
      window.setTimeout(resizeIframe, 150),
      window.setTimeout(resizeIframe, 500),
      window.setTimeout(resizeIframe, 1200),
    ];

    return () => timers.forEach(window.clearTimeout);
  }, [email?.id, email?.html]);

  const srcDoc = useMemo(() => {
    if (!email?.html) return '';
    return buildEmailSrcDoc(email.html);
  }, [email?.html]);

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
          <div className={`rounded-xl shadow-sm overflow-hidden border ${
            isDark
              ? 'bg-dark-950 border-dark-700'
              : 'bg-white border-light-200'
          }`}>
            
            <iframe
              key={email.id}
              ref={iframeRef}
              srcDoc={srcDoc}
              title="Email content"
              className="w-full border-0 block bg-white"
              style={{ minHeight: '400px' }}
              sandbox="allow-same-origin"
              onLoad={resizeIframe}
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
