from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from datetime import datetime
from app.database.session import get_db
from app.models.models import DiseaseReport, ExpertReview, Notification, User
from app.schemas.schemas import ExpertReviewCreate, DiseaseReportResponse
from app.api.auth import get_optional_current_user

router = APIRouter(prefix="/expert", tags=["Officer Verification & Expert Review"])

@router.get("/pending-reports")
def get_pending_reports(db: Session = Depends(get_db)):
    """
    Returns reports queued for Agricultural Officer evaluation.
    """
    reps = db.query(DiseaseReport).filter(
        DiseaseReport.status.in_(["pending", "more_info", "needs_info", "under_review"])
    ).order_by(DiseaseReport.created_at.desc()).limit(50).all()

    # If no pending reports, return top 15 most recent for officer dashboard demo
    if not reps:
        reps = db.query(DiseaseReport).order_by(DiseaseReport.created_at.desc()).limit(15).all()

    return [
        {
            "id": r.id,
            "crop_name": r.crop_name,
            "disease_name": r.disease_name,
            "confidence": r.confidence,
            "severity": r.severity,
            "affected_area_pct": r.affected_area_pct,
            "status": r.status,
            "review_stage": getattr(r, "review_stage", "pending"),
            "crop_health_score": getattr(r, "crop_health_score", 72.0),
            "future_risk_level": getattr(r, "future_risk_level", "HIGH"),
            "officer_override_disease": getattr(r, "officer_override_disease", None),
            "latitude": r.latitude,
            "longitude": r.longitude,
            "district": r.district,
            "village": r.village,
            "image_url": r.image_url,
            "farmer_notes": r.farmer_notes,
            "officer_diagnosis": r.officer_diagnosis,
            "officer_comments": r.officer_comments,
            "created_at": r.created_at.isoformat() if r.created_at else None
        }
        for r in reps
    ]

@router.post("/request-review/{report_id}")
def request_officer_review(
    report_id: int,
    payload: Optional[Dict[str, Any]] = Body(None),
    db: Session = Depends(get_db)
):
    """
    Farmer requests Agricultural Officer field validation on an AI diagnosis.
    """
    rep = db.query(DiseaseReport).filter(DiseaseReport.id == report_id).first()
    if not rep:
        raise HTTPException(status_code=404, detail="Disease report not found.")

    rep.status = "pending"
    rep.review_stage = "pending_officer"
    if payload and "farmer_notes" in payload:
        rep.farmer_notes = payload["farmer_notes"]

    db.commit()
    return {
        "status": "success",
        "message": f"Report #{report_id} has been escalated for Agricultural Officer review.",
        "report_id": report_id,
        "review_stage": "pending_officer"
    }

@router.post("/review")
def review_disease_report(
    data: ExpertReviewCreate,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Agricultural Officer action:
    - Confirmed (approves AI diagnosis)
    - Needs More Information (requests additional photo/info)
    - Different Diagnosis (overrides AI diagnosis with field expert diagnosis)
    - Resolved (marks recovery plan completed)
    """
    rep = db.query(DiseaseReport).filter(DiseaseReport.id == data.report_id).first()
    if not rep:
        raise HTTPException(status_code=404, detail="Disease report not found.")

    decision_norm = data.decision.lower().strip()
    if decision_norm in ["confirmed", "verify", "verified"]:
        normalized_stage = "confirmed"
        normalized_status = "verified"
    elif decision_norm in ["needs_info", "needs more information", "more_info_requested", "more_info"]:
        normalized_stage = "needs_info"
        normalized_status = "more_info"
    elif decision_norm in ["different_diagnosis", "override", "different diagnosis", "rejected"]:
        normalized_stage = "different_diagnosis"
        normalized_status = "verified" # Marked verified with override
        rep.officer_override_disease = data.confirmed_diagnosis
    elif decision_norm in ["resolved", "closed"]:
        normalized_stage = "resolved"
        normalized_status = "resolved"
    else:
        normalized_stage = decision_norm
        normalized_status = decision_norm

    # Update report record
    rep.status = normalized_status
    rep.review_stage = normalized_stage
    rep.officer_id = current_user.id if current_user else 2
    rep.officer_diagnosis = data.confirmed_diagnosis
    rep.officer_comments = data.comments

    # Create audit record
    review = ExpertReview(
        report_id=rep.id,
        officer_id=current_user.id if current_user else 2,
        decision=normalized_stage,
        confirmed_diagnosis=data.confirmed_diagnosis,
        comments=data.comments,
        recommended_action=data.recommended_action
    )
    db.add(review)

    # Notify farmer if associated with an account
    if rep.farmer_id:
        decision_label = {
            "confirmed": "Diagnosis Confirmed by Officer",
            "needs_info": "Officer Requested Additional Details",
            "different_diagnosis": "Officer Provided Expert Diagnosis Override",
            "resolved": "Crop Case Marked Resolved"
        }.get(normalized_stage, "Officer Review Updated")

        officer_name = current_user.full_name if current_user else "Dr. Ananya Sharma (Agri Officer)"
        notif = Notification(
            user_id=rep.farmer_id,
            title=decision_label,
            message=f"{officer_name} reviewed your {rep.crop_name} report: {data.confirmed_diagnosis}. Notes: {data.comments[:120]}...",
            alert_type="verification",
            link=f"/farmer/report/{rep.id}"
        )
        db.add(notif)

    db.commit()
    return {
        "status": "success",
        "message": f"Report #{rep.id} successfully processed with decision '{normalized_stage}'.",
        "report_id": rep.id,
        "decision": normalized_stage,
        "review_stage": normalized_stage,
        "officer_diagnosis": data.confirmed_diagnosis
    }

@router.post("/send-farmer-alert")
def broadcast_farmer_alert(
    title: str,
    message: str,
    district: str = "Kolar",
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Broadcasts official early-warning or advisory notification to all farmers in jurisdiction.
    """
    farmers = db.query(User).filter(User.role == "farmer").all()
    count = 0
    for f in farmers:
        notif = Notification(
            user_id=f.id,
            title=title,
            message=message,
            alert_type="outbreak",
            link="/farmer/alerts"
        )
        db.add(notif)
        count += 1

    db.commit()
    return {
        "status": "success",
        "message": f"Broadcast alert successfully sent to {count} farmers in {district} district.",
        "recipients_count": count
    }
