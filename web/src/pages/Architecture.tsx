import React from 'react';
import { DataSourceBadge } from '../components/DataSourceBadge';

export const Architecture: React.FC = () => {
  const services = [
    {
      id: 'edge',
      name: '⚡ edge (Container)',
      tag: 'Port 8001 · 0.5 CPU / 512 MB Capped',
      status: 'Active',
      color: '#38bdf8',
      desc: 'FastAPI + ONNX Runtime CPU. Evaluates causal 30-cycle rolling features, produces point RUL, conformal intervals, and Mahalanobis + CUSUM anomaly scores. Operates local SQLite outbox for offline resilience.',
      stack: ['Python 3.11', 'ONNX Runtime (CPU)', 'NumPy', 'SQLite3', 'FastAPI'],
    },
    {
      id: 'api',
      name: '☁️ api (Cloud Service)',
      tag: 'Port 8000 · FastAPI + PostgreSQL',
      status: 'Active',
      color: '#a855f7',
      desc: 'Ingests synced events with idempotent event_id deduplication. Distributes live SSE telemetry streams to connected portals, serves historical runs, model card, and generates signed PDF health reports.',
      stack: ['FastAPI', 'PostgreSQL', 'SQLAlchemy Async', 'Server-Sent Events', 'ReportLab'],
    },
    {
      id: 'sim',
      name: '🔄 simulator',
      tag: 'Replay Service',
      status: 'Active',
      color: '#22c55e',
      desc: 'Streams real NASA C-MAPSS FD001 run-to-failure cycles (Fast, Slow, Noisy). Supports real-time sensor fault injection (drift, spike, dropout) and speed scaling from 1× to 50×.',
      stack: ['Python AsyncIO', 'HTTPX', 'C-MAPSS Bundles'],
    },
    {
      id: 'web',
      name: '🌐 web (Evaluator Portal)',
      tag: 'Port 3000 · React + Vite + TypeScript',
      status: 'Active',
      color: '#f59e0b',
      desc: '8-page evaluator portal with interactive SVG turbofan digital twin, 90-second tour system, live edge proof meters, and standalone static fallback bundles.',
      stack: ['React 18', 'TypeScript (Strict)', 'Vite', 'Vanilla CSS Design System'],
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1250px', margin: '0 auto' }}>
      {/* Title */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
          <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc' }}>
            System Architecture &amp; Container Topology
          </h1>
          <DataSourceBadge source="live model" detail="4-Service Docker Compose Architecture" />
        </div>
        <p style={{ margin: 0, fontSize: '0.9rem', color: '#94a3b8' }}>
          Modular, edge-first distributed architecture decoupling safety-critical inference from ground station reporting.
        </p>
      </div>

      {/* Mermaid / Vector Diagram Representation */}
      <div
        style={{
          background: 'rgba(13, 20, 36, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
        }}
      >
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#f8fafc', alignSelf: 'flex-start' }}>
          Data Flow Topology
        </h3>

        {/* Vector Flow Diagram */}
        <div style={{ width: '100%', maxWidth: '850px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            {/* Box 1: Simulator */}
            <div
              style={{
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.4)',
                borderRadius: '10px',
                padding: '1rem',
                width: '180px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#22c55e' }}>Simulator</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>C-MAPSS Telemetry</div>
            </div>

            <div style={{ color: '#64748b', fontSize: '1.2rem', fontWeight: 800 }}>── Cycle POST ──▶</div>

            {/* Box 2: Edge Service */}
            <div
              style={{
                background: 'rgba(56, 189, 248, 0.1)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                borderRadius: '10px',
                padding: '1rem',
                width: '200px',
                textAlign: 'center',
                boxShadow: '0 0 16px rgba(56, 189, 248, 0.15)',
              }}
            >
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#38bdf8' }}>Edge Container</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>
                ONNX CPU · 0.5 CPU / 512 MB
              </div>
              <div style={{ fontSize: '0.68rem', color: '#f59e0b', marginTop: '2px' }}>
                + SQLite Outbox
              </div>
            </div>

            <div style={{ color: '#64748b', fontSize: '1.2rem', fontWeight: 800 }}>── Sync / Drain ──▶</div>

            {/* Box 3: Cloud API */}
            <div
              style={{
                background: 'rgba(168, 85, 247, 0.1)',
                border: '1px solid rgba(168, 85, 247, 0.4)',
                borderRadius: '10px',
                padding: '1rem',
                width: '180px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#c084fc' }}>Cloud API</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>FastAPI + PostgreSQL</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: '40px' }}>
            <div style={{ color: '#64748b', fontSize: '1.2rem', fontWeight: 800 }}>▼ SSE Fan-out Stream</div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div
              style={{
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                borderRadius: '10px',
                padding: '1rem',
                width: '240px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fbbf24' }}>Evaluator React Portal</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>
                SVG Twin · RUL Gauge · Model Card
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Service Containers Detailed Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {services.map((svc) => (
          <div
            key={svc.id}
            style={{
              background: 'rgba(17, 24, 39, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>{svc.name}</span>
                <span style={{ fontSize: '0.72rem', color: svc.color, display: 'block', fontWeight: 600, marginTop: '2px' }}>
                  {svc.tag}
                </span>
              </div>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: '#22c55e',
                  background: 'rgba(34, 197, 94, 0.15)',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '4px',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                }}
              >
                ● {svc.status}
              </span>
            </div>

            <p style={{ margin: 0, fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.5 }}>
              {svc.desc}
            </p>

            <div style={{ marginTop: 'auto', display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
              {svc.stack.map((item, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: '0.7rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: '#94a3b8',
                    padding: '0.15rem 0.45rem',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
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
