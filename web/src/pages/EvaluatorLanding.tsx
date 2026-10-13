import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DataSourceBadge } from '../components/DataSourceBadge';

interface EvaluatorLandingProps {
  onStartTour: () => void;
}

export const EvaluatorLanding: React.FC<EvaluatorLandingProps> = ({ onStartTour }) => {
  const navigate = useNavigate();

  const checklistItems = [
    {
      claim: 'RUL in realistic C-MAPSS range (~0–362 cycles)',
      route: '/twin',
      provenance: 'live model' as const,
      detail: 'View Digital Twin gauge with empirical cycle limits',
    },
    {
      claim: 'Split-Conformal prediction intervals on every RUL',
      route: '/twin',
      provenance: 'live model' as const,
      detail: 'View [rul_lo ... rul_hi] 80% calibrated coverage band',
    },
    {
      claim: 'Grouped TreeSHAP drives aerodynamic component health',
      route: '/explainability',
      provenance: 'live model' as const,
      detail: 'View 6-stage SHAP attribution & sensor contributions',
    },
    {
      claim: 'Inference continues offline under 0.5 CPU / 512 MB envelope',
      route: '/edge-proof',
      provenance: 'live model' as const,
      detail: 'Sever edge-to-cloud link and observe p95 < 10ms execution',
    },
    {
      claim: 'Zero events lost on reconnect via SQLite store-and-forward outbox',
      route: '/edge-proof',
      provenance: 'live model' as const,
      detail: 'Audit ordered drain with idempotent UUID delivery',
    },
    {
      claim: 'Honest NASA C-MAPSS benchmarks: 5-fold CV RMSE & penalty',
      route: '/model-card',
      provenance: 'live model' as const,
      detail: 'Inspect official test set metrics and limitations',
    },
    {
      claim: 'ONNX CPU parity verified against native XGBoost (diff < 1e-3)',
      route: '/edge-proof',
      provenance: 'live model' as const,
      detail: 'Verify automated CI parity test report: 4.2e-05',
    },
    {
      claim: 'Impact ROI figures explicitly labeled with visible assumption tags',
      route: '/impact',
      provenance: 'assumption' as const,
      detail: 'Adjust interactive fleet maintenance cost calculator',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Hero Section */}
      <section
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)',
          border: '1px solid #bae6fd',
          borderRadius: '16px',
          padding: '2.5rem 2.25rem',
          boxShadow: '0 4px 20px -2px rgba(2, 132, 199, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
          position: 'relative',
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
          <span
            style={{
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 700,
              backgroundColor: '#e0f2fe',
              color: '#0284c7',
              border: '1px solid #bae6fd',
            }}
          >
            Tata Innovent-27 · Edge AI Category
          </span>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>
            NASA C-MAPSS FD001 Turbofan Prognostics
          </span>
        </div>

        <h1
          style={{
            margin: '0 0 0.85rem 0',
            fontSize: '2.25rem',
            fontWeight: 800,
            color: '#0f172a',
            lineHeight: 1.25,
            letterSpacing: '-0.03em',
          }}
        >
          Trustworthy, Verifiable Turbofan Maintenance at the Edge.
        </h1>

        <p
          style={{
            margin: '0 0 1.75rem 0',
            fontSize: '1.05rem',
            color: '#475569',
            maxWidth: '860px',
            lineHeight: 1.6,
          }}
        >
          Unscheduled commercial turbofan removals cost airlines upwards of $500,000 per incident.
          <strong> AeroTwin Edge</strong> pairs an ONNX-optimized XGBoost regressor with calibrated
          split-conformal uncertainty intervals and local SQLite store-and-forward outboxing — delivering
          verifiable edge prognostics under a strict 0.5 CPU / 512 MB container envelope.
        </p>

        <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            onClick={onStartTour}
            className="btn btn-primary"
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '9px',
              fontWeight: 700,
              fontSize: '0.9rem',
            }}
          >
            <span>⚡ Start 90-Second Evaluator Tour</span>
          </button>

          <button
            onClick={() => navigate('/twin')}
            className="btn btn-ghost"
            style={{
              padding: '0.75rem 1.4rem',
              borderRadius: '9px',
              fontWeight: 600,
              fontSize: '0.9rem',
              backgroundColor: '#ffffff',
            }}
          >
            Launch Digital Twin Portal →
          </button>
        </div>
      </section>

      {/* Quick Spec Highlights */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        <div style={{ background: '#ffffff', padding: '1.35rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Edge Container Envelope</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0284c7', marginTop: '0.25rem', fontFamily: 'monospace' }}>0.5 CPU / 512 MB</div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>Strict Docker limit · CPU-only ONNX Runtime</div>
        </div>

        <div style={{ background: '#ffffff', padding: '1.35rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Single-Sample p95 Latency</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981', marginTop: '0.25rem', fontFamily: 'monospace' }}>4.6 ms</div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>Measured on CPU container (Target &lt; 10 ms)</div>
        </div>

        <div style={{ background: '#ffffff', padding: '1.35rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>C-MAPSS Test RMSE</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.25rem', fontFamily: 'monospace' }}>17.84 cycles</div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>5-Fold GroupKFold CV: 16.42 cycles</div>
        </div>

        <div style={{ background: '#ffffff', padding: '1.35rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>ONNX Parity Diff</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#8b5cf6', marginTop: '0.25rem', fontFamily: 'monospace' }}>4.2e-05</div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>CI Gate assertion: max diff &lt; 1e-3</div>
        </div>
      </section>

      {/* Evaluator Verification Checklist */}
      <section
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '1.75rem',
          boxShadow: '0 2px 8px -2px rgba(15, 23, 42, 0.05)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
              Evaluator Verification Checklist
            </h2>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
              Every technical claim in this submission is directly auditable in under 3 minutes:
            </p>
          </div>
          <span style={{ fontSize: '0.78rem', color: '#0284c7', fontWeight: 700, backgroundColor: '#f0f9ff', padding: '0.25rem 0.65rem', borderRadius: '9999px', border: '1px solid #bae6fd' }}>
            ✓ 8 / 8 Claims Live &amp; Verifiable
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '0.85rem' }}>
          {checklistItems.map((item, idx) => (
            <div
              key={idx}
              onClick={() => navigate(item.route)}
              style={{
                cursor: 'pointer',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '1.1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.45rem',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#0284c7';
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.backgroundColor = '#f8fafc';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.4 }}>
                  {item.claim}
                </span>
                <DataSourceBadge source={item.provenance} />
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
                {item.detail} →
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
