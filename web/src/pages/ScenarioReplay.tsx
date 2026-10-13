import React, { useState } from 'react';
import { DataSourceBadge } from '../components/DataSourceBadge';
import fastBundle from '../data/replay_bundles/fd001_fast.json';
import slowBundle from '../data/replay_bundles/fd001_slow.json';
import noisyBundle from '../data/replay_bundles/fd001_noisy.json';
import { ReplayBundle } from '../types';

export const ScenarioReplay: React.FC = () => {
  const scenarios: Record<string, { title: string; subtitle: string; desc: string; bundle: ReplayBundle }> = {
    fast: {
      title: 'Rapid Wear (FD001-ENG-024)',
      subtitle: '146 Cycles to Failure · Rapid HPC Degradation',
      desc: 'Steep degradation trajectory. Evaluates early warning capability: alert fires ~40 cycles before critical failure.',
      bundle: fastBundle as unknown as ReplayBundle,
    },
    slow: {
      title: 'Gradual Wear (FD001-ENG-034)',
      subtitle: '298 Cycles to Failure · Low-Noise Wear',
      desc: 'Extended wear profile testing longevity calibration and piecewise-linear transition at cycle 125.',
      bundle: slowBundle as unknown as ReplayBundle,
    },
    noisy: {
      title: 'Noisy Baseline (FD001-ENG-057)',
      subtitle: '202 Cycles to Failure · High Sensor Variance',
      desc: 'High variance telemetry testing Mahalanobis distance specificity and resilience against false alarms.',
      bundle: noisyBundle as unknown as ReplayBundle,
    },
  };

  const [activeKey, setActiveKey] = useState<string>('fast');
  const activeScenario = scenarios[activeKey];
  const b = activeScenario.bundle;

  // Find when warning and critical alerts fired
  const warningCycleIndex = b.health_class.findIndex((h) => h === 'WARNING');
  const criticalCycleIndex = b.health_class.findIndex((h) => h === 'CRITICAL');
  const warningCycle = warningCycleIndex !== -1 ? b.cycles[warningCycleIndex] : 'N/A';
  const criticalCycle = criticalCycleIndex !== -1 ? b.cycles[criticalCycleIndex] : 'N/A';
  const leadTimeCycles = warningCycleIndex !== -1 ? b.n_cycles - (b.cycles[warningCycleIndex] as number) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
          <h1 style={{ margin: 0, fontSize: '1.65rem', fontWeight: 800, color: '#0f172a' }}>
            C-MAPSS Scenario Replay &amp; Validation
          </h1>
          <DataSourceBadge source="replay bundle" detail="Official NASA C-MAPSS FD001 Test Set" />
        </div>
        <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b' }}>
          Compare run-to-failure trajectories against official ground truth across three distinct stress profiles.
        </p>
      </div>

      {/* Scenario Selection Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
        {Object.entries(scenarios).map(([key, s]) => {
          const isSelected = activeKey === key;
          return (
            <div
              key={key}
              onClick={() => setActiveKey(key)}
              style={{
                cursor: 'pointer',
                background: isSelected ? '#f0f9ff' : '#ffffff',
                border: `1.5px solid ${isSelected ? '#0284c7' : '#e2e8f0'}`,
                borderRadius: '12px',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.45rem',
                boxShadow: isSelected ? '0 4px 12px rgba(2, 132, 199, 0.12)' : '0 1px 3px rgba(0,0,0,0.04)',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                  {s.title}
                </span>
                {isSelected && (
                  <span style={{ fontSize: '0.68rem', color: '#0284c7', fontWeight: 800, background: '#e0f2fe', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                    SELECTED
                  </span>
                )}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 700 }}>
                {s.subtitle}
              </span>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4 }}>
                {s.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Key Scenario Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div style={{ background: '#ffffff', padding: '1.15rem 1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Total Flight Cycles</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginTop: '0.2rem', fontFamily: 'monospace' }}>{b.n_cycles} cycles</div>
        </div>

        <div style={{ background: '#ffffff', padding: '1.15rem 1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Warning Alert Fired</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#b45309', marginTop: '0.2rem', fontFamily: 'monospace' }}>Cycle {warningCycle}</div>
        </div>

        <div style={{ background: '#ffffff', padding: '1.15rem 1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Critical Alert Fired</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#b91c1c', marginTop: '0.2rem', fontFamily: 'monospace' }}>Cycle {criticalCycle}</div>
        </div>

        <div style={{ background: '#ffffff', padding: '1.15rem 1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Warning Lead Time</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#047857', marginTop: '0.2rem', fontFamily: 'monospace' }}>{leadTimeCycles} cycles</div>
        </div>
      </div>

      {/* Trajectory Curve Visualization (Clean SVG Graph with Predictions & Ground Truth) */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          padding: '1.5rem',
          boxShadow: '0 2px 8px -2px rgba(15, 23, 42, 0.05)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
              RUL Trajectory: Ground Truth vs. Predicted with Conformal Interval Band
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Piecewise-linear target clipped at 125 cycles assumption [assumption]
            </span>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '0.75rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#0284c7', fontWeight: 700 }}>
              <span style={{ width: '12px', height: '3px', background: '#0284c7' }} /> Predicted RUL
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontWeight: 600 }}>
              <span style={{ width: '12px', height: '3px', background: '#64748b', borderTop: '1px dashed' }} /> Ground Truth
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b', fontWeight: 700 }}>
              <span style={{ width: '12px', height: '3px', background: '#f59e0b' }} /> Lower Bound (rul_lo)
            </span>
          </div>
        </div>

        {/* SVG Trajectory Chart */}
        <div style={{ width: '100%', height: '300px' }}>
          <svg viewBox="0 0 900 260" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            {/* Grid Lines */}
            {[0, 50, 100, 150, 200].map((val) => {
              const y = 220 - (val / 160) * 200;
              return (
                <g key={val}>
                  <line x1="50" y1={y} x2="880" y2={y} stroke="#f1f5f9" />
                  <text x="35" y={y + 4} fill="#94a3b8" fontSize="10" fontWeight="600" textAnchor="end">{val}</text>
                </g>
              );
            })}

            {/* Conformal Uncertainty Shaded Polygon */}
            {(() => {
              const step = 830 / (b.n_cycles - 1);
              const pointsHi = b.pred_rul_hi.map((v, i) => `${50 + i * step},${220 - (Math.min(v, 160) / 160) * 200}`).join(' ');
              const pointsLo = b.pred_rul_lo.map((v, i) => `${50 + i * step},${220 - (Math.max(0, v) / 160) * 200}`).reverse().join(' ');
              return (
                <polygon
                  points={`${pointsHi} ${pointsLo}`}
                  fill="#e0f2fe"
                  opacity="0.6"
                  stroke="none"
                />
              );
            })()}

            {/* True RUL Line */}
            <polyline
              fill="none"
              stroke="#64748b"
              strokeWidth="2"
              strokeDasharray="4 4"
              points={b.true_rul
                .map((v, i) => {
                  const x = 50 + (i * 830) / (b.n_cycles - 1);
                  const y = 220 - (Math.min(v, 160) / 160) * 200;
                  return `${x},${y}`;
                })
                .join(' ')}
            />

            {/* Predicted Lower Bound rul_lo */}
            <polyline
              fill="none"
              stroke="#f59e0b"
              strokeWidth="1.5"
              points={b.pred_rul_lo
                .map((v, i) => {
                  const x = 50 + (i * 830) / (b.n_cycles - 1);
                  const y = 220 - (Math.max(0, Math.min(v, 160)) / 160) * 200;
                  return `${x},${y}`;
                })
                .join(' ')}
            />

            {/* Predicted RUL Line */}
            <polyline
              fill="none"
              stroke="#0284c7"
              strokeWidth="2.5"
              points={b.pred_rul
                .map((v, i) => {
                  const x = 50 + (i * 830) / (b.n_cycles - 1);
                  const y = 220 - (Math.max(0, Math.min(v, 160)) / 160) * 200;
                  return `${x},${y}`;
                })
                .join(' ')}
            />

            {/* Warning Alert Trigger Marker */}
            {warningCycleIndex !== -1 && (
              <g>
                <line
                  x1={50 + (warningCycleIndex * 830) / (b.n_cycles - 1)}
                  y1="20"
                  x2={50 + (warningCycleIndex * 830) / (b.n_cycles - 1)}
                  y2="220"
                  stroke="#f59e0b"
                  strokeWidth="1.5"
                  strokeDasharray="2 2"
                />
                <circle
                  cx={50 + (warningCycleIndex * 830) / (b.n_cycles - 1)}
                  cy="20"
                  r="4"
                  fill="#f59e0b"
                />
                <text
                  x={50 + (warningCycleIndex * 830) / (b.n_cycles - 1) + 6}
                  y="25"
                  fill="#b45309"
                  fontSize="10"
                  fontWeight="700"
                >
                  Warning Alert (Cycle {warningCycle})
                </text>
              </g>
            )}

            {/* Actual Failure Marker */}
            <g>
              <line
                x1={880}
                y1="20"
                x2={880}
                y2="220"
                stroke="#ef4444"
                strokeWidth="1.5"
              />
              <circle cx={880} cy="220" r="5" fill="#ef4444" />
              <text x="875" y="240" fill="#b91c1c" fontSize="10" fontWeight="700" textAnchor="end">
                Engine Failure (Cycle {b.n_cycles})
              </text>
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
};
