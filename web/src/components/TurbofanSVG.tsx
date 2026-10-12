import React, { useState } from 'react';
import { ShapComponents } from '../types';

interface TurbofanSVGProps {
  shapByComponent?: ShapComponents;
  activeComponent?: string | null;
  onSelectComponent?: (component: string) => void;
}

/**
 * TurbofanSVG — Interactive cross-section vector digital twin of turbofan engine.
 * Renders 6 distinct thermodynamic stages: Fan, LPC, HPC, Combustor, HPT, LPT.
 * Health palette adherence (RULES.md):
 *   Healthy: #22c55e, Warning: #f59e0b, Critical: #ef4444.
 */
export const TurbofanSVG: React.FC<TurbofanSVGProps> = ({
  shapByComponent,
  activeComponent,
  onSelectComponent,
}) => {
  const [hovered, setHovered] = useState<string | null>(null);

  // Derive health color from SHAP contribution (negative SHAP reduces RUL)
  const getComponentHealth = (component: string): { status: 'HEALTHY' | 'WARNING' | 'CRITICAL'; color: string } => {
    if (!shapByComponent || shapByComponent[component] === undefined) {
      return { status: 'HEALTHY', color: '#22c55e' };
    }
    const val = shapByComponent[component];
    // Thresholds: negative impact pulls down RUL
    if (val < -4.0) {
      return { status: 'CRITICAL', color: '#ef4444' };
    } else if (val < -1.5) {
      return { status: 'WARNING', color: '#f59e0b' };
    }
    return { status: 'HEALTHY', color: '#22c55e' };
  };

  const components = [
    { id: 'Fan', name: 'Fan Section (s9, s20, s21)', x: 60, y: 50, w: 90, h: 220 },
    { id: 'LPC', name: 'Low-Pressure Compressor (s2)', x: 160, y: 75, w: 75, h: 170 },
    { id: 'HPC', name: 'High-Pressure Compressor (s3, s4, s7, s8)', x: 245, y: 90, w: 95, h: 140 },
    { id: 'Combustor', name: 'Combustion Chamber (s8, s15)', x: 350, y: 100, w: 75, h: 120 },
    { id: 'HPT', name: 'High-Pressure Turbine (s11)', x: 435, y: 95, w: 65, h: 130 },
    { id: 'LPT', name: 'Low-Pressure Turbine (s13, s14)', x: 510, y: 80, w: 85, h: 160 },
  ];

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      <svg
        viewBox="0 0 680 320"
        style={{
          width: '100%',
          height: 'auto',
          background: 'linear-gradient(180deg, rgba(13,20,36,0.85) 0%, rgba(7,11,20,0.95) 100%)',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}
      >
        <defs>
          <linearGradient id="nacelleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="50%" stopColor="#334155" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Nacelle & Core Cowling Outline */}
        <path
          d="M 40,40 Q 340,15 640,65 L 640,95 Q 340,55 50,65 Z"
          fill="url(#nacelleGrad)"
          stroke="#475569"
          strokeWidth="1.5"
        />
        <path
          d="M 40,280 Q 340,305 640,255 L 640,225 Q 340,265 50,255 Z"
          fill="url(#nacelleGrad)"
          stroke="#475569"
          strokeWidth="1.5"
        />
        {/* Core Centerline */}
        <line
          x1="30"
          y1="160"
          x2="650"
          y2="160"
          stroke="rgba(255,255,255,0.15)"
          strokeDasharray="4 4"
        />

        {/* Component Modules */}
        {components.map((comp) => {
          const health = getComponentHealth(comp.id);
          const isSelected = activeComponent === comp.id;
          const isHovered = hovered === comp.id;
          const shapVal = shapByComponent ? shapByComponent[comp.id] ?? 0 : 0;

          return (
            <g
              key={comp.id}
              onClick={() => onSelectComponent && onSelectComponent(comp.id)}
              onMouseEnter={() => setHovered(comp.id)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Backlight / Glow */}
              {(isSelected || isHovered) && (
                <rect
                  x={comp.x - 4}
                  y={comp.y - 4}
                  width={comp.w + 8}
                  height={comp.h + 8}
                  rx="10"
                  fill="none"
                  stroke={health.color}
                  strokeWidth="2.5"
                  filter="url(#glow)"
                  opacity="0.8"
                />
              )}

              {/* Main Module Body */}
              <rect
                x={comp.x}
                y={comp.y}
                width={comp.w}
                height={comp.h}
                rx="8"
                fill={isHovered ? 'rgba(30, 41, 59, 0.9)' : 'rgba(15, 23, 42, 0.75)'}
                stroke={health.color}
                strokeWidth={isSelected ? '2.5' : '1.5'}
                strokeDasharray={isSelected ? 'none' : 'none'}
              />

              {/* Internal vanes / rotor indicator */}
              <line
                x1={comp.x + comp.w / 2}
                y1={comp.y + 10}
                x2={comp.x + comp.w / 2}
                y2={comp.y + comp.h - 10}
                stroke={health.color}
                strokeWidth="1.5"
                opacity="0.5"
              />

              {/* Component Label */}
              <text
                x={comp.x + comp.w / 2}
                y={155}
                textAnchor="middle"
                fill="#f1f5f9"
                fontSize="12"
                fontWeight="700"
                fontFamily="Inter, sans-serif"
                letterSpacing="0.05em"
              >
                {comp.id}
              </text>

              {/* SHAP Impact Pill */}
              <rect
                x={comp.x + (comp.w - 52) / 2}
                y={168}
                width="52"
                height="16"
                rx="4"
                fill="rgba(0,0,0,0.6)"
              />
              <text
                x={comp.x + comp.w / 2}
                y={180}
                textAnchor="middle"
                fill={health.color}
                fontSize="10"
                fontWeight="600"
                fontFamily="Inter, monospace"
              >
                {shapVal >= 0 ? `+${shapVal.toFixed(1)}` : shapVal.toFixed(1)}
              </text>
            </g>
          );
        })}

        {/* Exhaust Cone */}
        <polygon
          points="605,110 655,160 605,210"
          fill="#1e293b"
          stroke="#475569"
          strokeWidth="1.5"
        />

        {/* Inlet Nose Cone */}
        <polygon
          points="60,110 25,160 60,210"
          fill="#334155"
          stroke="#475569"
          strokeWidth="1.5"
        />
      </svg>

      {/* Hover Info Tooltip */}
      {hovered && (
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(255,255,255,0.15)',
            padding: '6px 14px',
            borderRadius: '6px',
            fontSize: '0.8rem',
            color: '#cbd5e1',
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
            pointerEvents: 'none',
          }}
        >
          <span style={{ fontWeight: 600, color: '#f8fafc' }}>
            {components.find((c) => c.id === hovered)?.name}
          </span>
          <span>·</span>
          <span>
            Status:{' '}
            <strong style={{ color: getComponentHealth(hovered).color }}>
              {getComponentHealth(hovered).status}
            </strong>
          </span>
          <span>·</span>
          <span>
            SHAP Attribution: {shapByComponent ? (shapByComponent[hovered] ?? 0).toFixed(2) : '0.00'}
          </span>
        </div>
      )}
    </div>
  );
};
