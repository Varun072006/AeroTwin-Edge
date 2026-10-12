"""
preprocess.py — C-MAPSS FD001 data loading and feature engineering.

Rules (from RULES.md):
- Sensor selection: verify by variance, do not trust a fixed list
- Rolling features must be CAUSAL (no future leakage)
- Min-max normalisation fit on TRAIN only
- RUL target: piecewise-linear, clipped at 125 cycles

C-MAPSS column layout (0-indexed):
  0: engine_id
  1: cycle
  2-4: operational settings (3 cols)
  5-26: sensor measurements s1–s21 (21 cols, mapped to indices 5..25)
"""
from __future__ import annotations

import hashlib
import urllib.request
from pathlib import Path
from typing import Tuple

import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler

# ─── CONSTANTS ────────────────────────────────────────────────────────────────

SEED = 42
RUL_CLIP = 125  # Standard piecewise-linear clipping (stated in model card as ASSUMPTION)

# Standard C-MAPSS column names
_COL_ENGINE = "engine_id"
_COL_CYCLE = "cycle"
_SETTING_COLS = ["op_set_1", "op_set_2", "op_set_3"]
_SENSOR_COLS = [f"s{i}" for i in range(1, 22)]  # s1..s21

# Variance threshold for sensor selection
VARIANCE_THRESHOLD = 0.01

# Rolling feature windows (causal — no future leakage)
ROLLING_WINDOWS = [5, 10, 30]

# C-MAPSS FD001 data URLs (NASA Prognostics Center)
CMAPSS_BASE_URL = "https://ti.arc.nasa.gov/c/6/"
# Note: NASA data must be downloaded manually or via the data/download.py script
# Store in ml/data/raw/CMAPSSData/

DATA_DIR = Path(__file__).parent.parent / "data" / "raw" / "CMAPSSData"


def load_raw(split: str = "train", fd: str = "FD001") -> pd.DataFrame:
    """
    Load raw C-MAPSS data.
    
    Args:
        split: "train" or "test"
        fd: Dataset ID, e.g. "FD001" or "FD003"
    
    Returns:
        DataFrame with engine_id, cycle, op_settings, s1..s21
    """
    filepath = DATA_DIR / f"{split}_{fd}.txt"
    if not filepath.exists():
        raise FileNotFoundError(
            f"C-MAPSS data not found at {filepath}. "
            f"Run ml/data/download.py first."
        )
    
    all_cols = [_COL_ENGINE, _COL_CYCLE] + _SETTING_COLS + _SENSOR_COLS
    df = pd.read_csv(filepath, sep=r"\s+", header=None, names=all_cols)
    df[_COL_ENGINE] = df[_COL_ENGINE].astype(int)
    df[_COL_CYCLE] = df[_COL_CYCLE].astype(int)
    return df


def load_rul_labels(fd: str = "FD001") -> pd.Series:
    """Load ground-truth RUL labels for the test set."""
    filepath = DATA_DIR / f"RUL_{fd}.txt"
    rul = pd.read_csv(filepath, header=None, names=["rul"])
    return rul["rul"]


def select_sensors(df_train: pd.DataFrame, threshold: float = VARIANCE_THRESHOLD) -> list[str]:
    """
    Select sensors with variance > threshold on training data.
    Verifies result against expected retained set for FD001.
    
    Returns:
        List of retained sensor column names.
    """
    sensor_vars = df_train[_SENSOR_COLS].var()
    retained = [s for s in _SENSOR_COLS if sensor_vars[s] > threshold]
    
    # Expected for FD001 (cross-check — do not blindly trust)
    expected = ["s2", "s3", "s4", "s7", "s8", "s9", "s11", "s12",
                "s13", "s14", "s15", "s17", "s20", "s21"]
    
    if set(retained) != set(expected):
        print(f"WARNING: Variance-based selection differs from expected.")
        print(f"  Variance-selected: {sorted(retained)}")
        print(f"  Expected:          {sorted(expected)}")
        print(f"  Using variance-selected (source of truth).")
    
    return sorted(retained)


def compute_rul_labels(df_train: pd.DataFrame) -> pd.DataFrame:
    """Add piecewise-linear RUL column to training DataFrame."""
    max_cycles = df_train.groupby(_COL_ENGINE)[_COL_CYCLE].transform("max")
    df_train = df_train.copy()
    df_train["rul"] = (max_cycles - df_train[_COL_CYCLE]).clip(upper=RUL_CLIP)
    return df_train


def add_rolling_features(df: pd.DataFrame, sensors: list[str]) -> pd.DataFrame:
    """
    Add CAUSAL rolling mean, std, and slope for each sensor over each window.
    
    CRITICAL: Uses min_periods=1 and no shift, so features at row t
    only use data from rows 0..t (no future leakage).
    """
    df = df.copy()
    for sensor in sensors:
        for window in ROLLING_WINDOWS:
            grp = df.groupby(_COL_ENGINE)[sensor]
            df[f"{sensor}_mean{window}"] = grp.transform(
                lambda x: x.rolling(window, min_periods=1).mean()
            )
            df[f"{sensor}_std{window}"] = grp.transform(
                lambda x: x.rolling(window, min_periods=1).std().fillna(0)
            )
            # Slope: linear regression coefficient over the window (causal)
            df[f"{sensor}_slope{window}"] = grp.transform(
                lambda x: x.rolling(window, min_periods=2).apply(
                    lambda v: np.polyfit(range(len(v)), v, 1)[0] if len(v) >= 2 else 0.0,
                    raw=True
                ).fillna(0)
            )
    return df


def add_cycle_index(df: pd.DataFrame) -> pd.DataFrame:
    """Add normalised cycle index (0..1) per engine."""
    df = df.copy()
    max_cycles = df.groupby(_COL_ENGINE)[_COL_CYCLE].transform("max")
    df["cycle_index"] = df[_COL_CYCLE] / max_cycles
    return df


def build_feature_matrix(
    df: pd.DataFrame,
    sensors: list[str],
    scaler: MinMaxScaler | None = None,
    fit_scaler: bool = False,
) -> Tuple[np.ndarray, MinMaxScaler]:
    """
    Build normalised feature matrix from DataFrame.
    
    Args:
        df: DataFrame with sensor columns and rolling features added
        sensors: Base sensor list (used to identify all derived feature cols)
        scaler: Pre-fitted scaler (for test set). If None, fits a new one.
        fit_scaler: If True, fits scaler on this data (train set only).
    
    Returns:
        (X, scaler) where X is shape (n_samples, n_features)
    
    NOTE: Scaler must be fit on TRAIN only and applied to test.
    """
    feature_cols = sensors.copy()
    for sensor in sensors:
        for window in ROLLING_WINDOWS:
            feature_cols.extend([
                f"{sensor}_mean{window}",
                f"{sensor}_std{window}",
                f"{sensor}_slope{window}",
            ])
    feature_cols.append("cycle_index")
    
    X = df[feature_cols].values.astype(np.float32)
    
    if fit_scaler:
        scaler = MinMaxScaler()
        X = scaler.fit_transform(X)
    elif scaler is not None:
        X = scaler.transform(X)
    else:
        raise ValueError("Either fit_scaler=True or provide a scaler.")
    
    return X, scaler


def prepare_train_test(
    fd: str = "FD001",
) -> dict:
    """
    Full preprocessing pipeline for train and test sets.
    
    Returns dict with:
        X_train, y_train, groups_train (engine IDs)
        X_test, y_test
        sensors (retained sensor list)
        scaler (fitted on train)
        df_train, df_test (for replay bundle selection)
    """
    df_train_raw = load_raw("train", fd)
    df_test_raw = load_raw("test", fd)
    rul_test = load_rul_labels(fd)
    
    # Sensor selection (variance-based on train)
    sensors = select_sensors(df_train_raw)
    print(f"Retained sensors ({len(sensors)}): {sensors}")
    
    # RUL labels
    df_train = compute_rul_labels(df_train_raw)
    
    # Rolling features (causal)
    df_train = add_rolling_features(df_train, sensors)
    df_test = add_rolling_features(df_test_raw, sensors)
    
    # Cycle index
    df_train = add_cycle_index(df_train)
    df_test = add_cycle_index(df_test_raw)
    
    # Build feature matrices (scaler fit on train only)
    X_train, scaler = build_feature_matrix(df_train, sensors, fit_scaler=True)
    y_train = df_train["rul"].values.astype(np.float32)
    groups_train = df_train[_COL_ENGINE].values
    
    # Test: use last cycle per engine (standard C-MAPSS evaluation)
    df_test_last = df_test_raw.groupby(_COL_ENGINE).last().reset_index()
    df_test_last = add_rolling_features(df_test_last, sensors)
    df_test_last = add_cycle_index(df_test_last)
    X_test, _ = build_feature_matrix(df_test_last, sensors, scaler=scaler)
    y_test = rul_test.values.astype(np.float32)
    
    return {
        "X_train": X_train,
        "y_train": y_train,
        "groups_train": groups_train,
        "X_test": X_test,
        "y_test": y_test,
        "sensors": sensors,
        "scaler": scaler,
        "df_train": df_train,
        "df_test": df_test_raw,
    }
