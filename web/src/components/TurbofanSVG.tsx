import React, { useState } from 'react';
import { ShapComponents } from '../types';

interface TurbofanSVGProps {
  shapByComponent?: ShapComponents;
  activeComponent?: string | null;
  onSelectComponent?: (component: string) => void;
}

/**
 * TurbofanSVG — Interactive cross-section vector and 3D CAD digital twin of turbofan engine.
 * Renders distinct thermodynamic stages: Fan, LPC, HPC, Combustor, HPT, LPT, Exhaust.
 * Supports interactive stage selection, health percentages, and view controls.
 * Adheres to white decent theme and health palette: Healthy #10b981, Warning #f59e0b, Critical #ef4444.
 */
export const TurbofanSVG: React.FC<TurbofanSVGProps> = ({
  shapByComponent,
  activeComponent,
  onSelectComponent,
}) => {
  const [viewMode, setViewMode] = useState<'3D' | 'SCHEMATIC'>('3D');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isSectionView, setIsSectionView] = useState<boolean>(true);
  const [isRotating, setIsRotating] = useState<boolean>(false);
  const [hovered, setHovered] = useState<string | null>(null);

  // Derive health color and score from SHAP contribution
  const getComponentHealth = (component: string): { status: 'HEALTHY' | 'WARNING' | 'CRITICAL'; color: string; score: number } => {
    if (!shapByComponent || shapByComponent[component] === undefined) {
      // Default baseline scores
      const baselines: Record<string, number> = {
        Fan: 92,
        LPC: 88,
        HPC: 85,
        Combustor: 74,
        HPT: 68,
        LPT: 72,
        Exhaust: 90,
      };
      const score = baselines[component] ?? 85;
      const status = score < 70 ? 'WARNING' : score < 50 ? 'CRITICAL' : 'HEALTHY';
      const color = status === 'CRITICAL' ? '#ef4444' : status === 'WARNING' ? '#f59e0b' : '#10b981';
      return { status, color, score };
    }
    const val = shapByComponent[component];
    let score = Math.round(90 + val * 5); // baseline ~90% minus SHAP degradation
    score = Math.max(25, Math.min(99, score));

    if (val < -4.0 || score < 50) {
      return { status: 'CRITICAL', color: '#ef4444', score };
    } else if (val < -1.5 || score < 75) {
      return { status: 'WARNING', color: '#f59e0b', score };
    }
    return { status: 'HEALTHY', color: '#10b981', score };
  };

  const components = [
    { id: 'Fan', name: 'Fan Section (s9, s20, s21)', pinX: '18%', pinY: '22%' },
    { id: 'LPC', name: 'Low Pressure Compressor (s2)', pinX: '38%', pinY: '18%' },
    { id: 'HPC', name: 'High Pressure Compressor (s3, s7)', pinX: '46%', pinY: '18%' },
    { id: 'Combustor', name: 'Combustion Chamber (s8, s15)', pinX: '59%', pinY: '16%' },
    { id: 'HPT', name: 'High Pressure Turbine (s11)', pinX: '68%', pinY: '18%' },
    { id: 'LPT', name: 'Low Pressure Turbine (s13, s14)', pinX: '76%', pinY: '18%' },
    { id: 'Exhaust', name: 'Exhaust Nozzle (s4)', pinX: '86%', pinY: '22%' },
  ];

  return (
    <div
      style={{
        width: '100%',
        position: 'relative',
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '14px',
        padding: '1.25rem',
        boxShadow: '0 2px 8px -2px rgba(15, 23, 42, 0.05), 0 1px 4px -1px rgba(15, 23, 42, 0.03)',
      }}
    >
      {/* View Header with Mode Toggles */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
              DIGITAL TWIN · TURBOFAN ENGINE VIEW
            </h3>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                color: '#0284c7',
                backgroundColor: '#f0f9ff',
                border: '1px solid #bae6fd',
                padding: '0.15rem 0.5rem',
                borderRadius: '9999px',
              }}
            >
              CFM56-7B26
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Interactive stage health attribution · Click any module to filter telemetry
          </span>
        </div>

        {/* View Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button
            onClick={() => setViewMode(viewMode === '3D' ? 'SCHEMATIC' : '3D')}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 700,
              backgroundColor: viewMode === '3D' ? '#0284c7' : '#f8fafc',
              color: viewMode === '3D' ? '#ffffff' : '#475569',
              border: '1px solid ' + (viewMode === '3D' ? '#0284c7' : '#e2e8f0'),
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            <span>{viewMode === '3D' ? '🔬 3D Cutaway Active' : '📐 2D Schematic'}</span>
          </button>
        </div>
      </div>

      {/* Main Visualizer Canvas */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          minHeight: '340px',
          backgroundColor: '#f8fafc',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {viewMode === '3D' ? (
          /* Photorealistic 3D Cutaway with Callout Badges */
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: `scale(${zoomLevel}) ${isRotating ? 'rotate(1deg)' : ''}`,
              transition: 'transform 0.3s ease',
            }}
          >
            <img
              src="/turbofan_cutaway.jpg"
              alt="Turbofan Engine 3D Cutaway"
              style={{
                width: '100%',
                maxHeight: '380px',
                objectFit: 'contain',
                display: 'block',
              }}
            />

            {/* Interactive Callout Badges over the 3D model */}
            {components.map((comp) => {
              const health = getComponentHealth(comp.id);
              const isSelected = activeComponent === comp.id;
              const isHovered = hovered === comp.id;

              return (
                <div
                  key={comp.id}
                  onClick={() => onSelectComponent && onSelectComponent(comp.id)}
                  onMouseEnter={() => setHovered(comp.id)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    position: 'absolute',
                    top: comp.pinY,
                    left: comp.pinX,
                    transform: 'translate(-50%, -50%)',
                    cursor: 'pointer',
                    zIndex: 10,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      backgroundColor: isSelected || isHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.95)',
                      padding: '0.25rem 0.55rem',
                      borderRadius: '8px',
                      border: `1.5px solid ${isSelected ? '#0284c7' : health.color}`,
                      boxShadow: isSelected
                        ? '0 4px 12px rgba(2, 132, 199, 0.35)'
                        : '0 2px 6px rgba(0,0,0,0.08)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: health.color,
                        boxShadow: `0 0 6px ${health.color}`,
                      }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
                        {comp.id}
                      </span>
                      <span style={{ fontSize: '0.62rem', fontWeight: 700, color: health.color }}>
                        {health.score}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* 2D Vector Schematic Mode */
          <svg
            viewBox="0 0 680 280"
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: '380px',
            }}
          >
            <defs>
              <linearGradient id="nacelleLight" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#e2e8f0" />
                <stop offset="50%" stopColor="#f1f5f9" />
                <stop offset="100%" stopColor="#e2e8f0" />
              </linearGradient>
            </defs>

            {/* Nacelle Outline */}
            <path
              d="M 40,40 Q 340,15 640,65 L 640,95 Q 340,55 50,65 Z"
              fill="url(#nacelleLight)"
              stroke="#cbd5e1"
              strokeWidth="1.5"
            />
            <path
              d="M 40,240 Q 340,265 640,215 L 640,185 Q 340,225 50,215 Z"
              fill="url(#nacelleLight)"
              stroke="#cbd5e1"
              strokeWidth="1.5"
            />
            <line x1="30" y1="140" x2="650" y2="140" stroke="#cbd5e1" strokeDasharray="4 4" />

            {/* Schematic Modules */}
            {[
              { id: 'Fan', name: 'Fan Section', x: 60, y: 45, w: 90, h: 190 },
              { id: 'LPC', name: 'LPC Compressor', x: 160, y: 65, w: 75, h: 150 },
              { id: 'HPC', name: 'HPC Compressor', x: 245, y: 80, w: 95, h: 120 },
              { id: 'Combustor', name: 'Combustor', x: 350, y: 85, w: 75, h: 110 },
              { id: 'HPT', name: 'HPT Turbine', x: 435, y: 80, w: 65, h: 120 },
              { id: 'LPT', name: 'LPT Turbine', x: 510, y: 70, w: 85, h: 140 },
            ].map((comp) => {
              const health = getComponentHealth(comp.id);
              const isSelected = activeComponent === comp.id;
              const isHovered = hovered === comp.id;

              return (
                <g
                  key={comp.id}
                  onClick={() => onSelectComponent && onSelectComponent(comp.id)}
                  onMouseEnter={() => setHovered(comp.id)}
                  onMouseLeave={() => setHovered(null)}
                  style={{ cursor: 'pointer' }}
                >
                  <rect
                    x={comp.x}
                    y={comp.y}
                    width={comp.w}
                    height={comp.h}
                    rx="8"
                    fill={isSelected || isHovered ? '#eff6ff' : '#ffffff'}
                    stroke={isSelected ? '#0284c7' : health.color}
                    strokeWidth={isSelected ? '2.5' : '1.5'}
                  />
                  <text
                    x={comp.x + comp.w / 2}
                    y={comp.y + comp.h / 2 - 6}
                    textAnchor="middle"
                    fill="#0f172a"
                    fontSize="11"
                    fontWeight="800"
                  >
                    {comp.id}
                  </text>
                  <text
                    x={comp.x + comp.w / 2}
                    y={comp.y + comp.h / 2 + 12}
                    textAnchor="middle"
                    fill={health.color}
                    fontSize="10"
                    fontWeight="700"
                  >
                    {health.score}%
                  </text>
                </g>
              );
            })}
          </svg>
        )}
      </div>

      {/* Control Action Buttons (From reference image: Rotate, Zoom, Section View, Reset View) */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '0.85rem',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button
            onClick={() => setIsRotating(!isRotating)}
            className="btn btn-ghost btn-sm"
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
          >
            🔄 Rotate {isRotating ? 'Off' : ''}
          </button>
          <button
            onClick={() => setZoomLevel((z) => (z >= 1.3 ? 1.0 : z + 0.15))}
            className="btn btn-ghost btn-sm"
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
          >
            🔍 Zoom {zoomLevel > 1 ? `(${zoomLevel.toFixed(1)}x)` : ''}
          </button>
          <button
            onClick={() => setIsSectionView(!isSectionView)}
            className="btn btn-ghost btn-sm"
            style={{
              fontSize: '0.75rem',
              padding: '0.35rem 0.65rem',
              backgroundColor: isSectionView ? '#f0f9ff' : undefined,
              borderColor: isSectionView ? '#bae6fd' : undefined,
              color: isSectionView ? '#0284c7' : undefined,
            }}
          >
            ✂️ Section View
          </button>
          <button
            onClick={() => {
              setZoomLevel(1);
              setIsRotating(false);
              setIsSectionView(true);
              if (onSelectComponent) onSelectComponent('');
            }}
            className="btn btn-ghost btn-sm"
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
          >
            ↺ Reset View
          </button>
        </div>

        {/* Selected Component Quick Tag */}
        {activeComponent && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem' }}>
            <span style={{ color: '#64748b' }}>Filtered Stage:</span>
            <span
              style={{
                fontWeight: 700,
                color: '#0284c7',
                backgroundColor: '#f0f9ff',
                padding: '0.2rem 0.5rem',
                borderRadius: '6px',
                border: '1px solid #bae6fd',
              }}
            >
              {activeComponent}
            </span>
            <button
              onClick={() => onSelectComponent && onSelectComponent('')}
              style={{
                border: 'none',
                background: 'transparent',
                color: '#94a3b8',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.8rem',
              }}
              title="Clear Filter"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
