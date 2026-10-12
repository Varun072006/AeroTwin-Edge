import React, { useState } from 'react';
import { TurbofanSVG } from '../components/TurbofanSVG';
import { RULGauge } from '../components/RULGauge';
import { AlertFeed } from '../components/AlertFeed';
import { DataSourceBadge } from '../components/DataSourceBadge';
import { useEngineData } from '../hooks/useEngineData';

export const LiveDigitalTwin: React.FC = () => {
  const {
    selectedEngine,
    setSelectedEngine,
    totalCycles,
    currentEvent,
    isPlaying,
    setIsPlaying,
    playbackSpeed,
    setPlaybackSpeed,
    alerts,
    injectFault,
    resetSimulation,
  } = useEngineData();

  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);

  // Recommendation engine: strictly based on conservative lower bound rul_lo
  const getRecommendation = () => {
    const rulLo = Math.round(currentEvent.rul_lo);
    if (rulLo <= 30) {
      return {
        priority: 'IMMEDIATE DISPATCH',
        severity: 'CRITICAL',
        color: '#ef4444',
        action: `Ground engine for borescope inspection & shop visit within ${rulLo} cycles.`,
        rationale: `Conservative lower bound ${rulLo} cycles is at or below the Critical threshold (30 cycles) [assumption]. Point estimate is ${Math.round(currentEvent.rul)} cycles. Safety-critical protocol mandates scheduling based on the lower uncertainty quantile.`,
      };
    } else if (rulLo <= 80) {
      return {
        priority: 'ADVISORY NOTICE',
        severity: 'WARNING',
        color: '#f59e0b',
        action: `Flag engine for priority line-maintenance inspection at next turn.`,
        rationale: `Conservative lower bound ${rulLo} cycles has entered the Warning threshold (31–80 cycles) [assumption]. Telemetry indicates steady degradation trend.`,
      };
    }
    return {
      priority: 'NOMINAL OPERATION',
      severity: 'HEALTHY',
      color: '#22c55e',
      action: 'Continue standard operating schedule. No unscheduled action needed.',
      rationale: `Conservative lower bound ${rulLo} cycles is well above the Warning threshold (> 80 cycles) [assumption]. All thermodynamic parameters nominal.`,
    };
  };

  const recommendation = getRecommendation();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1350px', margin: '0 auto' }}>
      {/* Header & Controls Bar */}
      <div
        style={{
          background: 'rgba(13, 20, 36, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          padding: '1rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>
              Turbofan Digital Twin
            </h2>
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                color: '#38bdf8',
                background: 'rgba(56, 189, 248, 0.15)',
                padding: '0.15rem 0.5rem',
                borderRadius: '4px',
              }}
            >
              Engine: {currentEvent.engine_id}
            </span>
            <DataSourceBadge source="replay bundle" detail="NASA C-MAPSS FD001 Turbofan telemetry run-to-failure" />
          </div>
          <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
            Cycle {currentEvent.cycle} of {totalCycles} · Constrained Container Simulation
          </span>
        </div>

        {/* Simulation Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Engine Selector */}
          <select
            value={selectedEngine}
            onChange={(e) => setSelectedEngine(e.target.value as 'fast' | 'slow' | 'noisy')}
            style={{
              padding: '0.45rem 0.8rem',
              borderRadius: '6px',
              background: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#f8fafc',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <option value="fast">Fast Degrader (146 cycles)</option>
            <option value="slow">Slow Degrader (298 cycles)</option>
            <option value="noisy">Noisy / High Variance (202 cycles)</option>
          </select>

          {/* Speed Selector */}
          <select
            value={playbackSpeed}
            onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
            style={{
              padding: '0.45rem 0.6rem',
              borderRadius: '6px',
              background: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#f8fafc',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <option value={1}>1× Speed</option>
            <option value={2}>2× Speed</option>
            <option value={5}>5× Speed</option>
            <option value={10}>10× Speed</option>
            <option value={25}>25× Speed</option>
          </select>

          {/* Play/Pause */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '0.8rem',
              background: isPlaying ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
              color: isPlaying ? '#ef4444' : '#22c55e',
              border: `1px solid ${isPlaying ? 'rgba(239, 68, 68, 0.4)' : 'rgba(34, 197, 94, 0.4)'}`,
              cursor: 'pointer',
            }}
          >
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </button>

          {/* Reset */}
          <button
            onClick={resetSimulation}
            style={{
              padding: '0.45rem 0.8rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#cbd5e1',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              cursor: 'pointer',
            }}
          >
            ↺ Reset
          </button>
        </div>
      </div>

      {/* Main Grid: Turbofan SVG + RUL Gauge */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left: SVG Twin & Fault Injections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div
            style={{
              background: 'rgba(13, 20, 36, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f1f5f9', textTransform: 'uppercase' }}>
                Thermodynamic Cross-Section &amp; SHAP Health Mapping
              </span>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                Hover/Click stage for component telemetry
              </span>
            </div>

            <TurbofanSVG
              shapByComponent={currentEvent.shap_by_component}
              activeComponent={selectedComponent}
              onSelectComponent={(c) => setSelectedComponent(c)}
            />

            {/* Fault Injection Panel */}
            <div
              style={{
                marginTop: '1rem',
                padding: '0.8rem 1rem',
                background: 'rgba(15, 23, 42, 0.8)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
            >
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f8fafc' }}>
                  Inject Sensor Fault:
                </span>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block' }}>
                  Test real-time anomaly detector and CUSUM trigger
                </span>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => injectFault('drift', 's3', 1.8)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    background: 'rgba(245, 158, 11, 0.15)',
                    color: '#f59e0b',
                    border: '1px solid rgba(245, 158, 11, 0.35)',
                    cursor: 'pointer',
                  }}
                >
                  + Drift (HPC s3)
                </button>

                <button
                  onClick={() => injectFault('spike', 's4', 2.5)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: '#ef4444',
                    border: '1px solid rgba(239, 68, 68, 0.35)',
                    cursor: 'pointer',
                  }}
                >
                  + Spike (LPT s4)
                </button>

                <button
                  onClick={() => injectFault('dropout', 's11', 0)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    background: 'rgba(168, 85, 247, 0.15)',
                    color: '#c084fc',
                    border: '1px solid rgba(168, 85, 247, 0.35)',
                    cursor: 'pointer',
                  }}
                >
                  + Dropout (HPT s11)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: RUL Gauge + Recommendation Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <RULGauge
            rul={currentEvent.rul}
            rulLo={currentEvent.rul_lo}
            rulHi={currentEvent.rul_hi}
          />

          {/* Conservative Action Recommendation Card */}
          <div
            style={{
              background: 'rgba(17, 24, 39, 0.8)',
              border: `1px solid ${recommendation.color}55`,
              borderRadius: '12px',
              padding: '1.25rem',
              boxShadow: `0 4px 20px ${recommendation.color}15`,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: recommendation.color,
                  background: `${recommendation.color}22`,
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  border: `1px solid ${recommendation.color}44`,
                }}
              >
                {recommendation.priority}
              </span>
              <DataSourceBadge source="assumption" detail="Threshold rule: Critical <= 30, Warning 31-80, Healthy > 80" />
            </div>

            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', marginTop: '0.5rem' }}>
              {recommendation.action}
            </div>

            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.5 }}>
              {recommendation.rationale}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Live Sensor Readings + Alert Feed */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
        {/* Real C-MAPSS Sensor Telemetry Grid */}
        <div
          style={{
            background: 'rgba(17, 24, 39, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#f1f5f9', textTransform: 'uppercase' }}>
              Real C-MAPSS Channel Readings (FD001 Retained 14 Sensors)
            </h3>
            <DataSourceBadge source="replay bundle" detail="NASA Prognostics Data Repository" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.6rem' }}>
            {Object.entries(currentEvent.sensors).map(([sensorKey, sensorVal]) => (
              <div
                key={sensorKey}
                style={{
                  background: 'rgba(15, 23, 42, 0.7)',
                  borderRadius: '8px',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>{sensorKey}</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', fontFamily: 'monospace' }}>
                  {typeof sensorVal === 'number' ? sensorVal.toFixed(2) : sensorVal}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Alert Feed */}
        <AlertFeed alerts={alerts} />
      </div>
    </div>
  );
};
