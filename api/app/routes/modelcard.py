"""routes/modelcard.py"""
import json
from pathlib import Path
from fastapi import APIRouter, HTTPException

router = APIRouter()
_CARD_PATHS = [
    Path("/models/model_card.json"),
    Path(__file__).parent.parent.parent.parent / "ml" / "models" / "model_card.json",
]


@router.get("/modelcard")
async def get_model_card():
    for p in _CARD_PATHS:
        if p.exists():
            return json.loads(p.read_text())
    raise HTTPException(404, "model_card.json not found — run ml/pipeline/run_all.py first")
