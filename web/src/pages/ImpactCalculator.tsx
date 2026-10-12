import React, { useState } from 'react';
import { DataSourceBadge } from '../components/DataSourceBadge';

export const ImpactCalculator: React.FC = () => {
  // Configurable parameters with default assumptions
  const [fleetSize, setFleetSize] = useState<number>(50);
  const [costPerEvent, setCostPerEvent] = useState<number>(450000); // $450,000 per unscheduled removal
  const [annualEventsPerEngine, setAnnualEventsPerEngine] = useState<number>(0.15); // 0.15 events/yr
  const [reductionPctLo, setReductionPctLo] = useState<number>(15); // 15%
  const [reductionPctHi, setReductionPctHi] = useState<number>(25); // 25%

  // Calculations
  const baselineAnnualEvents = fleetSize * annualEventsPerEngine;
  const baselineAnnualCost = baselineAnnualEvents * costPerEvent;

  const avoidedEventsLo = baselineAnnualEvents * (reductionPctLo / 100);
  const avoidedEventsHi = baselineAnnualEvents * (reductionPctHi / 100);

  const annualSavingsLo = avoidedEventsLo * costPerEvent;
  const annualSavingsHi = avoidedEventsHi * costPerEvent;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Title */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
          <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc' }}>
            Predictive Maintenance Impact &amp; ROI Calculator
          </h1>
          <DataSourceBadge source="assumption" detail="All values are parameterized assumptions based on industry benchmarks" />
        </div>
        <p style={{ margin: 0, fontSize: '0.9rem', color: '#94a3b8' }}>
          Estimate economic value from early borescope dispatch and avoided primary thermodynamic damage.
        </p>
      </div>

      {/* Mandatory Provenance Notice */}
      <div
        style={{
          background: 'rgba(245, 158, 11, 0.08)',
          borderLeft: '4px solid #f59e0b',
          borderRadius: '4px 8px 8px 4px',
          padding: '0.8rem 1.2rem',
          fontSize: '0.82rem',
          color: '#cbd5e1',
          lineHeight: 1.5,
        }}
      >
        <strong>Compliance Notice (RULES.md):</strong> This tool provides{' '}
        <span style={{ color: '#f59e0b', fontWeight: 700 }}>parameterized scenario modeling</span>,
        not empirically measured flight fleet savings. All figures are labeled assumptions or derived from cited commercial aviation studies.
      </div>

      {/* Main Grid: Controls + Projected Savings */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.75rem', alignItems: 'start' }}>
        {/* Sliders and Inputs Panel */}
        <div
          style={{
            background: 'rgba(13, 20, 36, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '1.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
            Fleet &amp; Operational Assumptions
          </h2>

          {/* Fleet Size */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
              <span style={{ color: '#cbd5e1', fontWeight: 600 }}>Active Fleet Size:</span>
              <span style={{ color: '#38bdf8', fontWeight: 700 }}>
                {fleetSize} engines <span style={{ color: '#f59e0b', fontSize: '0.75rem' }}>[assumption]</span>
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="200"
              step="5"
              value={fleetSize}
              onChange={(e) => setFleetSize(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#38bdf8' }}
            />
          </div>

          {/* Cost per Event */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
              <span style={{ color: '#cbd5e1', fontWeight: 600 }}>Cost per Unscheduled Removal:</span>
              <span style={{ color: '#38bdf8', fontWeight: 700 }}>
                {formatCurrency(costPerEvent)}{' '}
                <span style={{ color: '#f59e0b', fontSize: '0.75rem' }}>[cited study: IATA Maintenance Cost Task Force]</span>
              </span>
            </div>
            <input
              type="range"
              min="100000"
              max="1000000"
              step="25000"
              value={costPerEvent}
              onChange={(e) => setCostPerEvent(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#38bdf8' }}
            />
          </div>

          {/* Unscheduled Rate */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
              <span style={{ color: '#cbd5e1', fontWeight: 600 }}>Annual Unscheduled Event Rate:</span>
              <span style={{ color: '#38bdf8', fontWeight: 700 }}>
                {(annualEventsPerEngine * 100).toFixed(0)}% per engine/year{' '}
                <span style={{ color: '#f59e0b', fontSize: '0.75rem' }}>[assumption: 0.15 events/engine]</span>
              </span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.40"
              step="0.01"
              value={annualEventsPerEngine}
              onChange={(e) => setAnnualEventsPerEngine(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#38bdf8' }}
            />
          </div>

          {/* Assumed Reduction Bounds */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
              <span style={{ color: '#cbd5e1', fontWeight: 600 }}>Estimated Avoidance Reduction:</span>
              <span style={{ color: '#22c55e', fontWeight: 700 }}>
                {reductionPctLo}% — {reductionPctHi}%{' '}
                <span style={{ color: '#f59e0b', fontSize: '0.75rem' }}>[assumption]</span>
              </span>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <input
                type="range"
                min="5"
                max="20"
                step="1"
                value={reductionPctLo}
                onChange={(e) => setReductionPctLo(Number(e.target.value))}
                style={{ flex: 1, accentColor: '#22c55e' }}
              />
              <input
                type="range"
                min="21"
                max="40"
                step="1"
                value={reductionPctHi}
                onChange={(e) => setReductionPctHi(Number(e.target.value))}
                style={{ flex: 1, accentColor: '#22c55e' }}
              />
            </div>
          </div>
        </div>

        {/* Projected Financial Return Card */}
        <div
          style={{
            background: 'radial-gradient(ellipse at top, rgba(34, 197, 94, 0.1) 0%, rgba(13, 20, 36, 0.9) 70%)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: '16px',
            padding: '1.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#22c55e', textTransform: 'uppercase' }}>
              Projected Annual Fleet Savings
            </span>
            <DataSourceBadge source="assumption" />
          </div>

          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1.1 }}>
              {formatCurrency(annualSavingsLo)}
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#22c55e', marginTop: '0.35rem' }}>
              to {formatCurrency(annualSavingsHi)} / year
            </div>
          </div>

          <div
            style={{
              background: 'rgba(15, 23, 42, 0.75)',
              padding: '1rem',
              borderRadius: '8px',
              fontSize: '0.8rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
              <span>Baseline Unscheduled Removals:</span>
              <strong style={{ color: '#f8fafc' }}>{baselineAnnualEvents.toFixed(1)} events / yr</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
              <span>Baseline Fleet Removal Cost:</span>
              <strong style={{ color: '#ef4444' }}>{formatCurrency(baselineAnnualCost)} / yr</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
              <span>Avoided Critical Failures:</span>
              <strong style={{ color: '#22c55e' }}>
                {avoidedEventsLo.toFixed(1)} – {avoidedEventsHi.toFixed(1)} events / yr
              </strong>
            </div>
          </div>

          <div style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.5 }}>
            * Calculation formula: <code style={{ color: '#38bdf8' }}>FleetSize × EventRate × AvoidanceReduction × CostPerEvent</code>
          </div>
        </div>
      </div>
    </div>
  );
};
