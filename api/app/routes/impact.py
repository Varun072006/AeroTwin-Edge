"""routes/impact.py — Impact calculator with explicit assumption fields."""
from fastapi import APIRouter

router = APIRouter()

@router.get("/impact")
async def get_impact():
    """
    IMPORTANT: All improvement figures are ASSUMPTIONS.
    Every field has a visible source or label — never present as measured results.
    """
    return {
        "fleet_size": 50,
        "cost_per_unscheduled_event_usd": 500000,
        "reduction_pct_lo": 20,
        "reduction_pct_hi": 30,
        "events_per_engine_per_year": 2,
        "source": "Industry estimate — adjust to fleet operator data",
        "assumptions": [
            "Reduction range 20–30% is an industry estimate, NOT a measured result from this system",
            "Cost per event is illustrative — replace with fleet operator actual data",
            "Alert lead time is derived from C-MAPSS test engines; real-world performance requires validation",
            "Annual events per engine assumes current (no-PdM) baseline",
        ],
        "formula": "savings = fleet_size × events_per_engine_per_year × cost_per_event × (reduction_pct / 100)",
        "data_source_label": "assumption",
    }
