import React from 'react';
import { DataSourceBadge } from '../components/DataSourceBadge';

export const Architecture: React.FC = () => {
  const services = [
    {
      id: 'edge',
      name: '⚡ edge (Container)',
      tag: 'Port 8001 · 0.5 CPU / 512 MB Capped',
      status: 'Active',
      color: '#0284c7',
      desc: 'FastAPI + ONNX Runtime CPU. Evaluates causal 30-cycle rolling features, produces point RUL, conformal intervals, and Mahalanobis + CUSUM anomaly scores. Operates local SQLite outbox for offline resilience.',
      stack: ['Python 3.11', 'ONNX Runtime (CPU)', 'NumPy', 'SQLite3', 'FastAPI'],
    },
    {
      id: 'api',
      name: '☁️ api (Cloud Service)',
      tag: 'Port 8000 · FastAPI + PostgreSQL',
      status: 'Active',
      color: '#7c3aed',
      desc: 'Ingests synced events with idempotent event_id deduplication. Distributes live SSE telemetry streams to connected portals, serves historical runs, model card, and generates signed PDF health reports.',
      stack: ['FastAPI', 'PostgreSQL', 'SQLAlchemy Async', 'Server-Sent Events', 'ReportLab'],
    },
    {
      id: 'sim',
      name: '🔄 simulator',
      tag: 'Replay Service',
      status: 'Active',
      color: '#047857',
      desc: 'Streams real NASA C-MAPSS FD001 run-to-failure cycles (Fast, Slow, Noisy). Supports real-time sensor fault injection (drift, spike, dropout) and speed scaling from 1× to 50×.',
      stack: ['Python AsyncIO', 'HTTPX', 'C-MAPSS Bundles'],
    },
    {
      id: 'web',
      name: '🌐 web (Evaluator Portal)',
      tag: 'Port 3000 · React + Vite + TypeScript',
      status: 'Active',
      color: '#b45309',
      desc: '8-page evaluator portal with interactive SVG turbofan digital twin, 90-second tour system, live edge proof meters, and standalone static fallback bundles.',
      stack: ['React 18', 'TypeScript (Strict)', 'Vite', 'Vanilla CSS Design System'],
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Title */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
          <h1 style={{ margin: 0, fontSize: '1.65rem', fontWeight: 800, color: '#0f172a' }}>
            System Architecture &amp; Container Topology
          </h1>
          <DataSourceBadge source="live model" detail="4-Service Docker Compose Architecture" />
        </div>
        <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b' }}>
          Modular, edge-first distributed architecture decoupling safety-critical inference from ground station reporting.
        </p>
      </div>

      {/* Vector Diagram Representation */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
          boxShadow: '0 2px 8px -2px rgba(15, 23, 42, 0.05)',
        }}
      >
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a', alignSelf: 'flex-start' }}>
          CONTAINER TOPOLOGY &amp; DATA DRAIN FLOW
        </h3>

        {/* Vector Flow Diagram */}
        <div style={{ width: '100%', maxWidth: '880px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            {/* Box 1: Simulator */}
            <div
              style={{
                background: '#f0fdf4',
                border: '1.5px solid #a7f3d0',
                borderRadius: '10px',
                padding: '1.1rem',
                width: '190px',
                textAlign: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#047857' }}>Simulator</div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>C-MAPSS Telemetry</div>
            </div>

            <div style={{ color: '#0284c7', fontSize: '0.85rem', fontWeight: 700, fontFamily: 'monospace' }}>
              ── Cycle POST ──▶
            </div>

            {/* Box 2: Edge Service */}
            <div
              style={{
                background: '#f0f9ff',
                border: '1.5px solid #bae6fd',
                borderRadius: '10px',
                padding: '1.1rem',
                width: '210px',
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.12)',
              }}
            >
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0284c7' }}>Edge Container</div>
              <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '4px', fontWeight: 600 }}>
                ONNX CPU · 0.5 CPU / 512 MB
              </div>
              <div style={{ fontSize: '0.68rem', color: '#b45309', marginTop: '2px', fontWeight: 700 }}>
                + SQLite Store-and-Forward
              </div>
            </div>

            <div style={{ color: '#7c3aed', fontSize: '0.85rem', fontWeight: 700, fontFamily: 'monospace' }}>
              ── Sync / Drain ──▶
            </div>

            {/* Box 3: Cloud API */}
            <div
              style={{
                background: '#f5f3ff',
                border: '1.5px solid #ddd6fe',
                borderRadius: '10px',
                padding: '1.1rem',
                width: '190px',
                textAlign: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#7c3aed' }}>Cloud API</div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>FastAPI + PostgreSQL</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: '50px' }}>
            <div style={{ color: '#b45309', fontSize: '0.85rem', fontWeight: 700, fontFamily: 'monospace' }}>
              ▼ SSE Fan-out Stream
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div
              style={{
                background: '#fffbeb',
                border: '1.5px solid #fde68a',
                borderRadius: '10px',
                padding: '1.1rem',
                width: '240px',
                textAlign: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#b45309' }}>Evaluator React Portal</div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
                Digital Twin · Health Monitor · ROI
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Service Containers Detailed Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        {services.map((svc) => (
          <div
            key={svc.id}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1.35rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>{svc.name}</span>
                <span style={{ fontSize: '0.72rem', color: svc.color, display: 'block', fontWeight: 700, marginTop: '2px' }}>
                  {svc.tag}
                </span>
              </div>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: '#047857',
                  background: '#ecfdf5',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '4px',
                  border: '1px solid #a7f3d0',
                }}
              >
                ● {svc.status}
              </span>
            </div>

            <p style={{ margin: 0, fontSize: '0.8rem', color: '#475569', lineHeight: 1.5 }}>
              {svc.desc}
            </p>

            <div style={{ marginTop: 'auto', display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
              {svc.stack.map((item, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: '0.68rem',
                    background: '#f1f5f9',
                    color: '#475569',
                    padding: '0.15rem 0.45rem',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    fontWeight: 600,
                  }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
