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
    return '#22c55e'; // Healthy
  };

  const currentColor = getColor(rul);

  // SVG Gauge calculations (semi-circle arc)
  const radius = 80;
  const strokeWidth = 14;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div
      style={{
        background: 'rgba(17, 24, 39, 0.75)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      }}
    >
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Active Value Arc */}
          <path
            d="M 20,100 A 80,80 0 0,1 180,100"
            fill="none"
            stroke={currentColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.4s ease' }}
          />
        </svg>

        {/* Central Display */}
        <div
          style={{
            position: 'absolute',
            bottom: '4px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1, fontFamily: 'Inter, sans-serif' }}>
            {Math.round(rul)}
          </span>
          <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#64748b', textTransform: 'uppercase' }}>
            Operating Cycles
          </span>
        </div>
      </div>

      {/* Conformal Uncertainty Interval */}
      <div
        style={{
          marginTop: '0.75rem',
          width: '100%',
          padding: '0.6rem 0.8rem',
          borderRadius: '8px',
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8' }}>
          <span>80% Conformal Interval:</span>
          <strong style={{ color: '#38bdf8' }}>
            [{Math.round(rulLo)} — {Math.round(rulHi)}] cycles
          </strong>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8' }}>
          <span>Conservative Lower Bound:</span>
          <strong style={{ color: '#f59e0b' }}>{Math.round(rulLo)} cycles</strong>
        </div>
      </div>

      <div style={{ marginTop: '0.5rem', fontSize: '0.68rem', color: '#64748b', textAlign: 'center' }}>
        * Thresholds: Critical ≤ 30 | Warning 31–80 | Healthy &gt; 80 <span style={{ color: '#f59e0b' }}>[assumption]</span>
      </div>
    </div>
  );
};
