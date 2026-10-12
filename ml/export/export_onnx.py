"""
export_onnx.py — Export trained XGBoost model to ONNX format.

Requirements:
    pip install onnxmltools skl2onnx onnxruntime

The exported model must pass parity test (max abs diff < 1e-3).
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Tuple

import numpy as np
import xgboost as xgb

MODEL_DIR = Path(__file__).parent.parent / "models"


def export_to_onnx(
    model: xgb.XGBRegressor,
    n_features: int,
    output_path: Path | None = None,
) -> Path:
    """
    Export XGBoost regressor to ONNX format.
    
    Args:
        model: Trained XGBoost regressor
        n_features: Number of input features
        output_path: Target .onnx path (default: ml/models/rul_model.onnx)
    
    Returns:
        Path to saved ONNX file
    """
    try:
        from onnxmltools import convert_xgboost
        from onnxmltools.convert.common.data_types import FloatTensorType
    except ImportError:
        raise ImportError(
            "Install onnxmltools: pip install onnxmltools"
        )
    
    if output_path is None:
        output_path = MODEL_DIR / "rul_model.onnx"
    
    initial_types = [("input", FloatTensorType([None, n_features]))]
    onnx_model = convert_xgboost(model, initial_types=initial_types)
    
    with open(output_path, "wb") as f:
        f.write(onnx_model.SerializeToString())
    
    size_mb = output_path.stat().st_size / 1e6
    print(f"ONNX model saved: {output_path} ({size_mb:.2f} MB)")
    return output_path


def compute_parity(
    model: xgb.XGBRegressor,
    onnx_path: Path,
    X_test: np.ndarray,
    tolerance: float = 1e-3,
) -> dict:
    """
    Compare native XGBoost predictions vs ONNX Runtime predictions.
    
    Args:
        model: Native XGBoost model
        onnx_path: Path to ONNX model
        X_test: Test features (float32)
        tolerance: Maximum allowed absolute difference
    
    Returns:
        dict with max_abs_diff and passed (bool)
    
    Raises:
        AssertionError if parity check fails
    """
    import onnxruntime as ort
    
    # Native predictions
    native_preds = model.predict(X_test).astype(np.float32)
    
    # ONNX predictions
    session = ort.InferenceSession(
        str(onnx_path),
        providers=["CPUExecutionProvider"]  # CPU only — edge constraint
    )
    input_name = session.get_inputs()[0].name
    onnx_preds = session.run(None, {input_name: X_test.astype(np.float32)})[0].flatten()
    
    max_diff = float(np.max(np.abs(native_preds - onnx_preds)))
    passed = max_diff < tolerance
    
    print(f"ONNX parity check: max_abs_diff = {max_diff:.6f} (tolerance: {tolerance})")
    print(f"  Result: {'✅ PASSED' if passed else '❌ FAILED'}")
    
    if not passed:
        raise AssertionError(
            f"ONNX parity check FAILED: max_abs_diff={max_diff:.6f} > {tolerance}"
        )
    
    return {"max_abs_diff": max_diff, "tolerance": tolerance, "passed": passed}
