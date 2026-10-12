import React from 'react';
import { AlertItem } from '../types';

interface AlertFeedProps {
  alerts: AlertItem[];
  onSelectAlert?: (alert: AlertItem) => void;
}

/**
 * AlertFeed — Scrolling feed of real-time turbofan alerts.
 * Uses strict health palette: Healthy #22c55e, Warning #f59e0b, Critical #ef4444.
 */
export const AlertFeed: React.FC<AlertFeedProps> = ({ alerts, onSelectAlert }) => {
  const getBadgeStyle = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.4)' };
      case 'WARNING':
        return { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b', border: 'rgba(245, 158, 11, 0.4)' };
      default:
        return { bg: 'rgba(34, 197, 94, 0.15)', text: '#22c55e', border: 'rgba(34, 197, 94, 0.4)' };
    }
  };

  return (
    <div
      style={{
        background: 'rgba(17, 24, 39, 0.75)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        height: '100%',
        minHeight: '260px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#f1f5f9', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          Alerts & Event Feed
        </h3>
        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
          {alerts.length} event{alerts.length === 1 ? '' : 's'} logged
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          overflowY: 'auto',
          maxHeight: '280px',
          paddingRight: '4px',
        }}
      >
        {alerts.length === 0 ? (
          <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
            No warning or critical alerts fired yet. All subsystems operating within nominal limits.
          </div>
        ) : (
          alerts.map((alert) => {
            const badge = getBadgeStyle(alert.severity);
            return (
              <div
                key={alert.id}
                onClick={() => onSelectAlert && onSelectAlert(alert)}
                style={{
                  padding: '0.75rem',
                  borderRadius: '8px',
                  background: 'rgba(15, 23, 42, 0.7)',
                  border: `1px solid ${badge.border}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem',
                  cursor: onSelectAlert ? 'pointer' : 'default',
                  transition: 'background 0.2s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span
                    style={{
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      backgroundColor: badge.bg,
                      color: badge.text,
                      border: `1px solid ${badge.border}`,
                      textTransform: 'uppercase',
                    }}
                  >
                    {alert.severity}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                    Cycle {alert.cycle}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#e2e8f0', marginTop: '0.2rem' }}>
                  {alert.message}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Engine: {alert.engine_id}</span>
                  <span>{alert.timestamp}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
