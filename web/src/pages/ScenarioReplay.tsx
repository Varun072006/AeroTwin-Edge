import React, { useState } from 'react';
import { DataSourceBadge } from '../components/DataSourceBadge';
import fastBundle from '../data/replay_bundles/fd001_fast.json';
import slowBundle from '../data/replay_bundles/fd001_slow.json';
import noisyBundle from '../data/replay_bundles/fd001_noisy.json';
import { ReplayBundle } from '../types';

export const ScenarioReplay: React.FC = () => {
  const scenarios: Record<string, { title: string; subtitle: string; desc: string; bundle: ReplayBundle }> = {
    fast: {
      title: 'Fast Degrader (FD001-ENG-024)',
      subtitle: '146 Cycles to Failure · Rapid HPC Degradation',
      desc: 'Steep degradation trajectory. Evaluates early warning capability: alert fires ~40 cycles before critical failure.',
      bundle: fastBundle as unknown as ReplayBundle,
    },
    slow: {
      title: 'Slow Degrader (FD001-ENG-034)',
      subtitle: '298 Cycles to Failure · Gradual Low-Noise Wear',
      desc: 'Extended wear profile testing longevity calibration and piecewise-linear transition at cycle 125.',
      bundle: slowBundle as unknown as ReplayBundle,
    },
    noisy: {
      title: 'Noisy Engine (FD001-ENG-057)',
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1250px', margin: '0 auto' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
          <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc' }}>
            C-MAPSS Scenario Replay &amp; Validation
          </h1>
          <DataSourceBadge source="replay bundle" detail="Official NASA C-MAPSS FD001 Test Set" />
        </div>
        <p style={{ margin: 0, fontSize: '0.9rem', color: '#94a3b8' }}>
          Compare run-to-failure trajectories against official ground truth across three distinct stress profiles.
        </p>
      </div>

      {/* Scenario Selection Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {Object.entries(scenarios).map(([key, s]) => {
          const isSelected = activeKey === key;
          return (
            <div
              key={key}
              onClick={() => setActiveKey(key)}
              style={{
                cursor: 'pointer',
                background: isSelected ? 'rgba(37, 99, 235, 0.15)' : 'rgba(17, 24, 39, 0.75)',
                border: `1px solid ${isSelected ? 'rgba(56, 189, 248, 0.5)' : 'rgba(255, 255, 255, 0.08)'}`,
                borderRadius: '12px',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                boxShadow: isSelected ? '0 0 20px rgba(56, 189, 248, 0.2)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
                  {s.title}
                </span>
                {isSelected && (
                  <span style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 700, background: 'rgba(56,189,248,0.2)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                    ACTIVE
                  </span>
                )}
              </div>
              <span style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 600 }}>
                {s.subtitle}
              </span>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.4 }}>
                {s.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Key Scenario Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div style={{ background: 'rgba(17, 24, 39, 0.7)', padding: '1rem 1.25rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Total Flight Cycles</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', marginTop: '0.2rem' }}>{b.n_cycles} cycles</div>
        </div>

        <div style={{ background: 'rgba(17, 24, 39, 0.7)', padding: '1rem 1.25rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Warning Alert Fired</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.2rem' }}>Cycle {warningCycle}</div>
        </div>

        <div style={{ background: 'rgba(17, 24, 39, 0.7)', padding: '1rem 1.25rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Critical Alert Fired</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ef4444', marginTop: '0.2rem' }}>Cycle {criticalCycle}</div>
        </div>

        <div style={{ background: 'rgba(17, 24, 39, 0.7)', padding: '1rem 1.25rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Warning Lead Time</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#22c55e', marginTop: '0.2rem' }}>{leadTimeCycles} cycles</div>
        </div>
      </div>

      {/* Trajectory Curve Visualization (Clean SVG Graph with Predictions & Ground Truth) */}
      <div
        style={{
          background: 'rgba(13, 20, 36, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          padding: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
              RUL Trajectory: True vs. Predicted with Conformal Interval Band
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Piecewise-linear target clipped at 125 cycles assumption [assumption]
            </span>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '0.78rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#38bdf8' }}>
              <span style={{ width: '12px', height: '3px', background: '#38bdf8' }} /> Predicted RUL
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#94a3b8' }}>
              <span style={{ width: '12px', height: '3px', background: '#94a3b8', borderTop: '1px dashed' }} /> Ground Truth
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b' }}>
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
                  <line x1="50" y1={y} x2="880" y2={y} stroke="rgba(255,255,255,0.06)" />
                  <text x="35" y={y + 4} fill="#64748b" fontSize="10" textAnchor="end">{val}</text>
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
                  fill="rgba(56, 189, 248, 0.08)"
                  stroke="none"
                />
              );
            })()}

            {/* True RUL Line */}
            <polyline
              fill="none"
              stroke="#94a3b8"
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
              stroke="#38bdf8"
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
                  fill="#f59e0b"
                  fontSize="11"
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
              <text x="875" y="240" fill="#ef4444" fontSize="11" fontWeight="700" textAnchor="end">
                Engine Failure (Cycle {b.n_cycles})
              </text>
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
};
