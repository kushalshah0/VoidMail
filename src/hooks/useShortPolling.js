import { useEffect, useState, useCallback, useRef } from 'react';
import { getInboxSince } from '../utils/api';

export function useShortPolling(address, { onNewEmails }, interval = 2000) {
  const [lastSeenId, setLastSeenId] = useState(0);
  const [mode, setMode] = useState('polling');
  const mountedRef = useRef(true);
  const initializedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const poll = useCallback(async () => {
    if (!address || !mountedRef.current || !initializedRef.current) return;

    try {
      const data = await getInboxSince(address, lastSeenId);
      if (data.messages?.length && mountedRef.current) {
        onNewEmails(data.messages);
        const maxId = Math.max(...data.messages.map(m => m.id));
        setLastSeenId(prev => Math.max(prev, maxId));
      }
    } catch (err) {
      if (mountedRef.current) {
        console.error('Polling error:', err);
      }
    }
  }, [address, lastSeenId, onNewEmails]);

  useEffect(() => {
    if (!address) return;

    // Initial load - fetch all messages to establish baseline
    const initialLoad = async () => {
      try {
        const { getInbox } = await import('../utils/api');
        const data = await getInbox(address);
        if (data.messages?.length && mountedRef.current) {
          const maxId = Math.max(...data.messages.map(m => m.id));
          setLastSeenId(maxId);
        }
      } catch (err) {
        console.error('Initial load error:', err);
      } finally {
        if (mountedRef.current) initializedRef.current = true;
      }
    };

    initializedRef.current = false;
    initialLoad();

    // Start polling
    const timer = setInterval(poll, interval);
    return () => clearInterval(timer);
  }, [address, interval, poll]);

  return { mode };
}