import { useEffect, useState } from 'react';

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
    normal: 'text-emerald-600 dark:text-emerald-400',
    warning: 'text-amber-600 dark:text-amber-400',
    critical: 'text-red-500 dark:text-red-400',
  };

  return (
    <span className={`font-mono text-sm font-medium ${colorMap[urgency]}`}>
      {timeLeft}
    </span>
  );
}
