import React from 'react';
import { AlertItem } from '../types';

interface AlertFeedProps {
  alerts: AlertItem[];
  onSelectAlert?: (alert: AlertItem) => void;
}

/**
 * AlertFeed — Scrolling feed of real-time turbofan alerts in white decent theme.
 * Uses strict health palette: Healthy #10b981, Warning #f59e0b, Critical #ef4444.
 */
export const AlertFeed: React.FC<AlertFeedProps> = ({ alerts, onSelectAlert }) => {
  const getBadgeStyle = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca', bar: '#ef4444' };
      case 'WARNING':
        return { bg: '#fffbeb', text: '#b45309', border: '#fde68a', bar: '#f59e0b' };
      default:
        return { bg: '#f0fdf4', text: '#047857', border: '#bbf7d0', bar: '#10b981' };
    }
  };

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '14px',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 2px 8px -2px rgba(15, 23, 42, 0.05)',
        height: '100%',
        minHeight: '260px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          Alerts & Event Summary
        </h3>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', backgroundColor: '#f1f5f9', padding: '0.15rem 0.5rem', borderRadius: '9999px' }}>
          {alerts.length} logged
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
            <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.35rem' }}>✅</span>
            All engine stages nominal. No critical alerts triggered.
          </div>
        ) : (
          alerts.map((alert) => {
            const badge = getBadgeStyle(alert.severity);
            return (
              <div
                key={alert.id}
                onClick={() => onSelectAlert && onSelectAlert(alert)}
                style={{
                  padding: '0.75rem 0.85rem',
                  borderRadius: '8px',
                  backgroundColor: badge.bg,
                  border: `1px solid ${badge.border}`,
                  borderLeft: `4px solid ${badge.bar}`,
                  cursor: onSelectAlert ? 'pointer' : 'default',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem',
                  transition: 'transform 0.1s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: badge.text, textTransform: 'uppercase' }}>
                    {alert.severity} · Cycle {alert.cycle}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'monospace' }}>
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#1e293b', fontWeight: 500, lineHeight: 1.35 }}>
                  {alert.message}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
