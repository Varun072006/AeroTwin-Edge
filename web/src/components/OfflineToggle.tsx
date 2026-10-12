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
        background: isOffline ? 'rgba(239, 68, 68, 0.12)' : 'rgba(34, 197, 94, 0.08)',
        border: `1px solid ${isOffline ? 'rgba(239, 68, 68, 0.35)' : 'rgba(34, 197, 94, 0.25)'}`,
        borderRadius: '10px',
        padding: '0.6rem 1rem',
        transition: 'all 0.3s ease',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isOffline ? '#ef4444' : '#22c55e',
              boxShadow: `0 0 8px ${isOffline ? '#ef4444' : '#22c55e'}`,
            }}
          />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>
            {isOffline ? 'Edge Offline (Isolated)' : 'Cloud Link Active (Online)'}
          </span>
        </div>
        <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
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
          fontWeight: 600,
          fontSize: '0.75rem',
          backgroundColor: isOffline ? '#ef4444' : '#1e293b',
          color: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: isOffline ? '0 0 12px rgba(239, 68, 68, 0.4)' : 'none',
          transition: 'all 0.2s ease',
        }}
      >
        {loading ? 'Switching...' : isOffline ? 'Reconnect Cloud' : 'Simulate Sever Link'}
      </button>
    </div>
  );
};
