"""
test_parity.py — Pytest: ONNX parity check.
This test MUST pass before any merge to main.

Run: pytest ml/export/test_parity.py -v
"""
import numpy as np
import pytest
from pathlib import Path

MODEL_DIR = Path(__file__).parent.parent / "models"
ONNX_PATH = MODEL_DIR / "rul_model.onnx"
TOLERANCE = 1e-3


@pytest.mark.skipif(
    not ONNX_PATH.exists(),
    reason="ONNX model not yet generated — run ml/pipeline/run_all.py first"
)
def test_onnx_parity():
    """
    CRITICAL TEST: Verify ONNX model produces same predictions as native XGBoost.
    Max absolute difference must be < 1e-3 on the full test set.
    """
    import xgboost as xgb
    import onnxruntime as ort
    
    # Load native model
    native_model = xgb.XGBRegressor()
    native_model.load_model(str(MODEL_DIR / "rul_model.json"))
    
    # Load test features (saved during training)
    X_test = np.load(str(MODEL_DIR / "X_test.npy"))
    
    # Native predictions
    native_preds = native_model.predict(X_test).astype(np.float32)
    
    # ONNX predictions (CPU only)
    session = ort.InferenceSession(
        str(ONNX_PATH),
        providers=["CPUExecutionProvider"]
    )
    input_name = session.get_inputs()[0].name
    onnx_preds = session.run(None, {input_name: X_test.astype(np.float32)})[0].flatten()
    
    max_diff = np.max(np.abs(native_preds - onnx_preds))
    
    assert max_diff < TOLERANCE, (
        f"ONNX parity FAILED: max_abs_diff={max_diff:.6f} exceeds tolerance={TOLERANCE}. "
        f"Re-export the ONNX model."
    )
    
    print(f"✅ ONNX parity: max_abs_diff={max_diff:.8f} < {TOLERANCE}")
