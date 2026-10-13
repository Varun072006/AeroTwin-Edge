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
 * Styled in clean white decent theme with executive high contrast.
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
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '14px',
        padding: '1.25rem',
        boxShadow: '0 2px 8px -2px rgba(15, 23, 42, 0.05)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            {title}
          </h3>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: '#64748b' }}>
            Negative bars pull down RUL; positive bars preserve nominal engine life.
          </p>
        </div>
        <DataSourceBadge source="live model" detail="Extracted via TreeSHAP pred_contribs on XGBoost" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        {entries.map(([label, value]) => {
          const isNegative = value < 0;
          const absVal = Math.abs(value);
          const barWidthPercent = (absVal / maxAbs) * 50; // Max 50% on either side of zero line
          const color = isNegative ? '#ef4444' : '#10b981';

          return (
            <div key={label} style={{ display: 'flex', alignItems: 'center', fontSize: '0.8rem' }}>
              <span
                style={{
                  width: isComponentLevel ? '95px' : '70px',
                  color: '#1e293b',
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
                  backgroundColor: '#f1f5f9',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}
              >
                {/* Center Zero Line */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: '50%',
                    width: '1px',
                    backgroundColor: '#cbd5e1',
                    zIndex: 2,
                  }}
                />

                {/* Left (Negative) Bar */}
                {isNegative && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '2px',
                      bottom: '2px',
                      right: '50%',
                      width: `${barWidthPercent}%`,
                      backgroundColor: color,
                      borderRadius: '3px 0 0 3px',
                      transition: 'width 0.4s ease',
                    }}
                  />
                )}

                {/* Right (Positive) Bar */}
                {!isNegative && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '2px',
                      bottom: '2px',
                      left: '50%',
                      width: `${barWidthPercent}%`,
                      backgroundColor: color,
                      borderRadius: '0 3px 3px 0',
                      transition: 'width 0.4s ease',
                    }}
                  />
                )}
              </div>

              {/* Numeric Value Label */}
              <span
                style={{
                  width: '60px',
                  textAlign: 'right',
                  color: color,
                  fontWeight: 700,
                  fontFamily: 'monospace',
                  fontSize: '0.78rem',
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
