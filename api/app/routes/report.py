"""routes/report.py — PDF engine health report generation."""
from __future__ import annotations
import io
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..database import get_db
from ..models import Event, Alert

router = APIRouter()


@router.post("/report/{engine_id}")
async def generate_report(engine_id: str, db: AsyncSession = Depends(get_db)):
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib import colors
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer,
                                         Table, TableStyle, HRFlowable)
        from reportlab.lib.units import cm
    except ImportError:
        raise HTTPException(500, "reportlab not installed")

    # Fetch data
    events_q = select(Event).where(Event.engine_id == engine_id).order_by(Event.cycle)
    alerts_q = select(Alert).where(Alert.engine_id == engine_id).order_by(Alert.fired_at)
    events = (await db.execute(events_q)).scalars().all()
    alerts = (await db.execute(alerts_q)).scalars().all()

    if not events:
        raise HTTPException(404, f"No events found for engine {engine_id}")

    last = events[-1]
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, topMargin=2*cm, bottomMargin=2*cm,
                             leftMargin=2*cm, rightMargin=2*cm)
    styles = getSampleStyleSheet()
    story = []

    # Title
    story.append(Paragraph(f"Engine Health Report — {engine_id}", styles["Title"]))
    story.append(Paragraph(f"Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}", styles["Normal"]))
    story.append(HRFlowable(width="100%"))
    story.append(Spacer(1, 0.4*cm))

    # Summary
    hc_color = {"HEALTHY": "#22c55e", "WARNING": "#f59e0b", "CRITICAL": "#ef4444"}.get(last.health_class, "#888")
    story.append(Paragraph(f"<b>Current Health Status:</b> <font color='{hc_color}'>{last.health_class}</font>", styles["Normal"]))
    story.append(Paragraph(f"<b>Last Cycle:</b> {last.cycle}", styles["Normal"]))
    story.append(Paragraph(f"<b>RUL (point):</b> {last.rul:.0f} cycles", styles["Normal"]))
    story.append(Paragraph(f"<b>RUL (80% interval):</b> [{last.rul_lo:.0f}, {last.rul_hi:.0f}] cycles", styles["Normal"]))
    story.append(Paragraph(f"<b>Recommendation basis:</b> Conservative lower bound ({last.rul_lo:.0f} cycles)", styles["Normal"]))
    story.append(Spacer(1, 0.4*cm))

    # Alerts table
    story.append(Paragraph("<b>Alert History</b>", styles["Heading2"]))
    if alerts:
        tdata = [["Cycle", "Severity", "Message"]]
        for a in alerts:
            tdata.append([str(a.cycle), a.severity, a.message[:80]])
        t = Table(tdata, colWidths=[2*cm, 3*cm, 12*cm])
        t.setStyle(TableStyle([
            ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#1f2937")),
            ("TEXTCOLOR",  (0,0), (-1,0), colors.white),
            ("FONTNAME",   (0,0), (-1,0), "Helvetica-Bold"),
            ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.HexColor("#0f172a"), colors.HexColor("#1e293b")]),
            ("TEXTCOLOR",  (0,1), (-1,-1), colors.HexColor("#e2e8f0")),
            ("GRID", (0,0), (-1,-1), 0.5, colors.HexColor("#374151")),
        ]))
        story.append(t)
    else:
        story.append(Paragraph("No alerts recorded.", styles["Normal"]))

    story.append(Spacer(1, 0.4*cm))

    # Limitations footer
    story.append(HRFlowable(width="100%"))
    story.append(Paragraph(
        "<b>Limitations:</b> C-MAPSS is a simulated dataset; real-world transfer requires validation. "
        "Health class thresholds (Critical≤30, Warning≤80 cycles) are assumptions, not derived from failure data. "
        "Component attribution is indicative (SHAP-based), not ground-truth fault diagnosis.",
        ParagraphStyle("footer", parent=styles["Normal"], fontSize=8, textColor=colors.HexColor("#6b7280"))
    ))

    doc.build(story)
    buf.seek(0)
    return Response(
        content=buf.read(),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=report_{engine_id}.pdf"},
    )
