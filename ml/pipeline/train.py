"""
train.py — XGBoost model training, GroupKFold validation, conformal intervals,
NASA score, and Optuna hyperparameter optimisation.

Rules:
- GroupKFold by engine_id (NO row-level splitting)
- Report achieved RMSE, not literature numbers
- Seed: 42
"""
from __future__ import annotations

import json
import pickle
from pathlib import Path
from typing import Tuple

import numpy as np
import xgboost as xgb
from sklearn.model_selection import GroupKFold, cross_val_score
from sklearn.metrics import mean_squared_error

SEED = 42
MODEL_DIR = Path(__file__).parent.parent / "models"
MODEL_DIR.mkdir(exist_ok=True)


# ─── NASA ASYMMETRIC SCORE ────────────────────────────────────────────────────

def nasa_score(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """
    NASA asymmetric scoring function from the PHM 2008 challenge.
    Late predictions (y_pred < y_true) are penalised more heavily.
    
    s_i = exp(-d/13) - 1  if d < 0  (early prediction)
    s_i = exp(d/10) - 1   if d >= 0 (late prediction)
    where d = y_pred - y_true
    """
    d = y_pred - y_true
    scores = np.where(d < 0, np.exp(-d / 13) - 1, np.exp(d / 10) - 1)
    return float(np.sum(scores))


# ─── XGBOOST TRAINING ─────────────────────────────────────────────────────────

def get_default_params() -> dict:
    """Default XGBoost parameters (good baseline for C-MAPSS FD001)."""
    return {
        "n_estimators": 500,
        "max_depth": 6,
        "learning_rate": 0.05,
        "subsample": 0.8,
        "colsample_bytree": 0.8,
        "min_child_weight": 3,
        "reg_alpha": 0.1,
        "reg_lambda": 1.0,
        "objective": "reg:squarederror",
        "random_state": SEED,
        "n_jobs": -1,
        "tree_method": "hist",
    }


def cross_validate(
    X: np.ndarray,
    y: np.ndarray,
    groups: np.ndarray,
    params: dict | None = None,
    n_splits: int = 5,
) -> Tuple[float, float]:
    """
    GroupKFold cross-validation.
    
    Returns:
        (mean_rmse, std_rmse) across folds
    """
    if params is None:
        params = get_default_params()
    
    model = xgb.XGBRegressor(**params)
    gkf = GroupKFold(n_splits=n_splits)
    
    rmse_scores = []
    for fold, (train_idx, val_idx) in enumerate(gkf.split(X, y, groups)):
        X_tr, X_val = X[train_idx], X[val_idx]
        y_tr, y_val = y[train_idx], y[val_idx]
        
        model.fit(
            X_tr, y_tr,
            eval_set=[(X_val, y_val)],
            verbose=False,
        )
        y_pred = model.predict(X_val).clip(0, 125)
        rmse = mean_squared_error(y_val, y_pred, squared=False)
        rmse_scores.append(rmse)
        print(f"  Fold {fold+1}: RMSE = {rmse:.2f}")
    
    return float(np.mean(rmse_scores)), float(np.std(rmse_scores))


def train_final_model(
    X_train: np.ndarray,
    y_train: np.ndarray,
    params: dict | None = None,
) -> xgb.XGBRegressor:
    """Train XGBoost on the full training set."""
    if params is None:
        params = get_default_params()
    
    model = xgb.XGBRegressor(**params)
    model.fit(X_train, y_train, verbose=False)
    return model


def evaluate_test(
    model: xgb.XGBRegressor,
    X_test: np.ndarray,
    y_test: np.ndarray,
) -> dict:
    """
    Evaluate on official NASA test set.
    Returns dict with: rmse, nasa_score, y_pred
    """
    y_pred = model.predict(X_test).clip(0, 125)
    rmse = float(mean_squared_error(y_test, y_pred, squared=False))
    score = nasa_score(y_test, y_pred)
    
    print(f"\n{'='*40}")
    print(f"Test RMSE:   {rmse:.4f} cycles")
    print(f"NASA Score:  {score:.2f}")
    print(f"{'='*40}\n")
    
    return {"rmse": rmse, "nasa_score": score, "y_pred": y_pred}


# ─── OPTUNA HYPERPARAMETER SEARCH ─────────────────────────────────────────────

def tune_hyperparameters(
    X_train: np.ndarray,
    y_train: np.ndarray,
    groups_train: np.ndarray,
    n_trials: int = 50,
) -> dict:
    """
    Optuna hyperparameter search with GroupKFold objective.
    Only runs if optuna is installed.
    """
    try:
        import optuna
        optuna.logging.set_verbosity(optuna.logging.WARNING)
    except ImportError:
        print("Optuna not installed — using default parameters.")
        return get_default_params()
    
    def objective(trial: optuna.Trial) -> float:
        params = {
            "n_estimators": trial.suggest_int("n_estimators", 200, 1000),
            "max_depth": trial.suggest_int("max_depth", 4, 10),
            "learning_rate": trial.suggest_float("learning_rate", 0.01, 0.2, log=True),
            "subsample": trial.suggest_float("subsample", 0.6, 1.0),
            "colsample_bytree": trial.suggest_float("colsample_bytree", 0.6, 1.0),
            "min_child_weight": trial.suggest_int("min_child_weight", 1, 10),
            "reg_alpha": trial.suggest_float("reg_alpha", 1e-4, 1.0, log=True),
            "reg_lambda": trial.suggest_float("reg_lambda", 1e-4, 10.0, log=True),
            "objective": "reg:squarederror",
            "random_state": SEED,
            "n_jobs": -1,
            "tree_method": "hist",
        }
        mean_rmse, _ = cross_validate(X_train, y_train, groups_train, params, n_splits=3)
        return mean_rmse
    
    study = optuna.create_study(direction="minimize", sampler=optuna.samplers.TPESampler(seed=SEED))
    study.optimize(objective, n_trials=n_trials, show_progress_bar=True)
    
    best = study.best_params
    best.update({"objective": "reg:squarederror", "random_state": SEED, "n_jobs": -1, "tree_method": "hist"})
    print(f"Best params: {best}")
    print(f"Best CV RMSE: {study.best_value:.4f}")
    return best


# ─── CONFORMAL PREDICTION INTERVALS ───────────────────────────────────────────

def fit_conformal_intervals(
    model: xgb.XGBRegressor,
    X_cal: np.ndarray,
    y_cal: np.ndarray,
    coverage: float = 0.80,
) -> Tuple[float, float]:
    """
    Split-conformal prediction intervals.
    
    Calibration set should be a held-out set of training engines
    (last 20% by engine_id — set aside BEFORE training).
    
    Returns:
        (q_lo, q_hi): quantile offsets to add/subtract from point prediction
    """
    y_pred_cal = model.predict(X_cal).clip(0, 125)
    residuals = y_cal - y_pred_cal  # positive = we underestimated
    
    alpha = 1 - coverage
    q_lo = float(np.quantile(residuals, alpha / 2))     # e.g. 10th percentile
    q_hi = float(np.quantile(residuals, 1 - alpha / 2)) # e.g. 90th percentile
    
    print(f"Conformal offsets: q_lo={q_lo:.2f}, q_hi={q_hi:.2f}")
    return q_lo, q_hi


def verify_coverage(
    model: xgb.XGBRegressor,
    X_test: np.ndarray,
    y_test: np.ndarray,
    q_lo: float,
    q_hi: float,
) -> float:
    """Verify empirical interval coverage on test set. Must be reported in model card."""
    y_pred = model.predict(X_test).clip(0, 125)
    lower = y_pred + q_lo
    upper = y_pred + q_hi
    covered = np.mean((y_test >= lower) & (y_test <= upper))
    print(f"Empirical interval coverage: {covered:.3f} (nominal: 0.80)")
    return float(covered)


def save_models(
    model: xgb.XGBRegressor,
    scaler,
    conformal_offsets: Tuple[float, float],
    mahal_baselines: dict,
) -> None:
    """Save all model artifacts to ml/models/."""
    model.save_model(str(MODEL_DIR / "rul_model.json"))
    
    with open(MODEL_DIR / "scaler.pkl", "wb") as f:
        pickle.dump(scaler, f)
    
    with open(MODEL_DIR / "conformal_offsets.pkl", "wb") as f:
        pickle.dump({"q_lo": conformal_offsets[0], "q_hi": conformal_offsets[1]}, f)
    
    with open(MODEL_DIR / "mahal_baselines.pkl", "wb") as f:
        pickle.dump(mahal_baselines, f)
    
    print(f"Models saved to {MODEL_DIR}")
