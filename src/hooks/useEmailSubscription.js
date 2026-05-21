import { useEffect, useRef, useCallback } from 'react';

export default function useEmailSubscription(username, onNewEmails) {
  const eventSourceRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const connect = useCallback(() => {
    if (!username) return;

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource(`/api/sse?username=${username}`);
    eventSourceRef.current = eventSource;

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
      reconnectTimeoutRef.current = setTimeout(connect, 3000);
    };
  }, [username, onNewEmails]);

  useEffect(() => {
    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);
}
