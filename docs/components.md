# docs/components.md — Sensor-to-Component Mapping
# Source of truth for SHAP component attribution.
# ALL agents must reference this file. Do not hardcode mappings elsewhere.
#
# IMPORTANT: Verify sensor indices against C-MAPSS README before using.
# The mapping below follows the standard interpretation; cross-check with
# the dataset documentation at https://ti.arc.nasa.gov/c/6/

## C-MAPSS Retained Sensors (FD001)

| Column | Sensor ID | Physical Meaning | Component |
|--------|-----------|------------------|-----------|
| 5      | s2        | T24 — LPC outlet temperature (°R) | LPC |
| 6      | s3        | T30 — HPC outlet temperature (°R) | HPC |
| 7      | s4        | T50 — LPT outlet temperature (°R) | LPT |
| 10     | s7        | P30 — HPC outlet pressure (psia) | HPC |
| 11     | s8        | Nf — Physical fan speed (rpm) | Fan |
| 12     | s9        | Nc — Core speed (rpm) | Fan |
| 14     | s11       | Ps30 — Static HPC outlet pressure (psia) | HPC |
| 15     | s12       | phi — Fuel flow ratio (pps/psi) | Combustor |
| 16     | s13       | NRf — Corrected fan speed (rpm) | Fan |
| 17     | s14       | NRc — Corrected core speed (rpm) | LPC |
| 18     | s15       | BPR — Bypass ratio | Fan |
| 20     | s17       | htBleed — Bleed enthalpy | HPC |
| 23     | s20       | W31 — HPT coolant bleed (lbm/s) | HPT |
| 24     | s21       | W32 — LPT coolant bleed (lbm/s) | LPT |

## SHAP Grouping

```python
COMPONENT_SENSOR_MAP = {
    "Fan":       ["s8", "s9", "s13", "s15"],   # Nf, Nc, NRf, BPR
    "LPC":       ["s2", "s14"],                 # T24, NRc
    "HPC":       ["s3", "s7", "s11", "s17"],   # T30, P30, Ps30, htBleed
    "Combustor": ["s12"],                       # phi
    "HPT":       ["s20"],                       # W31
    "LPT":       ["s4", "s21"],                # T50, W32
}
```

## Attribution Method

- XGBoost SHAP values extracted via `pred_contribs=True`
- Feature set includes rolling means, stds, and slopes → map back to base sensor
- Grouping: sum absolute SHAP values for all features derived from each sensor
- Then sum by component according to the map above
- Label all component scores as **"indicative attribution"** in the UI
- These are NOT ground-truth component-level fault labels

## Labelling in UI

Every component health score must be accompanied by tooltip text:
> "Component scores are derived from SHAP feature attributions grouped by sensor-component mapping.
>  They are indicative of which system areas drive the prediction, not a direct fault diagnosis."
