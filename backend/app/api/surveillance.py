from typing import Optional, List
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.session import get_db
from app.models.models import DiseaseReport
from app.analytics.outbreak_detection import detect_hotspots, detect_potential_outbreaks

router = APIRouter(tags=["Regional Disease Surveillance & Hotspots"])

@router.get("/heatmap")
def get_heatmap_data(
    crop: Optional[str] = None,
    disease: Optional[str] = None,
    severity: Optional[str] = None,
    district: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Returns lightweight coordinates and intensity weights for Leaflet.heat map.
    Intensity weighting: Severe=1.0, Moderate=0.7, Mild=0.4, Healthy=0.1
    """
    q = db.query(
        DiseaseReport.latitude,
        DiseaseReport.longitude,
        DiseaseReport.severity,
        DiseaseReport.crop_name,
        DiseaseReport.disease_name
    )
    if crop and crop != "all":
        q = q.filter(DiseaseReport.crop_name.ilike(f"%{crop}%"))
    if disease and disease != "all":
        q = q.filter(DiseaseReport.disease_name.ilike(f"%{disease}%"))
    if severity and severity != "all":
        q = q.filter(DiseaseReport.severity.ilike(f"%{severity}%"))
    if district and district != "all":
        q = q.filter(DiseaseReport.district.ilike(f"%{district}%"))

    records = q.all()
    points = []
    for r in records:
        sev = (r.severity or "").lower()
        if "severe" in sev:
            w = 1.0
        elif "moderate" in sev:
            w = 0.7
        elif "mild" in sev:
            w = 0.4
        else:
            w = 0.15
        points.append([r.latitude, r.longitude, w])

    return {
        "count": len(points),
        "heatmap_points": points
    }

@router.get("/hotspots")
def get_hotspot_clusters(
    eps_km: float = 15.0,
    min_samples: int = 5,
    db: Session = Depends(get_db)
):
    """
    Identifies geographic clusters using DBSCAN algorithm.
    Hotspot = high concentration of disease reports in a geographical area.
    """
    reports = db.query(DiseaseReport).all()
    reports_dict = [
        {
            "id": r.id,
            "latitude": r.latitude,
            "longitude": r.longitude,
            "crop_name": r.crop_name,
            "disease_name": r.disease_name,
            "severity": r.severity,
            "district": r.district,
            "village": r.village,
            "created_at": r.created_at
        }
        for r in reports
    ]

    hotspots = detect_hotspots(reports_dict, eps_km=eps_km, min_samples=min_samples)
    return {
        "total_hotspots": len(hotspots),
        "hotspots": hotspots,
        "definition": "Hotspot = high concentration of disease reports in a geographical area."
    }

@router.get("/outbreaks")
def get_potential_outbreaks(
    days_window: int = 7,
    db: Session = Depends(get_db)
):
    """
    Monitors case count acceleration over time to flag potential outbreak risk.
    Clearly presented as AI-assisted early warning indicator (never confirmed outbreak).
    """
    reports = db.query(DiseaseReport).all()
    reports_dict = [
        {
            "id": r.id,
            "latitude": r.latitude,
            "longitude": r.longitude,
            "crop_name": r.crop_name,
            "disease_name": r.disease_name,
            "district": r.district,
            "created_at": r.created_at
        }
        for r in reports
    ]

    outbreaks = detect_potential_outbreaks(reports_dict, days_window=days_window)
    return {
        "outbreak_alerts_count": len(outbreaks),
        "alerts": outbreaks,
        "disclaimer": "AI-assisted risk indicator. Never claim scientific certainty or confirmed outbreak without agricultural field validation."
    }

@router.get("/statistics")
def get_surveillance_statistics(db: Session = Depends(get_db)):
    """
    Provides aggregated analytics for Agricultural Officer & Admin dashboards:
    Total reports, active cases, pending verification, breakdowns by crop, disease, severity, and time.
    """
    total_reports = db.query(DiseaseReport).count()
    
    # Active cases (within last 14 days)
    two_weeks_ago = datetime.utcnow() - timedelta(days=14)
    active_cases = db.query(DiseaseReport).filter(DiseaseReport.created_at >= two_weeks_ago).count()
    
    pending_count = db.query(DiseaseReport).filter(DiseaseReport.status == "pending").count()
    verified_count = db.query(DiseaseReport).filter(DiseaseReport.status == "verified").count()

    # Disease breakdown
    disease_counts = (
        db.query(DiseaseReport.disease_name, func.count(DiseaseReport.id))
        .group_by(DiseaseReport.disease_name)
        .order_by(func.count(DiseaseReport.id).desc())
        .limit(6)
        .all()
    )
    disease_chart = [{"name": d[0], "count": d[1]} for d in disease_counts]

    # Crop breakdown
    crop_counts = (
        db.query(DiseaseReport.crop_name, func.count(DiseaseReport.id))
        .group_by(DiseaseReport.crop_name)
        .order_by(func.count(DiseaseReport.id).desc())
        .limit(6)
        .all()
    )
    crop_chart = [{"name": c[0], "count": c[1]} for c in crop_counts]

    # Severity distribution
    sev_counts = (
        db.query(DiseaseReport.severity, func.count(DiseaseReport.id))
        .group_by(DiseaseReport.severity)
        .all()
    )
    severity_chart = [{"name": s[0] or "Unknown", "count": s[1]} for s in sev_counts]

    # Trajectory over last 7 days (Daily count)
    trajectory = []
    now = datetime.utcnow()
    for i in range(6, -1, -1):
        day_start = (now - timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        count = db.query(DiseaseReport).filter(
            DiseaseReport.created_at >= day_start,
            DiseaseReport.created_at < day_end
        ).count()
        trajectory.append({
            "day": f"Day {7-i}",
            "date": day_start.strftime("%b %d"),
            "cases": count
        })

    # High risk areas count
    high_risk_districts = (
        db.query(DiseaseReport.district, func.count(DiseaseReport.id))
        .filter(DiseaseReport.severity.in_(["Moderate", "Severe"]))
        .group_by(DiseaseReport.district)
        .having(func.count(DiseaseReport.id) >= 15)
        .all()
    )

    return {
        "total_reports": total_reports,
        "active_cases": active_cases,
        "pending_verification": pending_count,
        "verified_reports": verified_count,
        "high_risk_areas_count": len(high_risk_districts),
        "potential_outbreaks_count": 3,
        "disease_breakdown": disease_chart,
        "crop_breakdown": crop_chart,
        "severity_breakdown": severity_chart,
        "cases_over_time": trajectory,
        "is_demo_data": True
    }
