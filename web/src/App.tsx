import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { TourOverlay } from './components/TourOverlay';
import { EvaluatorLanding } from './pages/EvaluatorLanding';
import { LiveDigitalTwin } from './pages/LiveDigitalTwin';
import { ScenarioReplay } from './pages/ScenarioReplay';
import { EdgeProof } from './pages/EdgeProof';
import { Explainability } from './pages/Explainability';
import { ModelCard } from './pages/ModelCard';
import { ImpactCalculator } from './pages/ImpactCalculator';
import { Architecture } from './pages/Architecture';

export const App: React.FC = () => {
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isOffline] = useState(false);

  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#070b14', color: '#f8fafc' }}>
        {/* Navigation Bar */}
        <Navbar
          onStartTour={() => setIsTourOpen(true)}
          isOffline={isOffline}
          isFallback={true}
        />

        {/* Main Content Area */}
        <main style={{ flex: 1, padding: '2rem 1.5rem', width: '100%', boxSizing: 'border-box' }}>
          <Routes>
            <Route path="/" element={<EvaluatorLanding onStartTour={() => setIsTourOpen(true)} />} />
            <Route path="/twin" element={<LiveDigitalTwin />} />
            <Route path="/scenarios" element={<ScenarioReplay />} />
            <Route path="/edge-proof" element={<EdgeProof />} />
            <Route path="/explainability" element={<Explainability />} />
            <Route path="/model-card" element={<ModelCard />} />
            <Route path="/impact" element={<ImpactCalculator />} />
            <Route path="/architecture" element={<Architecture />} />
            <Route path="*" element={<EvaluatorLanding onStartTour={() => setIsTourOpen(true)} />} />
          </Routes>
        </main>

        {/* 90-Second Spotlight Tour Modal */}
        <TourOverlay isOpen={isTourOpen} onClose={() => setIsTourOpen(false)} />

        {/* Global Footer */}
        <footer
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '1.5rem',
            textAlign: 'center',
            fontSize: '0.8rem',
            color: '#64748b',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
            backgroundColor: '#05080f',
          }}
        >
          <div>
            <strong>AeroTwin Edge</strong> · Built for <strong>Tata Innovent-27</strong> (Edge AI Category)
          </div>
          <div>
            Dataset: NASA C-MAPSS Simulated Turbofan (Prognostics Data Repository) · CPU-Only ONNX Runtime Simulation
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
};

export default App;
