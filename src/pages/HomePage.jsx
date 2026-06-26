import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GenerateForm from '../components/GenerateForm';
import FeatureCard from '../components/FeatureCard';
import { recoverInbox } from '../utils/api';
import Notification from '../components/Notification';

export default function HomePage() {
  const [showRecover, setShowRecover] = useState(false);
  const [recoveryKey, setRecoveryKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  const handleRecover = async (e) => {
    e.preventDefault();
    if (!recoveryKey.trim()) return;
    setLoading(true);
    try {
      const data = await recoverInbox(recoveryKey.toUpperCase().trim());
      localStorage.setItem('voidmail_email', data.address);
      localStorage.setItem('voidmail_expires', data.expiresAt);
      navigate(`/inbox/${data.address}`);
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.message || 'Invalid or expired recovery key',
      });
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: 'Instant Setup',
      description: 'No registration required. Generate a disposable inbox in seconds.',
      badge: 'Fast',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Auto-Expires',
      description: 'Inboxes self-destruct after 1 hour. No cleanup needed.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: 'Zero Tracking',
      description: 'No cookies, no analytics, no logs. Your privacy is absolute.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
      ),
      title: 'Edge Powered',
      description: "Runs on Cloudflare's global edge network. Blazing fast worldwide.",
      badge: 'Cloudflare',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
      title: 'No Signup',
      description: 'No personal information needed. Ever. Just pick a username and go.',
    },
  ];

  const steps = [
    { step: '01', title: 'Generate Address', desc: 'Click the button. Get a random temp address instantly.' },
    { step: '02', title: 'Receive Emails', desc: 'Share your address anywhere. Emails appear in seconds.' },
    { step: '03', title: 'Auto-Expires', desc: 'Everything is deleted after 1 hour. No traces left.' },
  ];

  return (
    <div className="animate-fade-in">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b 
                        from-brand-50 dark:from-brand-600/5 
                        via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 -translate-x-1/2 w-[800px] h-[600px] 
                        bg-brand-100/50 dark:bg-brand-600/5 
                        rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 pt-20 pb-16 lg:pt-24 lg:pb-20">
          <div className="lg:grid lg:grid-cols-5 lg:gap-12 items-center">
            <div className="lg:col-span-3 mb-10 lg:mb-0 max-w-xl">
              <div className="inline-flex items-center gap-2 badge-blue mb-5">
                <span className="w-1.5 h-1.5 bg-brand-500 dark:bg-brand-400 rounded-full animate-pulse" />
                Zero Tracking &bull; Auto-Delete
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-light-900 dark:text-white mb-5 leading-tight">
                Disposable Email.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r 
                                 from-brand-500 to-brand-700 
                                 dark:from-brand-400 dark:to-brand-600">
                  Instant & Private.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-light-600 dark:text-dark-400 leading-relaxed mb-8">
                Generate a temporary inbox instantly. Protect your real email from
                spam, bots, and unwanted signups. Powered by Cloudflare's edge network.
              </p>

              <div className="hidden lg:flex items-center gap-6">
                {steps.map((item) => (
                  <div key={item.step} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-600/10 
                                    border border-brand-200 dark:border-brand-600/20 
                                    flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-brand-600 dark:text-brand-400">{item.step}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-light-900 dark:text-white">{item.title}</p>
                      <p className="text-xs text-light-500 dark:text-dark-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="card glow">
                <GenerateForm />

                <div className="mt-4 pt-4 border-t border-light-200 dark:border-dark-700">
                  <button
                    onClick={() => setShowRecover(!showRecover)}
                    className="text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium flex items-center gap-1.5 mx-auto"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    Recover existing inbox
                  </button>

                  {showRecover && (
                    <form onSubmit={handleRecover} className="mt-3 space-y-3">
                      {notification && (
                        <Notification {...notification} onClose={() => setNotification(null)} />
                      )}
                      <input
                        type="text"
                        value={recoveryKey}
                        onChange={(e) => {
                          let val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                          val = val.match(/.{1,4}/g)?.join('-') || val;
                          setRecoveryKey(val.substring(0, 19));
                        }}
                        placeholder="XXXX-XXXX-XXXX-XXXX"
                        className="input-field font-mono tracking-widest text-center text-sm"
                        autoComplete="off"
                        spellCheck="false"
                      />
                      <button
                        type="submit"
                        disabled={loading || recoveryKey.length < 19}
                        className="btn-secondary w-full text-sm"
                      >
                        {loading ? 'Recovering...' : 'Access Inbox'}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-light-900 dark:text-white mb-3">
            Why VoidMail?
          </h2>
          <p className="text-light-500 dark:text-dark-400">
            Built on Cloudflare's edge — fast, private, and ephemeral by design.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <FeatureCard key={i} {...feature} />
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-16 lg:hidden">
        <h2 className="text-2xl font-bold text-light-900 dark:text-white text-center mb-12">
          How It Works
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-600/10 
                              border border-brand-200 dark:border-brand-600/20 
                              flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-brand-600 dark:text-brand-400">{item.step}</span>
              </div>
              <h3 className="text-lg font-semibold text-light-900 dark:text-white mb-2">{item.title}</h3>
              <p className="text-light-600 dark:text-dark-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
