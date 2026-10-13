import React from 'react';
import { DataSourceBadge } from './DataSourceBadge';

interface RULGaugeProps {
  rul: number;
  rulLo: number;
  rulHi: number;
  maxRul?: number;
}

/**
 * RULGauge — Visual arc gauge for Remaining Useful Life with split-conformal bounds.
 * Styled in clean white decent theme with executive aerospace contrast.
 * Per RULES.md:
 *  - RUL in realistic C-MAPSS range (0–362 cycles).
 *  - Lower bound rul_lo used for conservative decision making.
 *  - Thresholds (Critical <= 30, Warning 31-80, Healthy > 80) labeled as [assumption].
 */
export const RULGauge: React.FC<RULGaugeProps> = ({
  rul,
  rulLo,
  rulHi,
  maxRul = 150,
}) => {
  // Clamp value for display
  const clampedRul = Math.max(0, Math.min(rul, maxRul));
  const percentage = (clampedRul / maxRul) * 100;

  // Determine health color according to rules
  const getColor = (val: number): string => {
    if (val <= 30) return '#ef4444'; // Critical
    if (val <= 80) return '#f59e0b'; // Warning
    return '#10b981'; // Healthy
  };

  const currentColor = getColor(rulLo); // Conservative decision based on lower bound

  // SVG Gauge calculations (semi-circle arc)
  const radius = 80;
  const strokeWidth = 14;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '14px',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        boxShadow: '0 2px 8px -2px rgba(15, 23, 42, 0.05)',
      }}
    >
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Remaining Useful Life (RUL)
        </span>
        <DataSourceBadge source="live model" detail="Inference from XGBoost ONNX + Conformal Offsets" />
      </div>

      <div style={{ position: 'relative', width: '220px', height: '120px', display: 'flex', justifyContent: 'center' }}>
        <svg width="220" height="120" viewBox="0 0 200 110">
          {/* Background Arc */}
          <path
            d="M 20,100 A 80,80 0 0,1 180,100"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Active Value Arc */}
          <path
            d="M 20,100 A 80,80 0 0,1 180,100"
            fill="none"
            stroke={currentColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.3s ease' }}
          />
        </svg>

        {/* Center Point Prediction */}
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1, fontFamily: 'monospace' }}>
            {Math.round(rul)}
          </span>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>
            cycles remaining
          </span>
        </div>
      </div>

      {/* 80% Conformal Interval Pill */}
      <div
        style={{
          width: '100%',
          marginTop: '0.75rem',
          padding: '0.65rem 0.85rem',
          borderRadius: '8px',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>
            80% Conformal Interval:
          </span>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, fontFamily: 'monospace', color: '#0f172a' }}>
            [{Math.round(rulLo)} ... {Math.round(rulHi)}] cycles
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem' }}>
          <span style={{ color: '#94a3b8' }}>Decision Bound (Lower):</span>
          <span
            style={{
              fontWeight: 700,
              color: currentColor,
              padding: '0.1rem 0.4rem',
              borderRadius: '4px',
              backgroundColor: currentColor === '#ef4444' ? '#fef2f2' : currentColor === '#f59e0b' ? '#fffbeb' : '#ecfdf5',
              border: `1px solid ${currentColor === '#ef4444' ? '#fecaca' : currentColor === '#f59e0b' ? '#fde68a' : '#a7f3d0'}`,
            }}
          >
            {Math.round(rulLo)} cycles ({rulLo <= 30 ? 'CRITICAL' : rulLo <= 80 ? 'WARNING' : 'HEALTHY'})
          </span>
        </div>
      </div>
    </div>
  );
};
