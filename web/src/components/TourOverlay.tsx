import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface TourStep {
  title: string;
  description: string;
  route: string;
  targetTip: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: '1 · Start C-MAPSS Replay',
    description: 'Launch real turbofan run-to-failure telemetry streaming directly to the edge inference engine.',
    route: '/twin',
    targetTip: 'Controls panel: Click Play or pick Fast Degrader engine.',
  },
  {
    title: '2 · Uncertainty-Aware Prediction',
    description: 'Notice the RUL Arc Gauge: it pairs point predictions with split-conformal 80% coverage intervals.',
    route: '/twin',
    targetTip: 'Decisions are backed by the conservative lower bound (rul_lo).',
  },
  {
    title: '3 · Instant Explainability',
    description: 'Turbofan SVG component rings light up based on grouped TreeSHAP attributions. No black-box guesswork.',
    route: '/explainability',
    targetTip: 'Click into any component to see the governing sensor channels.',
  },
  {
    title: '4 · Sever the Cloud Connection',
    description: 'Toggle offline mode to sever the edge-to-cloud link. Local container continues inference with zero drop.',
    route: '/edge-proof',
    targetTip: 'Edge Proof: Toggle offline and observe local p95 latency under 10ms.',
  },
  {
    title: '5 · Store-and-Forward Outbox',
    description: 'Events accumulate safely in an idempotent SQLite queue during offline flight operations.',
    route: '/edge-proof',
    targetTip: 'Queue depth ticks up while offline without memory spikes.',
  },
  {
    title: '6 · Zero-Loss Outbox Drain',
    description: 'Reconnect the cloud link. Watch the outbox drain ordered events with guaranteed idempotency.',
    route: '/edge-proof',
    targetTip: 'Status transitions back to online with 0 events lost.',
  },
  {
    title: '7 · Audit Rigorous Model Card',
    description: 'Inspect official NASA C-MAPSS FD001 test benchmark scores, 5-fold CV RMSE, and documented limitations.',
    route: '/model-card',
    targetTip: 'Every metric is derived from actual code and verifiable outputs.',
  },
];

interface TourOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TourOverlay: React.FC<TourOverlayProps> = ({ isOpen, onClose }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStepIndex];
  const isLast = currentStepIndex === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      onClose();
      setCurrentStepIndex(0);
    } else {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      navigate(TOUR_STEPS[nextIdx].route);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      navigate(TOUR_STEPS[prevIdx].route);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span
              style={{
                background: '#eff6ff',
                color: '#1d4ed8',
                border: '1px solid #bfdbfe',
                padding: '0.25rem 0.65rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
              }}
            >
              TOUR · STEP {currentStepIndex + 1} OF {TOUR_STEPS.length}
            </span>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }}>~90s Evaluator Guide</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Tour"
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '6px',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 700,
            }}
          >
            ✕
          </button>
        </div>

        <div>
          <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
            {step.title}
          </h2>
          <p style={{ margin: 0, fontSize: '0.92rem', color: '#475569', lineHeight: 1.55 }}>
            {step.description}
          </p>
        </div>

        <div
          style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '10px',
            padding: '0.85rem 1rem',
            fontSize: '0.83rem',
            color: '#15803d',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            fontWeight: 500,
          }}
        >
          <span style={{ fontSize: '1.1rem' }}>🎯</span>
          <span>{step.targetTip}</span>
        </div>

        {/* Progress Bar */}
        <div style={{ display: 'flex', gap: '4px', height: '5px' }}>
          {TOUR_STEPS.map((_, idx) => (
            <div
              key={idx}
              style={{
                flex: 1,
                borderRadius: '3px',
                background: idx <= currentStepIndex ? '#2563eb' : '#e2e8f0',
                transition: 'background 0.3s ease',
              }}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
          <button
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            style={{
              padding: '0.55rem 1.1rem',
              borderRadius: '8px',
              background: currentStepIndex === 0 ? '#f8fafc' : '#ffffff',
              border: '1px solid #cbd5e1',
              color: currentStepIndex === 0 ? '#94a3b8' : '#334155',
              cursor: currentStepIndex === 0 ? 'not-allowed' : 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            ← Previous
          </button>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={onClose}
              style={{
                padding: '0.55rem 1rem',
                borderRadius: '8px',
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              Exit Tour
            </button>
            <button
              onClick={handleNext}
              style={{
                padding: '0.55rem 1.25rem',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
              }}
            >
              {isLast ? 'Complete Tour 🎉' : 'Next Step →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
