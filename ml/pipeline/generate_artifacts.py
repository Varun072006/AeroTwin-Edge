"""generate_artifacts.py — Generates trained ONNX model, conformal offsets, and baselines."""
from __future__ import annotations

import json
import pickle
from pathlib import Path
import numpy as np
import xgboost as xgb
from onnxmltools import convert_xgboost
from onnxmltools.convert.common.data_types import FloatTensorType
import onnxruntime as ort

MODEL_DIR = Path(__file__).resolve().parent.parent / "models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)
BUNDLE_DIR = Path(__file__).resolve().parent.parent / "replay_bundles"

SENSOR_KEYS = ["s2", "s3", "s4", "s7", "s8", "s9", "s11", "s12", "s13", "s14", "s15", "s17", "s20", "s21"]

def build_features_for_series(sensors_dict: dict[str, list[float]], n_cycles: int) -> np.ndarray:
    """Build rolling features (141 features) for each cycle in a series."""
    sensor_matrix = np.column_stack([sensors_dict[k] for k in SENSOR_KEYS]) # (N, 14)
    all_features = []
    
    for i in range(n_cycles):
        curr_sensors = sensor_matrix[i].tolist()
        features = list(curr_sensors)
        
        # Windows
        for w in [5, 10, 30]:
            start_idx = max(0, i - w + 1)
            chunk = sensor_matrix[start_idx : i + 1]
            features.extend(chunk.mean(axis=0).tolist())
            features.extend(chunk.std(axis=0).tolist())
            if len(chunk) >= 2:
                slopes = [
                    float(np.polyfit(range(len(chunk)), chunk[:, col], 1)[0])
                    for col in range(chunk.shape[1])
                ]
            else:
                slopes = [0.0] * chunk.shape[1]
            features.extend(slopes)
            
        features.append((i + 1) / n_cycles) # normalized cycle index
        all_features.append(features)
        
    return np.array(all_features, dtype=np.float32)

def main():
    print("Generating model artifacts from C-MAPSS replay bundles...")
    bundle_files = ["fd001_fast.json", "fd001_slow.json", "fd001_noisy.json"]
    
    X_list = []
    y_list = []
    baselines = {}
    
    for fname in bundle_files:
        fpath = BUNDLE_DIR / fname
        if not fpath.exists():
            continue
        with open(fpath, "r") as f:
            b = json.load(f)
            
        eng_id = b["engine_id"]
        n = b["n_cycles"]
        X_eng = build_features_for_series(b["sensors"], n)
        y_eng = np.array(b["true_rul"], dtype=np.float32)
        
        X_list.append(X_eng)
        y_list.append(y_eng)
        
        # Fit Mahalanobis baseline on early 30 cycles
        early_data = np.column_stack([b["sensors"][k][:min(30, n)] for k in SENSOR_KEYS])
        mean_vec = np.mean(early_data, axis=0)
        cov_mat = np.cov(early_data, rowvar=False) + np.eye(len(SENSOR_KEYS)) * 1e-4
        inv_cov = np.linalg.pinv(cov_mat)
        baselines[eng_id] = {
            "mean": mean_vec,
            "inv_cov": inv_cov,
            "threshold": 3.5,
        }
        
    X_all = np.vstack(X_list)
    y_all = np.concatenate(y_list)
    n_features = X_all.shape[1]
    print(f"Dataset shape: {X_all.shape}, n_features={n_features}")
    
    # Train XGBoost regressor
    model = xgb.XGBRegressor(
        n_estimators=150,
        max_depth=5,
        learning_rate=0.08,
        subsample=0.85,
        colsample_bytree=0.85,
        random_state=42,
    )
    model.fit(X_all, y_all)
    
    # Export native model
    native_model_path = MODEL_DIR / "rul_model.json"
    model.save_model(str(native_model_path))
    print(f"Native XGBoost model saved: {native_model_path}")
    
    # Conformal calibration offsets
    preds = model.predict(X_all)
    residuals = y_all - preds
    q_lo = float(np.percentile(residuals, 10)) # 80% coverage lower quantile
    q_hi = float(np.percentile(residuals, 90)) # 80% coverage upper quantile
    conformal_path = MODEL_DIR / "conformal_offsets.pkl"
    with open(conformal_path, "wb") as f:
        pickle.dump({"q_lo": q_lo, "q_hi": q_hi}, f)
    print(f"Conformal offsets saved: {conformal_path} -> q_lo={q_lo:.2f}, q_hi={q_hi:.2f}")
    
    # Save Mahalanobis baselines
    mahal_path = MODEL_DIR / "mahal_baselines.pkl"
    with open(mahal_path, "wb") as f:
        pickle.dump(baselines, f)
    print(f"Mahalanobis baselines saved: {mahal_path}")
    
    # Convert to ONNX
    initial_types = [("input", FloatTensorType([None, n_features]))]
    onnx_model = convert_xgboost(model, initial_types=initial_types)
    onnx_path = MODEL_DIR / "rul_model.onnx"
    with open(onnx_path, "wb") as f:
        f.write(onnx_model.SerializeToString())
    print(f"ONNX model saved: {onnx_path} ({onnx_path.stat().st_size / 1e6:.2f} MB)")
    
    # Verify ONNX parity
    sess = ort.InferenceSession(str(onnx_path), providers=["CPUExecutionProvider"])
    input_name = sess.get_inputs()[0].name
    onnx_preds = sess.run(None, {input_name: X_all})[0].flatten()
    max_diff = float(np.max(np.abs(preds - onnx_preds)))
    print(f"ONNX vs Native parity check: max_abs_diff = {max_diff:.6e}")
    assert max_diff < 1e-3, f"Parity test failed: {max_diff} >= 1e-3"
    print("SUCCESS: Parity test passed!")

if __name__ == "__main__":
    main()
