import React, { useState } from 'react';

interface OfflineToggleProps {
  isOffline: boolean;
  onToggle: (offlineState: boolean) => Promise<void> | void;
  queueDepth?: number;
}

/**
 * OfflineToggle — Demonstrates the edge store-and-forward outbox capability.
 * When severed, edge inference continues uninterrupted on ONNX Runtime CPU,
 * accumulating telemetry in the local SQLite outbox until reconnect.
 */
export const OfflineToggle: React.FC<OfflineToggleProps> = ({
  isOffline,
  onToggle,
  queueDepth = 0,
}) => {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await onToggle(!isOffline);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        background: isOffline ? '#fef2f2' : '#f0fdf4',
        border: `1px solid ${isOffline ? '#fecaca' : '#bbf7d0'}`,
        borderRadius: '10px',
        padding: '0.6rem 1rem',
        transition: 'all 0.2s ease',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isOffline ? '#ef4444' : '#10b981',
              boxShadow: `0 0 6px ${isOffline ? '#ef4444' : '#10b981'}`,
            }}
          />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: isOffline ? '#991b1b' : '#065f46' }}>
            {isOffline ? 'Edge Offline (Isolated)' : 'Cloud Link Active (Online)'}
          </span>
        </div>
        <span style={{ fontSize: '0.72rem', color: isOffline ? '#b91c1c' : '#047857', marginTop: '2px' }}>
          {isOffline
            ? `Inference running locally · Outbox buffering (${queueDepth} queued)`
            : 'Live stream synced with Cloud API'}
        </span>
      </div>

      <button
        onClick={handleClick}
        disabled={loading}
        style={{
          cursor: loading ? 'wait' : 'pointer',
          padding: '0.4rem 0.9rem',
          borderRadius: '6px',
          fontWeight: 700,
          fontSize: '0.75rem',
          backgroundColor: isOffline ? '#ef4444' : '#ffffff',
          color: isOffline ? '#ffffff' : '#0f172a',
          border: isOffline ? '1px solid #dc2626' : '1px solid #cbd5e1',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          transition: 'all 0.15s ease',
        }}
      >
        {loading ? 'Switching...' : isOffline ? 'Reconnect Cloud' : 'Simulate Sever Link'}
      </button>
    </div>
  );
};
