/**
 * types.ts — TypeScript domain interfaces for AeroTwin Edge portal.
 * Adheres to strict mode with zero 'any' types.
 */

export type HealthClass = 'HEALTHY' | 'WARNING' | 'CRITICAL';

export type DataSourceType = 'live model' | 'replay bundle' | 'assumption';

export interface TelemetrySensors {
  s2: number;
  s3: number;
  s4: number;
  s7: number;
  s8: number;
  s9: number;
  s11: number;
  s12: number;
  s13: number;
  s14: number;
  s15: number;
  s17: number;
  s20: number;
  s21: number;
  [key: string]: number;
}

export interface ShapComponents {
  Fan: number;
  LPC: number;
  HPC: number;
  Combustor: number;
  HPT: number;
  LPT: number;
  [key: string]: number;
}

export interface TelemetryEvent {
  event_id?: string;
  engine_id: string;
  cycle: number;
  sensors: TelemetrySensors;
  rul: number;
  rul_lo: number;
  rul_hi: number;
  anomaly_score: number;
  health_class: HealthClass;
  shap_by_component: ShapComponents;
  latency_ms: number;
  offline?: boolean;
}

export interface AlertItem {
  id: string;
  engine_id: string;
  cycle: number;
  severity: HealthClass;
  message: string;
  timestamp: string;
}

export interface ReplayBundle {
  engine_id: string;
  n_cycles: number;
  cycles: number[];
  sensors: Record<string, number[]>;
  true_rul: number[];
  pred_rul: number[];
  pred_rul_lo: number[];
  pred_rul_hi: number[];
  anomaly_score: number[];
  health_class: HealthClass[];
  shap_by_component: Record<string, number[]>;
  latency_ms: number[];
}

export interface ModelCardData {
  dataset: string;
  n_train_engines: number;
  n_test_engines: number;
  features: string[];
  validation_method: string;
  rmse_cv: number;
  rmse_test: number;
  nasa_score: number;
  interval_coverage_nominal: number;
  interval_coverage_empirical: number;
  model_size_mb: number;
  onnx_parity_max_diff: number;
  limitations: string[];
  component_map: Record<string, string[]>;
}

export interface EdgeMetrics {
  p50_latency_ms: number;
  p95_latency_ms: number;
  memory_mb: number;
  cpu_percent: number;
  queue_depth: number;
  model_size_mb: number;
  offline: boolean;
  total_predictions: number;
}

export interface SimulatorStatus {
  running: boolean;
  engine: 'fast' | 'slow' | 'noisy' | string | null;
  cycle: number;
  total?: number;
  speed: number;
}
