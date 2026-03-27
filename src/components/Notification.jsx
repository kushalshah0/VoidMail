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
