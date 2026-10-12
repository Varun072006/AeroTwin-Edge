import React from 'react';
import { DataSourceBadge } from './DataSourceBadge';
import { ShapComponents } from '../types';

interface ShapChartProps {
  shapData: ShapComponents | Record<string, number>;
  title?: string;
  isComponentLevel?: boolean;
}

/**
 * ShapChart — Feature & Component SHAP contribution bar chart.
 * Uses honest negative values (reducing RUL) vs positive values (preserving RUL).
 */
export const ShapChart: React.FC<ShapChartProps> = ({
  shapData,
  title = 'SHAP Attribution Breakdown',
  isComponentLevel = true,
}) => {
  const entries = Object.entries(shapData).sort((a, b) => a[1] - b[1]); // Most negative (harmful) first
  const maxAbs = Math.max(...entries.map(([, v]) => Math.abs(v)), 1.0);

  return (
    <div
      style={{
        background: 'rgba(17, 24, 39, 0.75)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        padding: '1.25rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#f1f5f9', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            {title}
          </h3>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: '#64748b' }}>
            Negative impact reduces RUL; positive impact preserves baseline life.
          </p>
        </div>
        <DataSourceBadge source="live model" detail="Extracted via TreeSHAP pred_contribs on XGBoost" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        {entries.map(([label, value]) => {
          const isNegative = value < 0;
          const absVal = Math.abs(value);
          const barWidthPercent = (absVal / maxAbs) * 50; // Max 50% on either side of zero line
          const color = isNegative ? '#ef4444' : '#22c55e';

          return (
            <div key={label} style={{ display: 'flex', alignItems: 'center', fontSize: '0.8rem' }}>
              <span
                style={{
                  width: isComponentLevel ? '90px' : '65px',
                  color: '#cbd5e1',
                  fontWeight: 600,
                  fontFamily: isComponentLevel ? 'Inter, sans-serif' : 'monospace',
                }}
              >
                {label}
              </span>

              {/* Dual-sided Bar track */}
              <div
                style={{
                  flex: 1,
                  height: '18px',
                  position: 'relative',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {/* Center Axis (0) */}
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: 0,
                    bottom: 0,
                    width: '1px',
                    background: 'rgba(255,255,255,0.2)',
                    zIndex: 1,
                  }}
                />

                {/* Left (Negative) Bar */}
                {isNegative && (
                  <div
                    style={{
                      position: 'absolute',
                      right: '50%',
                      width: `${barWidthPercent}%`,
                      height: '12px',
                      background: color,
                      borderRadius: '3px 0 0 3px',
                      opacity: 0.85,
                      boxShadow: `0 0 8px ${color}66`,
                    }}
                  />
                )}

                {/* Right (Positive) Bar */}
                {!isNegative && (
                  <div
                    style={{
                      position: 'absolute',
                      left: '50%',
                      width: `${barWidthPercent}%`,
                      height: '12px',
                      background: color,
                      borderRadius: '0 3px 3px 0',
                      opacity: 0.85,
                      boxShadow: `0 0 8px ${color}66`,
                    }}
                  />
                )}
              </div>

              {/* Value Text */}
              <span
                style={{
                  width: '55px',
                  textAlign: 'right',
                  color: color,
                  fontWeight: 700,
                  fontFamily: 'monospace',
                  marginLeft: '0.75rem',
                }}
              >
                {value >= 0 ? `+${value.toFixed(2)}` : value.toFixed(2)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
