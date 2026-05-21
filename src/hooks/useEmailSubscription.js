import { useEffect, useRef, useCallback, useState } from 'react';

export default function useEmailSubscription(username, onNewEmails) {
  const [mode, setMode] = useState('connecting');
  const eventSourceRef = useRef(null);
  const pollingRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const sseFailuresRef = useRef(0);
  const MAX_SSE_RETRIES = 3;

  const startPolling = useCallback(() => {
    if (pollingRef.current) return;

    setMode('polling');
    pollingRef.current = setInterval(() => {
      onNewEmails(null);
    }, 5000);
  }, [onNewEmails]);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const connectSSE = useCallback(() => {
    if (!username) return;

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource(`/api/sse?username=${username}`);
    eventSourceRef.current = eventSource;

    let connected = false;

    eventSource.addEventListener('connected', () => {
      connected = true;
      sseFailuresRef.current = 0;
      setMode('sse');
      stopPolling();
    });

    eventSource.addEventListener('new-email', (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.emails) {
          onNewEmails(data.emails);
        }
      } catch {}
    });

    eventSource.onerror = () => {
      eventSource.close();

      if (!connected) {
        sseFailuresRef.current += 1;
        if (sseFailuresRef.current >= MAX_SSE_RETRIES) {
          startPolling();
          return;
        }
      }

      reconnectTimeoutRef.current = setTimeout(connectSSE, 3000);
    };
  }, [username, onNewEmails, startPolling, stopPolling]);

  useEffect(() => {
    connectSSE();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      stopPolling();
    };
  }, [connectSSE, stopPolling]);

  return { mode };
}
