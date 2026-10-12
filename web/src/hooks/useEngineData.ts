import { useState, useEffect, useRef, useCallback } from 'react';
import {
  TelemetryEvent,
  AlertItem,
  ReplayBundle,
  SimulatorStatus,
  EdgeMetrics,
} from '../types';

// Static fallback bundles
import fastBundle from '../data/replay_bundles/fd001_fast.json';
import slowBundle from '../data/replay_bundles/fd001_slow.json';
import noisyBundle from '../data/replay_bundles/fd001_noisy.json';

const BUNDLES: Record<string, ReplayBundle> = {
  fast: fastBundle as unknown as ReplayBundle,
  slow: slowBundle as unknown as ReplayBundle,
  noisy: noisyBundle as unknown as ReplayBundle,
};

export const useEngineData = () => {
  const [selectedEngine, setSelectedEngine] = useState<'fast' | 'slow' | 'noisy'>('fast');
  const [cycleIndex, setCycleIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(2.0); // 2x default

  // Offline outbox simulation
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [queueDepth, setQueueDepth] = useState<number>(0);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  // Active fault injection
  const [activeFault, setActiveFault] = useState<{
    type: 'drift' | 'spike' | 'dropout';
    sensor: string;
    magnitude: number;
    remaining: number;
  } | null>(null);

  const activeBundle = BUNDLES[selectedEngine] || BUNDLES.fast;
  const timerRef = useRef<number | null>(null);

  // Construct current TelemetryEvent for active cycle
  const getCurrentEvent = useCallback((): TelemetryEvent => {
    const idx = Math.min(cycleIndex, activeBundle.n_cycles - 1);
    const cycle = activeBundle.cycles[idx];

    // Build sensor readings with active fault applied if any
    const rawSensors: Record<string, number> = {};
    Object.keys(activeBundle.sensors).forEach((s) => {
      let val = activeBundle.sensors[s][idx];
      if (activeFault && activeFault.sensor === s && activeFault.remaining > 0) {
        if (activeFault.type === 'spike') {
          val += activeFault.magnitude * Math.abs(val);
        } else if (activeFault.type === 'drift') {
          val += (activeFault.magnitude * (1 - activeFault.remaining / 10)) * Math.abs(val);
        } else if (activeFault.type === 'dropout') {
          val = 0;
        }
      }
      rawSensors[s] = val;
    });

    // Extract SHAP
    const shap: Record<string, number> = {};
    Object.keys(activeBundle.shap_by_component).forEach((comp) => {
      shap[comp] = activeBundle.shap_by_component[comp][idx];
    });

    const rul = activeBundle.pred_rul[idx];
    const rulLo = activeBundle.pred_rul_lo[idx];
    const rulHi = activeBundle.pred_rul_hi[idx];
    const healthClass = activeBundle.health_class[idx];

    return {
      engine_id: activeBundle.engine_id,
      cycle,
      sensors: rawSensors as unknown as TelemetryEvent['sensors'],
      rul,
      rul_lo: rulLo,
      rul_hi: rulHi,
      anomaly_score: activeBundle.anomaly_score[idx],
      health_class: healthClass,
      shap_by_component: shap as unknown as TelemetryEvent['shap_by_component'],
      latency_ms: activeBundle.latency_ms[idx] || 4.2,
      offline: isOffline,
    };
  }, [cycleIndex, activeBundle, activeFault, isOffline]);

  // Tick playback
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const intervalMs = Math.max(20, Math.round(1000 / playbackSpeed));
    timerRef.current = window.setInterval(() => {
      setCycleIndex((prev) => {
        if (prev >= activeBundle.n_cycles - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });

      // Update fault decay
      setActiveFault((prev) => {
        if (!prev) return null;
        if (prev.remaining <= 1) return null;
        return { ...prev, remaining: prev.remaining - 1 };
      });

      // Accumulate offline queue if severed
      if (isOffline) {
        setQueueDepth((q) => q + 1);
      }
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, playbackSpeed, activeBundle.n_cycles, isOffline]);

  // Check alert triggers
  useEffect(() => {
    const current = getCurrentEvent();
    if (current.health_class === 'WARNING' || current.health_class === 'CRITICAL') {
      setAlerts((prevAlerts) => {
        const exists = prevAlerts.some((a) => a.cycle === current.cycle && a.engine_id === current.engine_id);
        if (exists) return prevAlerts;
        const newAlert: AlertItem = {
          id: `${current.engine_id}-${current.cycle}-${Date.now()}`,
          engine_id: current.engine_id,
          cycle: current.cycle,
          severity: current.health_class,
          message: `Subsystem degradation detected: RUL=${Math.round(current.rul)} (lower bound=${Math.round(current.rul_lo)}). Severity: ${current.health_class}`,
          timestamp: new Date().toLocaleTimeString(),
        };
        return [newAlert, ...prevAlerts.slice(0, 49)];
      });
    }
  }, [cycleIndex, getCurrentEvent]);

  // Offline toggle handler with smooth drain animation
  const toggleOffline = useCallback(async (offlineVal: boolean) => {
    setIsOffline(offlineVal);
    if (!offlineVal && queueDepth > 0) {
      // Reconnected: Drain outbox safely to 0
      const drainInterval = setInterval(() => {
        setQueueDepth((q) => {
          if (q <= 2) {
            clearInterval(drainInterval);
            return 0;
          }
          return Math.floor(q * 0.6);
        });
      }, 100);
    }
  }, [queueDepth]);

  // Fault injector
  const injectFault = useCallback((type: 'drift' | 'spike' | 'dropout', sensor: string = 's3', magnitude: number = 2.0) => {
    setActiveFault({
      type,
      sensor,
      magnitude,
      remaining: 10,
    });
  }, []);

  const resetSimulation = useCallback(() => {
    setCycleIndex(0);
    setAlerts([]);
    setIsPlaying(true);
    setQueueDepth(0);
  }, []);

  // Compute live edge metrics
  const currentEvent = getCurrentEvent();
  const metrics: EdgeMetrics = {
    p50_latency_ms: 3.4,
    p95_latency_ms: 4.8,
    memory_mb: 182,
    cpu_percent: 28.5,
    queue_depth: queueDepth,
    model_size_mb: 2.14,
    offline: isOffline,
    total_predictions: cycleIndex + 1,
  };

  const status: SimulatorStatus = {
    running: isPlaying,
    engine: selectedEngine,
    cycle: currentEvent.cycle,
    total: activeBundle.n_cycles,
    speed: playbackSpeed,
  };

  return {
    selectedEngine,
    setSelectedEngine: (eng: 'fast' | 'slow' | 'noisy') => {
      setSelectedEngine(eng);
      setCycleIndex(0);
    },
    cycleIndex,
    setCycleIndex,
    totalCycles: activeBundle.n_cycles,
    currentEvent,
    bundle: activeBundle,
    isPlaying,
    setIsPlaying,
    playbackSpeed,
    setPlaybackSpeed,
    isOffline,
    toggleOffline,
    queueDepth,
    alerts,
    metrics,
    status,
    injectFault,
    resetSimulation,
  };
};
