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
