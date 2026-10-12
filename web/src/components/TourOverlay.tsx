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
        backgroundColor: 'rgba(5, 8, 15, 0.75)',
        backdropFilter: 'blur(4px)',
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
          background: '#0d1424',
          border: '1px solid rgba(74, 158, 255, 0.4)',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 24px rgba(74, 158, 255, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span
              style={{
                background: 'rgba(74, 158, 255, 0.2)',
                color: '#60a5fa',
                padding: '0.2rem 0.6rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}
            >
              TOUR · STEP {currentStepIndex + 1} OF {TOUR_STEPS.length}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>~90s Evaluator Guide</span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              fontSize: '1.2rem',
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        <div>
          <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.3rem', fontWeight: 700, color: '#f8fafc' }}>
            {step.title}
          </h2>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.5 }}>
            {step.description}
          </p>
        </div>

        <div
          style={{
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '8px',
            padding: '0.8rem 1rem',
            fontSize: '0.82rem',
            color: '#38bdf8',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <span>🎯</span>
          <span>{step.targetTip}</span>
        </div>

        {/* Progress Bar */}
        <div style={{ display: 'flex', gap: '4px', height: '4px' }}>
          {TOUR_STEPS.map((_, idx) => (
            <div
              key={idx}
              style={{
                flex: 1,
                borderRadius: '2px',
                background: idx <= currentStepIndex ? '#3b82f6' : 'rgba(255,255,255,0.1)',
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
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.15)',
              color: currentStepIndex === 0 ? '#475569' : '#e2e8f0',
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
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: '0.85rem',
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
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
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
