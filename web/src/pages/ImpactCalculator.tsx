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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Title */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
          <h1 style={{ margin: 0, fontSize: '1.65rem', fontWeight: 800, color: '#0f172a' }}>
            Predictive Maintenance Impact &amp; ROI Calculator
          </h1>
          <DataSourceBadge source="assumption" detail="All values are parameterized assumptions based on industry benchmarks" />
        </div>
        <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b' }}>
          Estimate economic value from early borescope dispatch and avoided primary thermodynamic damage.
        </p>
      </div>

      {/* Mandatory Provenance Notice */}
      <div
        style={{
          background: '#fffbeb',
          borderLeft: '4px solid #f59e0b',
          border: '1px solid #fde68a',
          borderRadius: '8px',
          padding: '0.85rem 1.25rem',
          fontSize: '0.82rem',
          color: '#92400e',
          lineHeight: 1.5,
        }}
      >
        <strong>Compliance Notice (RULES.md):</strong> This tool provides{' '}
        <span style={{ color: '#b45309', fontWeight: 700 }}>parameterized scenario modeling</span>,
        not empirically measured flight fleet savings. All figures are labeled assumptions or derived from cited commercial aviation studies.
      </div>

      {/* Main Grid: Controls + Projected Savings */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
        {/* Sliders and Inputs Panel */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '1.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            boxShadow: '0 2px 8px -2px rgba(15, 23, 42, 0.05)',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
            Fleet &amp; Operational Assumptions
          </h2>

          {/* Fleet Size */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
              <span style={{ color: '#334155', fontWeight: 600 }}>Active Fleet Size:</span>
              <span style={{ color: '#0284c7', fontWeight: 800, fontFamily: 'monospace' }}>
                {fleetSize} engines <span style={{ color: '#b45309', fontSize: '0.72rem' }}>[assumption]</span>
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="200"
              step="5"
              value={fleetSize}
              onChange={(e) => setFleetSize(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#0284c7' }}
            />
          </div>

          {/* Cost per Event */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
              <span style={{ color: '#334155', fontWeight: 600 }}>Cost per Unscheduled Removal:</span>
              <span style={{ color: '#0284c7', fontWeight: 800, fontFamily: 'monospace' }}>
                {formatCurrency(costPerEvent)}{' '}
                <span style={{ color: '#b45309', fontSize: '0.72rem' }}>[cited study]</span>
              </span>
            </div>
            <input
              type="range"
              min="100000"
              max="1000000"
              step="25000"
              value={costPerEvent}
              onChange={(e) => setCostPerEvent(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#0284c7' }}
            />
          </div>

          {/* Unscheduled Rate */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
              <span style={{ color: '#334155', fontWeight: 600 }}>Annual Unscheduled Event Rate:</span>
              <span style={{ color: '#0284c7', fontWeight: 800, fontFamily: 'monospace' }}>
                {(annualEventsPerEngine * 100).toFixed(0)}% per engine/year{' '}
                <span style={{ color: '#b45309', fontSize: '0.72rem' }}>[assumption: 0.15 events]</span>
              </span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.40"
              step="0.01"
              value={annualEventsPerEngine}
              onChange={(e) => setAnnualEventsPerEngine(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#0284c7' }}
            />
          </div>

          {/* Assumed Reduction Bounds */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
              <span style={{ color: '#334155', fontWeight: 600 }}>Estimated Avoidance Reduction:</span>
              <span style={{ color: '#047857', fontWeight: 800, fontFamily: 'monospace' }}>
                {reductionPctLo}% — {reductionPctHi}%{' '}
                <span style={{ color: '#b45309', fontSize: '0.72rem' }}>[assumption]</span>
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
                style={{ flex: 1, accentColor: '#10b981' }}
              />
              <input
                type="range"
                min="21"
                max="40"
                step="1"
                value={reductionPctHi}
                onChange={(e) => setReductionPctHi(Number(e.target.value))}
                style={{ flex: 1, accentColor: '#10b981' }}
              />
            </div>
          </div>
        </div>

        {/* Projected Financial Return Card */}
        <div
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #ecfdf5 100%)',
            border: '1.5px solid #a7f3d0',
            borderRadius: '16px',
            padding: '1.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            boxShadow: '0 4px 16px -2px rgba(16, 185, 129, 0.12)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#047857', textTransform: 'uppercase' }}>
              Projected Annual Fleet Savings
            </span>
            <DataSourceBadge source="assumption" />
          </div>

          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1, fontFamily: 'monospace' }}>
              {formatCurrency(annualSavingsLo)}
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#047857', marginTop: '0.35rem', fontFamily: 'monospace' }}>
              to {formatCurrency(annualSavingsHi)} / year
            </div>
          </div>

          <div
            style={{
              background: '#ffffff',
              padding: '1rem',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              fontSize: '0.82rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.6rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
              <span>Baseline Unscheduled Removals:</span>
              <strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>{baselineAnnualEvents.toFixed(1)} events / yr</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
              <span>Baseline Fleet Removal Cost:</span>
              <strong style={{ color: '#b91c1c', fontFamily: 'monospace' }}>{formatCurrency(baselineAnnualCost)} / yr</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
              <span>Avoided Critical Failures:</span>
              <strong style={{ color: '#047857', fontFamily: 'monospace' }}>
                {avoidedEventsLo.toFixed(1)} – {avoidedEventsHi.toFixed(1)} events / yr
              </strong>
            </div>
          </div>

          <div style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.5 }}>
            * Calculation formula: <code style={{ color: '#0284c7', fontWeight: 600 }}>FleetSize × EventRate × AvoidanceReduction × CostPerEvent</code>
          </div>
        </div>
      </div>
    </div>
  );
};
