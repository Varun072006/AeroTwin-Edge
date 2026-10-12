import { useEffect, useState, useRef, useCallback } from 'react';
import { TelemetryEvent } from '../types';

interface UseSSEReturn {
  latestEvent: TelemetryEvent | null;
  history: TelemetryEvent[];
  isConnected: boolean;
  error: string | null;
}

/**
 * useSSE — Subscribes to Server-Sent Events stream from /stream.
 * Maintains client-side event history buffer and connection health state.
 */
export const useSSE = (streamUrl: string = '/stream'): UseSSEReturn => {
  const [latestEvent, setLatestEvent] = useState<TelemetryEvent | null>(null);
  const [history, setHistory] = useState<TelemetryEvent[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const connect = useCallback(() => {
    try {
      const es = new EventSource(streamUrl);
      eventSourceRef.current = es;

      es.onopen = () => {
        setIsConnected(true);
        setError(null);
      };

      es.onmessage = (e) => {
        try {
          const data: TelemetryEvent = JSON.parse(e.data);
          setLatestEvent(data);
          setHistory((prev) => [...prev.slice(-199), data]);
        } catch (err) {
          console.warn('Failed to parse SSE payload:', err);
        }
      };

      es.onerror = () => {
        setIsConnected(false);
        setError('SSE stream disconnected');
        es.close();
      };
    } catch (err: unknown) {
      setIsConnected(false);
      setError(err instanceof Error ? err.message : 'Unknown SSE error');
    }
  }, [streamUrl]);

  useEffect(() => {
    connect();
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [connect]);

  return { latestEvent, history, isConnected, error };
};
