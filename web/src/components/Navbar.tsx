import React from 'react';
import { NavLink } from 'react-router-dom';

interface NavbarProps {
  onStartTour: () => void;
  isOffline: boolean;
  isFallback: boolean;
  alertCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onStartTour,
  isOffline,
  isFallback: _isFallback,
  alertCount = 2,
}) => {
  const navItems = [
    { label: 'Overview', path: '/' },
    { label: 'Digital Twin', path: '/twin' },
    { label: 'Scenarios & Trends', path: '/scenarios' },
    { label: 'RUL & Edge Proof ⚡', path: '/edge-proof' },
    { label: 'Explainability', path: '/explainability' },
    { label: 'Model Card', path: '/model-card' },
    { label: 'Impact ROI', path: '/impact' },
    { label: 'Architecture', path: '/architecture' },
  ];

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.02)',
      }}
    >
      {/* Top Cockpit Header */}
      <div
        style={{
          padding: '0.65rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          borderBottom: '1px solid #f1f5f9',
        }}
      >
        {/* Brand & MRO Subtitle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '9px',
              background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)',
              color: '#ffffff',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 3v6" />
              <path d="M12 15v6" />
              <path d="M3 12h6" />
              <path d="M15 12h6" />
            </svg>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                AeroTwin <span style={{ color: '#0284c7' }}>Edge</span>
              </span>
              <span
                style={{
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  padding: '0.15rem 0.45rem',
                  borderRadius: '4px',
                  border: '1px solid #e2e8f0',
                  letterSpacing: '0.04em',
                }}
              >
                TATA INNOVENT-27
              </span>
            </div>
            <span
              style={{
                display: 'block',
                fontSize: '0.72rem',
                color: '#64748b',
                fontWeight: 500,
              }}
            >
              Digital Twin for Intelligent Turbofan MRO
            </span>
          </div>
        </div>

        {/* Central Live Flight Status Pill (Judge Lovable) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '9999px',
            padding: '0.35rem 1rem',
            fontSize: '0.78rem',
            color: '#334155',
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.7rem', fontWeight: 600 }}>ENGINE:</span>
            <span style={{ fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>ENG-01 (CFM56-7B26)</span>
          </div>
          <span style={{ color: '#cbd5e1' }}>|</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.7rem', fontWeight: 600 }}>FLIGHT:</span>
            <span style={{ fontWeight: 600, color: '#0f172a' }}>2,345 hrs</span>
          </div>
          <span style={{ color: '#cbd5e1' }}>|</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: isOffline ? '#ef4444' : '#10b981',
                boxShadow: isOffline ? '0 0 6px #ef4444' : '0 0 6px #10b981',
              }}
            />
            <span style={{ fontWeight: 700, color: isOffline ? '#b91c1c' : '#047857', fontSize: '0.72rem' }}>
              {isOffline ? 'OFFLINE OUTBOX' : 'LIVE TELEMETRY'}
            </span>
          </div>
        </div>

        {/* Right Action Icons & Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {/* Notification Bell */}
          <div
            style={{
              position: 'relative',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748b',
            }}
            title={`${alertCount} Active Alerts`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {alertCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-3px',
                  right: '-3px',
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #ffffff',
                }}
              >
                {alertCount}
              </span>
            )}
          </div>

          {/* User Profile Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.25rem 0.65rem',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc',
              fontSize: '0.78rem',
              color: '#334155',
            }}
          >
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: '#e0f2fe',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.7rem',
              }}
            >
              E
            </div>
            <span style={{ fontWeight: 600 }}>Engineer</span>
          </div>

          {/* Guided Tour CTA */}
          <button
            onClick={onStartTour}
            className="btn btn-primary btn-sm"
            style={{
              padding: '0.4rem 0.85rem',
              fontSize: '0.78rem',
              borderRadius: '8px',
              fontWeight: 700,
            }}
          >
            ⚡ 90s Tour
          </button>
        </div>
      </div>

      {/* Navigation Sub-bar */}
      <nav
        style={{
          padding: '0.35rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          overflowX: 'auto',
          backgroundColor: '#ffffff',
        }}
      >
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              padding: '0.45rem 0.85rem',
              borderRadius: '7px',
              fontSize: '0.82rem',
              fontWeight: isActive ? 700 : 500,
              color: isActive ? '#0284c7' : '#475569',
              backgroundColor: isActive ? '#f0f9ff' : 'transparent',
              border: isActive ? '1px solid #bae6fd' : '1px solid transparent',
              textDecoration: 'none',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            })}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
};
