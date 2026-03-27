# 📧 VoidMail — Disposable Email Service on Cloudflare

A complete React + Cloudflare Pages/Workers/KV/Email Routing application.

---

## 📁 Project Structure

```
voidmail/
├── README.md
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── wrangler.toml
├── public/
│   ├── favicon.svg
│   └── _headers
├── src/
│   ├── main.jsx
│   ├── index.css
│   ├── App.jsx
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   └── InboxPage.jsx
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   ├── GenerateForm.jsx
│   │   ├── RecoveryForm.jsx
│   │   ├── EmailList.jsx
│   │   ├── EmailDetail.jsx
│   │   ├── CountdownTimer.jsx
│   │   ├── CopyButton.jsx
│   │   ├── FeatureCard.jsx
│   │   └── Notification.jsx
│   ├── utils/
│   │   └── api.js
│   └── hooks/
│       └── usePolling.js
├── functions/
│   └── api/
│       ├── _middleware.js
│       ├── inbox.js
│       ├── inbox/
│       │   └── [username].js
│       ├── emails/
│       │   └── [username].js
│       ├── email/
│       │   └── [id].js
│       └── recover.js
└── email-worker/
    ├── src/
    │   └── worker.js
    ├── package.json
    └── wrangler.toml
```

---

## 1. `package.json`

```json
{
  "name": "voidmail-cloudflare",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "pages:dev": "wrangler pages dev --compatibility-date=2024-01-01 -- vite",
    "pages:deploy": "npm run build && wrangler pages deploy dist",
    "kv:create": "wrangler kv namespace create VOIDMAIL_KV",
    "kv:create:preview": "wrangler kv namespace create VOIDMAIL_KV --preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.23.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.0",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.4",
    "vite": "^5.3.1",
    "wrangler": "^3.60.0"
  }
}
```

---

## 2. `vite.config.js`

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8788',
        changeOrigin: true,
      },
    },
  },
});
```

---

## 3. `tailwind.config.js`

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef7ff',
          100: '#d9edff',
          200: '#bce0ff',
          300: '#8eccff',
          400: '#59aeff',
          500: '#338bfc',
          600: '#1d6cf1',
          700: '#1555de',
          800: '#1846b4',
          900: '#193e8d',
          950: '#142756',
        },
        dark: {
          50: '#f6f6f7',
          100: '#e2e3e5',
          200: '#c4c5ca',
          300: '#9fa0a8',
          400: '#7b7c85',
          500: '#60616a',
          600: '#4c4d54',
          700: '#3e3f44',
          800: '#2a2b2f',
          900: '#1a1b1e',
          950: '#111114',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
```

---

## 4. `postcss.config.js`

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

---

## 5. `wrangler.toml` (Root — Pages config)

```toml
name = "voidmail"
compatibility_date = "2024-01-01"
pages_build_output_dir = "dist"

# ──────────────────────────────────────────────
# KV Namespace Bindings
# Run: npm run kv:create   → get the ID
# Run: npm run kv:create:preview → get preview ID
# ──────────────────────────────────────────────

[[kv_namespaces]]
binding = "VOIDMAIL_KV"
id = "YOUR_KV_NAMESPACE_ID"
preview_id = "YOUR_PREVIEW_KV_NAMESPACE_ID"

[vars]
EMAIL_DOMAIN = "yourdomain.com"
INBOX_TTL = "86400"
ADMIN_KEY = "your-secret-admin-key"
```

---

## 6. `index.html`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Free disposable temporary email. Instant, private, zero tracking." />
    <title>VoidMail — Instant Disposable Email</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

---

## 7. `public/favicon.svg`

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="20" fill="#1d6cf1"/>
  <text x="50" y="68" font-size="55" text-anchor="middle" fill="white" font-family="sans-serif" font-weight="bold">✉</text>
</svg>
```

---

## 8. `public/_headers`

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  X-XSS-Protection: 1; mode=block
```

---

## 9. `src/index.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * {
    box-sizing: border-box;
  }

  body {
    @apply bg-dark-950 text-dark-100 antialiased;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  ::-webkit-scrollbar {
    width: 6px;
  }

  ::-webkit-scrollbar-track {
    @apply bg-dark-900;
  }

  ::-webkit-scrollbar-thumb {
    @apply bg-dark-600 rounded-full;
  }
}

@layer components {
  .btn-primary {
    @apply bg-brand-600 hover:bg-brand-700 text-white font-semibold 
           py-3 px-6 rounded-xl transition-all duration-200 
           shadow-lg shadow-brand-600/25 hover:shadow-brand-600/40
           active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed;
  }

  .btn-secondary {
    @apply bg-dark-800 hover:bg-dark-700 text-dark-200 font-medium 
           py-3 px-6 rounded-xl transition-all duration-200 
           border border-dark-700 hover:border-dark-600
           active:scale-[0.98];
  }

  .input-field {
    @apply bg-dark-900 border border-dark-700 rounded-xl px-4 py-3 
           text-white placeholder-dark-500 focus:outline-none 
           focus:ring-2 focus:ring-brand-600 focus:border-transparent
           transition-all duration-200 w-full;
  }

  .card {
    @apply bg-dark-900/80 backdrop-blur-sm border border-dark-800 
           rounded-2xl p-6 transition-all duration-300;
  }

  .card-hover {
    @apply card hover:border-dark-700 hover:bg-dark-900 cursor-pointer;
  }

  .badge {
    @apply inline-flex items-center px-3 py-1 rounded-full text-xs 
           font-medium;
  }

  .badge-green {
    @apply badge bg-emerald-500/10 text-emerald-400 border border-emerald-500/20;
  }

  .badge-blue {
    @apply badge bg-brand-500/10 text-brand-400 border border-brand-500/20;
  }

  .badge-yellow {
    @apply badge bg-amber-500/10 text-amber-400 border border-amber-500/20;
  }

  .badge-red {
    @apply badge bg-red-500/10 text-red-400 border border-red-500/20;
  }

  .glow {
    @apply relative;
  }

  .glow::before {
    content: '';
    @apply absolute -inset-1 bg-brand-600/20 rounded-2xl blur-xl -z-10;
  }
}
```

---

## 10. `src/main.jsx`

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```

---

## 11. `src/App.jsx`

```jsx
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import InboxPage from './pages/InboxPage';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/inbox/:username" element={<InboxPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
```

---

## 12. `src/components/Header.jsx`

```jsx
import { Link, useLocation } from 'react-router-dom';

export default function Header() {
  const location = useLocation();
  const isInbox = location.pathname.startsWith('/inbox');

  return (
    <header className="border-b border-dark-800 bg-dark-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center 
                          text-white text-lg group-hover:scale-110 transition-transform">
            ✉
          </div>
          <span className="text-xl font-bold text-white">
            Void<span className="text-brand-400">Mail</span>
          </span>
        </Link>

        <nav className="flex items-center gap-4">
          {isInbox && (
            <Link to="/" className="btn-secondary text-sm py-2 px-4">
              ← New Inbox
            </Link>
          )}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-dark-400 hover:text-dark-200 transition-colors text-sm"
          >
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}
```

---

## 13. `src/components/Footer.jsx`

```jsx
export default function Footer() {
  return (
    <footer className="border-t border-dark-800 py-8 mt-auto">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-dark-500 text-sm">
            <span>✉</span>
            <span>VoidMail — Free temporary email service</span>
          </div>

          <div className="flex items-center gap-6 text-sm text-dark-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Powered by Cloudflare
            </span>
            <span>Zero Tracking</span>
            <span>Auto-Delete</span>
          </div>

          <p className="text-dark-600 text-xs">
            © {new Date().getFullYear()} VoidMail. Built with ❤️
          </p>
        </div>
      </div>
    </footer>
  );
}
```

---

## 14. `src/components/FeatureCard.jsx`

```jsx
export default function FeatureCard({ icon, title, description, badge }) {
  return (
    <div className="card group hover:border-dark-700 transition-all duration-300">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-brand-600/10 border border-brand-600/20 
                        flex items-center justify-center text-2xl shrink-0
                        group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-white">{title}</h3>
            {badge && <span className="badge-green text-[10px]">{badge}</span>}
          </div>
          <p className="text-dark-400 text-sm leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}
```

---

## 15. `src/components/GenerateForm.jsx`

```jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createInbox } from '../utils/api';
import Notification from './Notification';

export default function GenerateForm() {
  const [username, setUsername] = useState('');
  const [ttlHours, setTtlHours] = useState(24);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  const generateRandomUsername = () => {
    const adjectives = ['swift', 'quiet', 'brave', 'clever', 'bright', 'calm', 'bold', 'keen'];
    const nouns = ['fox', 'owl', 'wolf', 'hawk', 'bear', 'lynx', 'crow', 'deer'];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const num = Math.floor(Math.random() * 9999);
    setUsername(`${adj}.${noun}${num}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setNotification({ type: 'error', message: 'Please enter a username' });
      return;
    }

    if (!/^[a-zA-Z0-9._-]+$/.test(username)) {
      setNotification({ type: 'error', message: 'Username can only contain letters, numbers, dots, hyphens, and underscores' });
      return;
    }

    setLoading(true);
    try {
      const data = await createInbox(username.toLowerCase(), ttlHours);

      sessionStorage.setItem(`recovery_${username.toLowerCase()}`, data.recoveryKey);
      sessionStorage.setItem(`created_${username.toLowerCase()}`, data.createdAt);
      sessionStorage.setItem(`expires_${username.toLowerCase()}`, data.expiresAt);

      navigate(`/inbox/${username.toLowerCase()}`);
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to create inbox',
      });
    } finally {
      setLoading(false);
    }
  };

  const domain = import.meta.env.VITE_EMAIL_DOMAIN || 'yourdomain.com';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {notification && (
        <Notification
          {...notification}
          onClose={() => setNotification(null)}
        />
      )}

      <div>
        <label className="block text-sm font-medium text-dark-300 mb-2">
          Choose your temporary address
        </label>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              placeholder="username"
              className="input-field pr-24"
              maxLength={30}
              autoComplete="off"
              spellCheck="false"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 text-sm">
              @{domain}
            </span>
          </div>
          <button
            type="button"
            onClick={generateRandomUsername}
            className="btn-secondary py-3 px-4 text-sm shrink-0"
            title="Generate random username"
          >
            🎲
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-dark-300 mb-2">
          Inbox lifetime
        </label>
        <div className="grid grid-cols-4 gap-2">
          {[1, 6, 12, 24].map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => setTtlHours(h)}
              className={`py-2 px-3 rounded-xl text-sm font-medium transition-all
                ${ttlHours === h
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/25'
                  : 'bg-dark-800 text-dark-400 hover:bg-dark-700 border border-dark-700'
                }`}
            >
              {h}h
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !username.trim()}
        className="btn-primary w-full text-base"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Creating...
          </span>
        ) : (
          '🚀 Generate Inbox'
        )}
      </button>
    </form>
  );
}
```

---

## 16. `src/components/RecoveryForm.jsx`

```jsx
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
        <label className="block text-sm font-medium text-dark-300 mb-2">
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
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 text-sm">
            @{domain}
          </span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-dark-300 mb-2">
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
        {loading ? 'Recovering...' : '🔑 Access Inbox'}
      </button>
    </form>
  );
}
```

---

## 17. `src/components/CopyButton.jsx`

```jsx
import { useState } from 'react';

export default function CopyButton({ text, label = 'Copy', className = '' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 text-sm transition-all duration-200 ${className}`}
      title={`Copy ${label}`}
    >
      {copied ? (
        <>
          <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-emerald-400">Copied!</span>
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
```

---

## 18. `src/components/CountdownTimer.jsx`

```jsx
import { useState, useEffect } from 'react';

export default function CountdownTimer({ expiresAt }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [urgency, setUrgency] = useState('normal');

  useEffect(() => {
    const update = () => {
      const now = Date.now();
      const expiry = new Date(expiresAt).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeft('Expired');
        setUrgency('critical');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(
        `${hours.toString().padStart(2, '0')}:${minutes
          .toString()
          .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );

      if (diff < 1000 * 60 * 30) setUrgency('critical');
      else if (diff < 1000 * 60 * 60 * 2) setUrgency('warning');
      else setUrgency('normal');
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const colorMap = {
    normal: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    warning: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    critical: 'text-red-400 bg-red-500/10 border-red-500/20',
  };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-mono ${colorMap[urgency]}`}>
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{timeLeft}</span>
    </div>
  );
}
```

---

## 19. `src/components/EmailList.jsx`

```jsx
export default function EmailList({ emails, selectedId, onSelect }) {
  if (emails.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-6xl mb-4 opacity-50">📭</div>
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
```

---

## 20. `src/components/EmailDetail.jsx`

```jsx
import CopyButton from './CopyButton';

export default function EmailDetail({ email, onBack }) {
  if (!email) {
    return (
      <div className="flex items-center justify-center h-full text-dark-500">
        <div className="text-center">
          <div className="text-5xl mb-3 opacity-30">📧</div>
          <p>Select an email to read</p>
        </div>
      </div>
    );
  }

  const date = new Date(email.receivedAt);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-dark-800">
        <button
          onClick={onBack}
          className="md:hidden text-dark-400 hover:text-white text-sm mb-3 flex items-center gap-1"
        >
          ← Back
        </button>

        <h2 className="text-lg font-semibold text-white mb-3">
          {email.subject || '(No Subject)'}
        </h2>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <div>
            <span className="text-dark-500">From: </span>
            <span className="text-dark-200">{email.from}</span>
          </div>
          <div>
            <span className="text-dark-500">To: </span>
            <span className="text-dark-200">{email.to}</span>
          </div>
          <div>
            <span className="text-dark-500">Date: </span>
            <span className="text-dark-200">
              {date.toLocaleDateString()} {date.toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {email.html ? (
          <div className="bg-white rounded-xl p-4 text-dark-900">
            <iframe
              srcDoc={email.html}
              title="Email content"
              className="w-full min-h-[400px] border-0"
              sandbox="allow-same-origin"
              style={{ colorScheme: 'light' }}
            />
          </div>
        ) : (
          <pre className="whitespace-pre-wrap text-dark-300 text-sm font-sans leading-relaxed">
            {email.text || 'No content'}
          </pre>
        )}
      </div>

      <div className="p-4 border-t border-dark-800 flex items-center gap-3">
        <CopyButton
          text={email.text || email.html || ''}
          label="Copy content"
          className="btn-secondary py-2 px-3"
        />
        {email.headers && (
          <details className="text-sm">
            <summary className="text-dark-500 cursor-pointer hover:text-dark-300">
              View Headers
            </summary>
            <pre className="mt-2 p-3 bg-dark-800 rounded-xl text-xs text-dark-400 overflow-auto max-h-40">
              {JSON.stringify(email.headers, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
```

---

## 21. `src/components/Notification.jsx`

```jsx
import { useEffect } from 'react';

export default function Notification({ type = 'info', message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    error: 'bg-red-500/10 border-red-500/30 text-red-400',
    success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    info: 'bg-brand-500/10 border-brand-500/30 text-brand-400',
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
  };

  const icons = {
    error: '✕',
    success: '✓',
    info: 'ℹ',
    warning: '⚠',
  };

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border animate-slide-up ${styles[type]}`}>
      <span className="text-lg">{icons[type]}</span>
      <span className="flex-1 text-sm">{message}</span>
      <button onClick={onClose} className="opacity-60 hover:opacity-100 transition-opacity">
        ✕
      </button>
    </div>
  );
}
```

---

## 22. `src/pages/HomePage.jsx`

```jsx
import { useState } from 'react';
import GenerateForm from '../components/GenerateForm';
import RecoveryForm from '../components/RecoveryForm';
import FeatureCard from '../components/FeatureCard';

export default function HomePage() {
  const [tab, setTab] = useState('generate');

  const features = [
    {
      icon: '⚡',
      title: 'Instant Setup',
      description: 'No registration required. Generate a disposable inbox in seconds.',
      badge: 'Fast',
    },
    {
      icon: '🔑',
      title: 'Recovery Key',
      description: 'Get a unique key to re-access your inbox from any device.',
    },
    {
      icon: '⏰',
      title: 'Auto-Expires',
      description: 'Inboxes self-destruct after your chosen time. 1h, 6h, 12h, or 24h.',
    },
    {
      icon: '🛡️',
      title: 'Zero Tracking',
      description: 'No cookies, no analytics, no logs. Your privacy is absolute.',
    },
    {
      icon: '☁️',
      title: 'Edge Powered',
      description: "Runs on Cloudflare's global edge network. Blazing fast worldwide.",
      badge: 'Cloudflare',
    },
    {
      icon: '🗑️',
      title: 'No Signup',
      description: 'No personal information needed. Ever. Just pick a username and go.',
    },
  ];

  return (
    <div className="animate-fade-in">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-600/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-600/5 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 pt-20 pb-16">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 badge-blue mb-6">
              <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-pulse" />
              Zero Tracking • Auto-Delete
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Disposable Email.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-600">
                Instant & Private.
              </span>
            </h1>

            <p className="text-lg text-dark-400 leading-relaxed">
              Generate a temporary inbox instantly. Protect your real email from
              spam, bots, and unwanted signups. Powered by Cloudflare's edge network.
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <div className="card glow">
              <div className="flex mb-6 bg-dark-800 rounded-xl p-1">
                <button
                  onClick={() => setTab('generate')}
                  className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all
                    ${tab === 'generate'
                      ? 'bg-brand-600 text-white shadow-lg'
                      : 'text-dark-400 hover:text-dark-200'
                    }`}
                >
                  🆕 New Inbox
                </button>
                <button
                  onClick={() => setTab('recover')}
                  className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all
                    ${tab === 'recover'
                      ? 'bg-brand-600 text-white shadow-lg'
                      : 'text-dark-400 hover:text-dark-200'
                    }`}
                >
                  🔑 Recovery Login
                </button>
              </div>

              {tab === 'generate' ? <GenerateForm /> : <RecoveryForm />}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-white mb-3">
            Why VoidMail?
          </h2>
          <p className="text-dark-400">
            Built on Cloudflare's edge — fast, private, and ephemeral by design.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <FeatureCard key={i} {...feature} />
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-white text-center mb-12">
          How It Works
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: '01', title: 'Pick a Username', desc: 'Choose any username or let us generate one randomly.' },
            { step: '02', title: 'Receive Emails', desc: 'Use your temp address anywhere. Emails appear instantly.' },
            { step: '03', title: 'Auto-Destruct', desc: 'Everything is permanently deleted when the timer expires.' },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="text-4xl font-bold text-brand-600/30 mb-3">
                {item.step}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-dark-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
```

---

## 23. `src/pages/InboxPage.jsx`

```jsx
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
          <p className="text-dark-400">Loading inbox...</p>
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
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-600/10 border border-brand-600/20 rounded-xl 
                            flex items-center justify-center text-2xl">
              📬
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold text-white">{emailAddress}</h1>
                <CopyButton text={emailAddress} label="Copy" className="text-brand-400 hover:text-brand-300" />
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="badge-green text-xs">Active</span>
                <span className="text-dark-500 text-xs">{emails.length} email(s)</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {expiresAt && <CountdownTimer expiresAt={expiresAt} />}
            <button onClick={fetchEmails} className="btn-secondary py-2 px-3 text-sm" title="Refresh">
              🔄
            </button>
            <button onClick={handleDelete} className="btn-secondary py-2 px-3 text-sm text-red-400 hover:text-red-300" title="Delete inbox">
              🗑️
            </button>
          </div>
        </div>

        {recoveryKey && showRecovery && (
          <div className="mt-4 p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-amber-400">🔑</span>
                <div>
                  <p className="text-sm text-amber-300 font-medium">Recovery Key — Save this!</p>
                  <p className="text-xs text-dark-400 mt-0.5">
                    Use this key to access your inbox from another device or session
                  </p>
                </div>
              </div>
              <button onClick={() => setShowRecovery(false)} className="text-dark-500 hover:text-dark-300 text-xs">
                Hide
              </button>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <code className="flex-1 bg-dark-800 rounded-lg px-4 py-2 font-mono text-amber-400 tracking-widest text-center">
                {recoveryKey}
              </code>
              <CopyButton text={recoveryKey} label="Copy" className="btn-secondary py-2 px-3 text-sm" />
            </div>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-5 gap-4 min-h-[60vh]">
        <div className="lg:col-span-2 card p-0 overflow-hidden">
          <div className="p-3 border-b border-dark-800">
            <h2 className="text-sm font-medium text-dark-300">
              Inbox ({emails.length})
            </h2>
          </div>
          <div className="overflow-auto max-h-[65vh]">
            <EmailList
              emails={emails}
              selectedId={selectedId}
              onSelect={handleSelectEmail}
            />
          </div>
        </div>

        <div className="lg:col-span-3 card p-0 overflow-hidden">
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
```

---

## 24. `src/utils/api.js`

```js
const API_BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }

  return data;
}

export function createInbox(username, ttlHours = 24) {
  return request('/inbox', {
    method: 'POST',
    body: JSON.stringify({ username, ttlHours }),
  });
}

export function getInbox(username) {
  return request(`/inbox/${username}`);
}

export function getEmails(username) {
  return request(`/emails/${username}`);
}

export function getEmail(emailId) {
  return request(`/email/${emailId}`);
}

export function recoverInbox(username, recoveryKey) {
  return request('/recover', {
    method: 'POST',
    body: JSON.stringify({ username, recoveryKey }),
  });
}

export function deleteInbox(username, recoveryKey) {
  return request(`/inbox/${username}`, {
    method: 'DELETE',
    body: JSON.stringify({ recoveryKey }),
  });
}
```

---

## 25. `src/hooks/usePolling.js`

```js
import { useEffect, useRef } from 'react';

export default function usePolling(callback, interval = 5000) {
  const savedCallback = useRef();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    savedCallback.current();

    const tick = () => savedCallback.current();
    const id = setInterval(tick, interval);

    return () => clearInterval(id);
  }, [interval]);
}
```

---

## 26. `functions/api/_middleware.js`

```js
export async function onRequest(context) {
  const { request } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(),
    });
  }

  const response = await context.next();

  const newResponse = new Response(response.body, response);
  for (const [key, value] of Object.entries(corsHeaders())) {
    newResponse.headers.set(key, value);
  }
  newResponse.headers.set('X-Content-Type-Options', 'nosniff');
  newResponse.headers.set('X-Frame-Options', 'DENY');

  return newResponse;
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}
```

---

## 27. `functions/api/inbox.js`

```js
export async function onRequestPost(context) {
  const { env, request } = context;
  const KV = env.VOIDMAIL_KV;

  try {
    const { username, ttlHours = 24 } = await request.json();

    if (!username || typeof username !== 'string') {
      return jsonResponse({ error: 'Username is required' }, 400);
    }

    const sanitized = username.toLowerCase().trim();

    if (!/^[a-z0-9._-]{3,30}$/.test(sanitized)) {
      return jsonResponse({
        error: 'Username must be 3-30 characters: letters, numbers, dots, hyphens, underscores',
      }, 400);
    }

    const reserved = ['admin', 'postmaster', 'abuse', 'webmaster', 'noreply', 'support', 'info'];
    if (reserved.includes(sanitized)) {
      return jsonResponse({ error: 'This username is reserved' }, 400);
    }

    const existing = await KV.get(`inbox:${sanitized}`);
    if (existing) {
      return jsonResponse({ error: 'This inbox already exists. Try a different username.' }, 409);
    }

    const validTTL = Math.min(Math.max(parseInt(ttlHours) || 24, 1), 24);
    const ttlSeconds = validTTL * 3600;

    const recoveryKey = generateRecoveryKey();

    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttlSeconds * 1000);

    const inboxData = {
      username: sanitized,
      email: `${sanitized}@${env.EMAIL_DOMAIN || 'yourdomain.com'}`,
      recoveryKey,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      ttlHours: validTTL,
    };

    await KV.put(`inbox:${sanitized}`, JSON.stringify(inboxData), {
      expirationTtl: ttlSeconds,
    });

    await KV.put(`recovery:${recoveryKey}`, sanitized, {
      expirationTtl: ttlSeconds,
    });

    await KV.put(`emails:${sanitized}`, JSON.stringify([]), {
      expirationTtl: ttlSeconds,
    });

    return jsonResponse({
      success: true,
      username: sanitized,
      email: inboxData.email,
      recoveryKey,
      createdAt: inboxData.createdAt,
      expiresAt: inboxData.expiresAt,
      ttlHours: validTTL,
    }, 201);

  } catch (err) {
    console.error('Create inbox error:', err);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}

function generateRecoveryKey() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const segments = [];
  for (let i = 0; i < 4; i++) {
    let segment = '';
    for (let j = 0; j < 4; j++) {
      const randomBytes = new Uint8Array(1);
      crypto.getRandomValues(randomBytes);
      segment += chars[randomBytes[0] % chars.length];
    }
    segments.push(segment);
  }
  return segments.join('-');
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
```

---

## 28. `functions/api/inbox/[username].js`

```js
export async function onRequestGet(context) {
  const { env, params } = context;
  const KV = env.VOIDMAIL_KV;
  const username = params.username.toLowerCase();

  try {
    const data = await KV.get(`inbox:${username}`, 'json');

    if (!data) {
      return jsonResponse({ error: 'Inbox not found or expired' }, 404);
    }

    const { recoveryKey, ...safe } = data;
    return jsonResponse(safe);

  } catch (err) {
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}

export async function onRequestDelete(context) {
  const { env, params, request } = context;
  const KV = env.VOIDMAIL_KV;
  const username = params.username.toLowerCase();

  try {
    const body = await request.json().catch(() => ({}));
    const inboxData = await KV.get(`inbox:${username}`, 'json');

    if (!inboxData) {
      return jsonResponse({ error: 'Inbox not found or expired' }, 404);
    }

    if (body.recoveryKey && body.recoveryKey !== inboxData.recoveryKey) {
      return jsonResponse({ error: 'Invalid recovery key' }, 403);
    }

    const emailList = await KV.get(`emails:${username}`, 'json') || [];
    const deletePromises = emailList.map((e) => KV.delete(`email:${e.id}`));

    deletePromises.push(
      KV.delete(`inbox:${username}`),
      KV.delete(`emails:${username}`),
      KV.delete(`recovery:${inboxData.recoveryKey}`)
    );

    await Promise.all(deletePromises);

    return jsonResponse({ success: true, message: 'Inbox deleted' });

  } catch (err) {
    console.error('Delete inbox error:', err);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
```

---

## 29. `functions/api/emails/[username].js`

```js
export async function onRequestGet(context) {
  const { env, params } = context;
  const KV = env.VOIDMAIL_KV;
  const username = params.username.toLowerCase();

  try {
    const inbox = await KV.get(`inbox:${username}`);
    if (!inbox) {
      return jsonResponse({ error: 'Inbox not found or expired' }, 404);
    }

    const emails = await KV.get(`emails:${username}`, 'json') || [];
    emails.sort((a, b) => new Date(b.receivedAt) - new Date(a.receivedAt));

    return jsonResponse({
      username,
      count: emails.length,
      emails,
    });

  } catch (err) {
    console.error('List emails error:', err);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
```

---

## 30. `functions/api/email/[id].js`

```js
export async function onRequestGet(context) {
  const { env, params } = context;
  const KV = env.VOIDMAIL_KV;
  const emailId = params.id;

  try {
    const email = await KV.get(`email:${emailId}`, 'json');

    if (!email) {
      return jsonResponse({ error: 'Email not found or expired' }, 404);
    }

    if (!email.read) {
      email.read = true;
      const inbox = await KV.get(`inbox:${email.inbox}`, 'json');
      if (inbox) {
        const remaining = Math.max(
          0,
          Math.floor((new Date(inbox.expiresAt) - Date.now()) / 1000)
        );
        if (remaining > 0) {
          await KV.put(`email:${emailId}`, JSON.stringify(email), {
            expirationTtl: remaining,
          });

          const emailList = await KV.get(`emails:${email.inbox}`, 'json') || [];
          const updated = emailList.map((e) =>
            e.emailId === emailId ? { ...e, read: true } : e
          );
          await KV.put(`emails:${email.inbox}`, JSON.stringify(updated), {
            expirationTtl: remaining,
          });
        }
      }
    }

    return jsonResponse(email);

  } catch (err) {
    console.error('Get email error:', err);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
```

---

## 31. `functions/api/recover.js`

```js
export async function onRequestPost(context) {
  const { env, request } = context;
  const KV = env.VOIDMAIL_KV;

  try {
    const { username, recoveryKey } = await request.json();

    if (!username || !recoveryKey) {
      return jsonResponse({ error: 'Username and recovery key are required' }, 400);
    }

    const sanitized = username.toLowerCase().trim();
    const keyUpper = recoveryKey.toUpperCase().trim();

    const inboxData = await KV.get(`inbox:${sanitized}`, 'json');

    if (!inboxData) {
      return jsonResponse({ error: 'Inbox not found or expired' }, 404);
    }

    if (inboxData.recoveryKey !== keyUpper) {
      return jsonResponse({ error: 'Invalid recovery key' }, 403);
    }

    const { recoveryKey: _key, ...safe } = inboxData;

    return jsonResponse({
      success: true,
      ...safe,
      expiresAt: inboxData.expiresAt,
    });

  } catch (err) {
    console.error('Recovery error:', err);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
```

---

## 32. Email Worker — `email-worker/src/worker.js`

```js
/**
 * Cloudflare Email Worker
 * 
 * Receives emails via Cloudflare Email Routing and stores them in KV.
 */

export default {
  async email(message, env) {
    const KV = env.VOIDMAIL_KV;

    try {
      const toAddress = message.to;
      const username = toAddress.split('@')[0].toLowerCase();

      const inboxData = await KV.get(`inbox:${username}`, 'json');
      if (!inboxData) {
        message.setReject('Inbox not found');
        return;
      }

      const rawEmail = await new Response(message.raw).text();
      const emailContent = parseEmail(rawEmail, message);
      const emailId = generateId();

      const remainingTtl = Math.max(
        60,
        Math.floor((new Date(inboxData.expiresAt) - Date.now()) / 1000)
      );

      const fullEmail = {
        id: emailId,
        inbox: username,
        from: message.from,
        to: toAddress,
        subject: emailContent.subject,
        text: emailContent.text,
        html: emailContent.html,
        snippet: emailContent.text?.substring(0, 150) || '',
        headers: emailContent.headers,
        receivedAt: new Date().toISOString(),
        read: false,
        size: rawEmail.length,
      };

      await KV.put(`email:${emailId}`, JSON.stringify(fullEmail), {
        expirationTtl: remainingTtl,
      });

      const emailList = await KV.get(`emails:${username}`, 'json') || [];
      emailList.push({
        id: emailId,
        from: message.from,
        subject: emailContent.subject,
        snippet: emailContent.text?.substring(0, 100) || '',
        receivedAt: fullEmail.receivedAt,
        read: false,
      });

      await KV.put(`emails:${username}`, JSON.stringify(emailList), {
        expirationTtl: remainingTtl,
      });

      console.log(`Email stored: ${emailId} for ${username}`);

    } catch (err) {
      console.error('Email worker error:', err);
    }
  },
};

function parseEmail(rawEmail, message) {
  const result = {
    subject: '',
    text: '',
    html: '',
    headers: {},
  };

  try {
    const headerBodySplit = rawEmail.indexOf('\r\n\r\n');
    const headerSection = rawEmail.substring(0, headerBodySplit);
    const bodySection = rawEmail.substring(headerBodySplit + 4);

    const headerLines = headerSection.split('\r\n');
    let currentHeader = '';

    for (const line of headerLines) {
      if (line.startsWith(' ') || line.startsWith('\t')) {
        currentHeader += ' ' + line.trim();
      } else {
        if (currentHeader) {
          const colonIndex = currentHeader.indexOf(':');
          if (colonIndex > -1) {
            const key = currentHeader.substring(0, colonIndex).trim().toLowerCase();
            const value = currentHeader.substring(colonIndex + 1).trim();
            result.headers[key] = value;
          }
        }
        currentHeader = line;
      }
    }

    if (currentHeader) {
      const colonIndex = currentHeader.indexOf(':');
      if (colonIndex > -1) {
        const key = currentHeader.substring(0, colonIndex).trim().toLowerCase();
        const value = currentHeader.substring(colonIndex + 1).trim();
        result.headers[key] = value;
      }
    }

    result.subject = result.headers['subject'] || message.headers?.get('subject') || '(No Subject)';
    result.subject = decodeHeaderValue(result.subject);

    const contentType = result.headers['content-type'] || '';

    if (contentType.includes('multipart')) {
      const boundaryMatch = contentType.match(/boundary="?([^";\s]+)"?/);
      if (boundaryMatch) {
        const boundary = boundaryMatch[1];
        const parts = bodySection.split(`--${boundary}`);

        for (const part of parts) {
          if (part.trim() === '--' || part.trim() === '') continue;

          const partHeaderEnd = part.indexOf('\r\n\r\n');
          if (partHeaderEnd === -1) continue;

          const partHeaders = part.substring(0, partHeaderEnd).toLowerCase();
          const partBody = part.substring(partHeaderEnd + 4).trim();

          if (partHeaders.includes('text/html')) {
            result.html = partBody;
          } else if (partHeaders.includes('text/plain')) {
            result.text = partBody;
          }
        }
      }
    } else if (contentType.includes('text/html')) {
      result.html = bodySection;
    } else {
      result.text = bodySection;
    }

    if (result.html) {
      result.html = sanitizeHtml(result.html);
    }

  } catch (err) {
    console.error('Email parse error:', err);
    result.text = rawEmail;
  }

  return result;
}

function decodeHeaderValue(value) {
  return value.replace(/=\?([^?]+)\?([BQ])\?([^?]+)\?=/gi, (match, charset, encoding, text) => {
    try {
      if (encoding.toUpperCase() === 'B') {
        return atob(text);
      } else if (encoding.toUpperCase() === 'Q') {
        return text.replace(/=([0-9A-Fa-f]{2})/g, (m, hex) =>
          String.fromCharCode(parseInt(hex, 16))
        ).replace(/_/g, ' ');
      }
    } catch {
      return match;
    }
    return match;
  });
}

function sanitizeHtml(html) {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/\son\w+\s*=\s*'[^']*'/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/<iframe\b[^>]*>/gi, '')
    .replace(/<\/iframe>/gi, '')
    .replace(/<object\b[^>]*>/gi, '')
    .replace(/<\/object>/gi, '')
    .replace(/<embed\b[^>]*>/gi, '');
}

function generateId() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}
```

---

## 33. `email-worker/wrangler.toml`

```toml
name = "voidmail-email-worker"
main = "src/worker.js"
compatibility_date = "2024-01-01"

[[kv_namespaces]]
binding = "VOIDMAIL_KV"
id = "YOUR_KV_NAMESPACE_ID"
```

---

## 34. `email-worker/package.json`

```json
{
  "name": "voidmail-email-worker",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "deploy": "wrangler deploy",
    "dev": "wrangler dev"
  },
  "devDependencies": {
    "wrangler": "^3.60.0"
  }
}
```

---

## 35. `.env`

```env
VITE_EMAIL_DOMAIN=yourdomain.com
```

---

## 🚀 Deployment Guide

# 📧 VoidMail — Disposable Email on Cloudflare

A full-stack temporary email service built on Cloudflare's edge platform.

## Tech Stack

| Layer           | Technology                    |
|-----------------|-------------------------------|
| Frontend        | React 18 + Vite + Tailwind    |
| Hosting         | Cloudflare Pages              |
| API             | Cloudflare Pages Functions    |
| Database        | Cloudflare KV (auto-expiry)   |
| Email Receiving | Cloudflare Email Workers      |
| Email Routing   | Cloudflare Email Routing      |

## Prerequisites

- Cloudflare account (free tier works)
- A domain added to Cloudflare (for email routing)
- Node.js 18+
- Wrangler CLI: `npm i -g wrangler`

## Setup

### 1. Clone & Install

```bash
git clone <repo-url>
cd voidmail
npm install
```

### 2. Create KV Namespace

```bash
# Production
wrangler kv namespace create VOIDMAIL_KV

# Preview (for local dev)
wrangler kv namespace create VOIDMAIL_KV --preview
```

Update `wrangler.toml` with both IDs.

### 3. Configure Environment

```bash
# Create .env file
echo "VITE_EMAIL_DOMAIN=yourdomain.com" > .env
```

Update `wrangler.toml`:
```toml
[vars]
EMAIL_DOMAIN = "yourdomain.com"
```

### 4. Local Development

```bash
# Start with Pages Functions support
npm run pages:dev
```

Visit `http://localhost:5173`

### 5. Deploy Frontend + API (Pages)

```bash
npm run pages:deploy
```

### 6. Deploy Email Worker

```bash
cd email-worker
npm install
wrangler deploy
```

### 7. Configure Email Routing

1. Go to **Cloudflare Dashboard → Email → Email Routing**
2. Enable Email Routing for your domain
3. Under **Routing Rules**, create a **Catch-all** rule:
   - Action: **Send to Worker**
   - Worker: `voidmail-email-worker`

### 8. Add KV Bindings to Pages

In Cloudflare Dashboard:
1. Go to **Pages → your project → Settings**
2. **Functions** → **KV namespace bindings**
3. Add: `VOIDMAIL_KV` → select your namespace

## Architecture

```
User → Cloudflare Pages (React SPA)
         ↓
       Pages Functions (/api/*) → KV Store
         ↑
Email → Cloudflare Email Routing → Email Worker → KV Store
```

## KV Key Structure

| Key Pattern           | Value                     | TTL      |
|-----------------------|---------------------------|----------|
| `inbox:{username}`    | Inbox metadata JSON       | User-set |
| `emails:{username}`   | Array of email summaries  | User-set |
| `email:{id}`          | Full email content JSON   | User-set |
| `recovery:{key}`      | Username string           | User-set |

All keys auto-expire via KV's native `expirationTtl`.

## License

MIT
