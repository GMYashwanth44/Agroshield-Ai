import random
from typing import Optional, List
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import DiseaseReport, User, Notification
from app.schemas.schemas import DiseaseReportCreate, DiseaseReportResponse
from app.api.auth import get_current_user, get_optional_current_user

router = APIRouter(prefix="/reports", tags=["Disease Reports & GPS Surveillance"])

@router.post("", response_model=DiseaseReportResponse)
def create_report(
    data: DiseaseReportCreate,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Submits a disease report with GPS location and AI diagnosis metrics.
    """
    report = DiseaseReport(
        farmer_id=current_user.id if current_user else None,
        crop_name=data.crop_name,
        disease_name=data.disease_name,
        confidence=data.confidence,
        severity=data.severity,
        affected_area_pct=data.affected_area_pct,
        latitude=data.latitude,
        longitude=data.longitude,
        location_accuracy=data.location_accuracy or 10.0,
        district=data.district or "Kolar",
        village=data.village or "Srinivaspur",
        image_url=data.image_url or "https://images.unsplash.com/photo-1592417817098-8f3d6eb22510?w=600&auto=format&fit=crop&q=80",
        mask_url=data.mask_url,
        farmer_notes=data.farmer_notes,
        is_offline=data.is_offline or False,
        status="pending"
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report

@router.get("", response_model=List[DiseaseReportResponse])
def get_reports(
    crop: Optional[str] = None,
    disease: Optional[str] = None,
    severity: Optional[str] = None,
    district: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = Query(100, le=1500),
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """
    Returns disease reports with filters. Farmer personal details are anonymized.
    """
    q = db.query(DiseaseReport)
    if crop and crop != "all":
        q = q.filter(DiseaseReport.crop_name.ilike(f"%{crop}%"))
    if disease and disease != "all":
        q = q.filter(DiseaseReport.disease_name.ilike(f"%{disease}%"))
    if severity and severity != "all":
        q = q.filter(DiseaseReport.severity.ilike(f"%{severity}%"))
    if district and district != "all":
        q = q.filter(DiseaseReport.district.ilike(f"%{district}%"))
    if status and status != "all":
        q = q.filter(DiseaseReport.status == status)

    return q.order_by(DiseaseReport.created_at.desc()).offset(offset).limit(limit).all()

@router.get("/nearby")
def get_nearby_reports(
    latitude: float,
    longitude: float,
    radius_km: float = 30.0,
    db: Session = Depends(get_db)
):
    """
    Returns nearby disease reports around a given GPS point within radius_km.
    Computes spatial distance bounding box.
    """
    # Approx 1 deg lat ~ 111 km, 1 deg lon ~ 111 * cos(lat)
    deg_delta = radius_km / 111.0
    reports = db.query(DiseaseReport).filter(
        DiseaseReport.latitude.between(latitude - deg_delta, latitude + deg_delta),
        DiseaseReport.longitude.between(longitude - deg_delta, longitude + deg_delta)
    ).order_by(DiseaseReport.created_at.desc()).limit(100).all()

    # Summarize risk in this radius
    case_count = len(reports)
    if case_count >= 20:
        nearby_risk = "High"
    elif case_count >= 8:
        nearby_risk = "Moderate"
    else:
        nearby_risk = "Low"

    return {
        "case_count": case_count,
        "nearby_risk": nearby_risk,
        "radius_km": radius_km,
        "reports": [
            {
                "id": r.id,
                "crop": r.crop_name,
                "disease": r.disease_name,
                "severity": r.severity,
                "latitude": r.latitude,
                "longitude": r.longitude,
                "district": r.district,
                "village": r.village,
                "date": r.created_at.isoformat()
            }
            for r in reports[:25]
        ]
    }

@router.get("/{id}", response_model=DiseaseReportResponse)
def get_report_by_id(id: int, db: Session = Depends(get_db)):
    rep = db.query(DiseaseReport).filter(DiseaseReport.id == id).first()
    if not rep:
        raise HTTPException(status_code=404, detail="Report not found")
    return rep

@router.post("/sync")
def sync_offline_reports(
    reports: List[DiseaseReportCreate],
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Synchronizes offline reports recorded in IndexedDB when internet connection is restored.
    """
    synced_ids = []
    for r in reports:
        new_rep = DiseaseReport(
            farmer_id=current_user.id if current_user else None,
            crop_name=r.crop_name,
            disease_name=r.disease_name,
            confidence=r.confidence,
            severity=r.severity,
            affected_area_pct=r.affected_area_pct,
            latitude=r.latitude,
            longitude=r.longitude,
            location_accuracy=r.location_accuracy or 10.0,
            district=r.district or "Kolar",
            village=r.village or "Srinivaspur",
            image_url=r.image_url or "https://images.unsplash.com/photo-1592417817098-8f3d6eb22510?w=600&auto=format&fit=crop&q=80",
            farmer_notes=f"[Synced from Offline] {r.farmer_notes or ''}",
            is_offline=True,
            status="pending"
        )
        db.add(new_rep)
        db.flush()
        synced_ids.append(new_rep.id)

    db.commit()
    return {
        "status": "success",
        "synced_count": len(synced_ids),
        "report_ids": synced_ids,
        "message": f"Successfully synchronized {len(synced_ids)} offline reports."
    }

@router.post("/simulate-cluster")
def simulate_cluster_injection(
    district: str = "Kolar",
    disease: str = "Early Blight",
    crop: str = "Tomato",
    db: Session = Depends(get_db)
):
    """
    SIH Demonstration helper: Injects a burst of 15 nearby cases in Srinivaspur
    to trigger live DBSCAN hotspot and outbreak alerts on the map!
    """
    center_lat = 13.3392
    center_lng = 78.2139
    now = datetime.utcnow()
    added = []
    
    for i in range(15):
        j_lat = center_lat + random.uniform(-0.02, 0.02)
        j_lng = center_lng + random.uniform(-0.02, 0.02)
        rep = DiseaseReport(
            crop_name=crop,
            disease_name=disease,
            confidence=round(random.uniform(0.91, 0.96), 3),
            severity="Moderate",
            affected_area_pct=round(random.uniform(25.0, 42.0), 1),
            latitude=round(j_lat, 5),
            longitude=round(j_lng, 5),
            district=district,
            village="Srinivaspur Block C",
            image_url="https://images.unsplash.com/photo-1592417817098-8f3d6eb22510?w=600&auto=format&fit=crop&q=80",
            farmer_notes="Demonstration cluster case.",
            status="pending",
            created_at=now - timedelta(hours=random.uniform(0.5, 12))
        )
        db.add(rep)
        added.append(rep)

    db.commit()
    return {
        "status": "success",
        "message": f"Injected {len(added)} simulated nearby reports in {district} cluster.",
        "count": len(added)
    }
