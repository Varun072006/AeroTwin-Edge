import React from 'react';
import { NavLink } from 'react-router-dom';

interface NavbarProps {
  onStartTour: () => void;
  isOffline: boolean;
  isFallback: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onStartTour, isOffline, isFallback }) => {
  const navItems = [
    { label: 'Overview', path: '/' },
    { label: 'Digital Twin', path: '/twin' },
    { label: 'Scenarios', path: '/scenarios' },
    { label: 'Edge Proof ⚡', path: '/edge-proof' },
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
        backgroundColor: 'rgba(7, 11, 20, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '0.75rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
      }}
    >
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #38bdf8 0%, #2563eb 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(56, 189, 248, 0.4)',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 3v6" />
            <path d="M12 15v6" />
            <path d="M3 12h6" />
            <path d="M15 12h6" />
          </svg>
        </div>
        <div>
          <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
            AeroTwin <span style={{ color: '#38bdf8' }}>Edge</span>
          </span>
          <span
            style={{
              display: 'block',
              fontSize: '0.65rem',
              color: '#64748b',
              fontWeight: 500,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            Tata Innovent-27
          </span>
        </div>
      </div>

      {/* Navigation tabs */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', overflowX: 'auto' }}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              padding: '0.4rem 0.75rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: isActive ? 700 : 500,
              color: isActive ? '#38bdf8' : '#94a3b8',
              backgroundColor: isActive ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
              border: isActive ? '1px solid rgba(56, 189, 248, 0.25)' : '1px solid transparent',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
            })}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Status Indicators & Tour CTA */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Offline Badge */}
        {isOffline && (
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '0.2rem 0.6rem',
              borderRadius: '9999px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              color: '#ef4444',
              border: '1px solid rgba(239, 68, 68, 0.35)',
            }}
          >
            Edge Isolated
          </span>
        )}

        {/* Fallback Static Data Badge */}
        {isFallback && !isOffline && (
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 600,
              padding: '0.2rem 0.6rem',
              borderRadius: '9999px',
              backgroundColor: 'rgba(168, 85, 247, 0.15)',
              color: '#c084fc',
              border: '1px solid rgba(168, 85, 247, 0.35)',
            }}
            title="Running on local static NASA C-MAPSS bundle"
          >
            Static Bundle Fallback
          </span>
        )}

        {/* 90-sec Tour Trigger */}
        <button
          onClick={onStartTour}
          style={{
            cursor: 'pointer',
            padding: '0.4rem 0.85rem',
            borderRadius: '6px',
            fontSize: '0.78rem',
            fontWeight: 700,
            background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.2) 0%, rgba(56, 189, 248, 0.2) 100%)',
            color: '#38bdf8',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            transition: 'all 0.2s',
          }}
        >
          <span>▶</span>
          <span>90s Tour</span>
        </button>
      </div>
    </header>
  );
};
