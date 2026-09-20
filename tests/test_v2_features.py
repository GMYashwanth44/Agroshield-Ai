import pytest
import io
import numpy as np
from PIL import Image
from fastapi.testclient import TestClient

from app.main import app
from app.services.risk_prediction import estimate_future_disease_risk
from app.services.health_score import calculate_crop_health_score
from app.services.action_plan import generate_7day_action_plan
from app.services.recovery_tracking import compare_crop_recovery
from app.services.smart_alerts import generate_smart_alerts
from app.services.farmer_assistant import ask_farmer_assistant
from app.ai.disease_model import disease_model_adapter
from app.ai.preprocessing import check_image_quality

client = TestClient(app)

def create_synthetic_leaf_bytes(size=(240, 240)):
    """Generate in-memory RGB synthetic leaf image with texture and brown disease spot."""
    arr = np.zeros((size[0], size[1], 3), dtype=np.uint8)
    arr[:, :, 1] = 135 # Green foliage
    arr[:, :, 0] = 50  # Red
    arr[:, :, 2] = 30  # Blue
    
    # Add texture noise so Laplacian variance passes blur check
    np.random.seed(42)
    noise = np.random.randint(-25, 25, (size[0], size[1], 3))
    arr = np.clip(arr.astype(np.int16) + noise, 0, 255).astype(np.uint8)
    
    # Add brown necrotic lesion in center
    arr[70:170, 70:170, 0] = 110
    arr[70:170, 70:170, 1] = 65
    arr[70:170, 70:170, 2] = 20

    img = Image.fromarray(arr)
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=90)
    return buf.getvalue()


# ==============================================================================
# 1. FUTURE DISEASE RISK PREDICTION
# ==============================================================================
def test_future_risk_prediction():
    res = client.get("/api/intelligence/future-risk?crop=Tomato&disease=Early%20Blight&severity=Moderate&district=Kolar")
    assert res.status_code == 200
    data = res.json()
    assert "risk_level" in data
    assert data["risk_level"] in ["LOW", "MEDIUM", "HIGH"]
    assert "risk_score" in data
    assert 0 <= data["risk_score"] <= 100
    assert len(data["main_reasons"]) > 0
    assert len(data["preventive_actions"]) > 0
    assert "expected_risk_period" in data


# ==============================================================================
# 2. EXPLAINABLE AI ("Why this result?")
# ==============================================================================
def test_explainable_ai_generation():
    explanation = disease_model_adapter.generate_explanation(
        selected={"crop": "Tomato", "disease": "Early Blight", "pathogen": "Alternaria solani"},
        confidence=0.947,
        quality_metrics={"foliage_ratio": 75.0, "mean_luminance": 115.0}
    )
    assert "visual_evidence" in explanation
    assert len(explanation["visual_evidence"]) >= 3
    assert "important_symptoms" in explanation
    assert "distinguishing_hallmarks" in explanation["important_symptoms"]
    assert "absent_symptoms" in explanation["important_symptoms"]
    assert "data_to_improve_confidence" in explanation
    assert "alternative_hypotheses" in explanation
    assert len(explanation["alternative_hypotheses"]) >= 2


# ==============================================================================
# 3. CROP HEALTH SCORE (0–100)
# ==============================================================================
def test_crop_health_score_calculation():
    score_data = calculate_crop_health_score(
        disease_name="Early Blight",
        severity_level="Moderate",
        affected_area_pct=35.0,
        weather_risk="Moderate",
        pest_risk="HIGH"
    )
    assert 0 <= score_data["crop_health_score"] <= 100
    assert "status" in score_data
    assert "deductions" in score_data
    assert len(score_data["deductions"]) > 0
    assert "improvement_actions" in score_data
    assert len(score_data["improvement_actions"]) > 0
    assert "recovery_trend" in score_data


# ==============================================================================
# 4. COMMUNITY DISEASE INTELLIGENCE (Privacy-Preserving)
# ==============================================================================
def test_community_intelligence():
    res = client.get("/api/intelligence/community-intelligence")
    assert res.status_code == 200
    data = res.json()
    assert "privacy_notice" in data
    assert data["privacy_notice"]["is_privacy_protected"] is True
    assert "strictly protected" in data["privacy_notice"]["statement"]
    assert "total_community_reports" in data
    assert "top_diseases" in data
    assert "regional_trends" in data
    assert "emerging_hotspots" in data


# ==============================================================================
# 5. DISEASE SPREAD-RISK PROJECTION ("Projected Risk Area")
# ==============================================================================
def test_disease_spread_projections():
    res = client.get("/api/intelligence/spread-projections?wind_direction_deg=65&wind_speed_kmh=15")
    assert res.status_code == 200
    data = res.json()
    assert "projections" in data
    assert "status_label" in data
    assert data["status_label"] == "Projected Risk Area"
    assert "disclaimer" in data
    assert "Never present projections as confirmed future disease locations" in data["disclaimer"]


# ==============================================================================
# 6. PERSONALIZED 7-DAY CROP ACTION PLAN
# ==============================================================================
def test_personalized_7day_action_plan():
    plan = generate_7day_action_plan(
        crop="Tomato",
        disease="Early Blight",
        severity="Moderate",
        future_risk="HIGH",
        district="Kolar"
    )
    assert plan["expected_duration_days"] == 7
    assert len(plan["days"]) == 7
    # Day 1 triage
    assert plan["days"][0]["day_number"] == 1
    assert "Pruning" in plan["days"][0]["title"] or "Quarantine" in plan["days"][0]["title"] or "Mechanical" in plan["days"][0]["title"]
    assert "critical_instruction" in plan["days"][0]
    assert plan["potential_health_gain"] > 0

    # Test via API
    res = client.post("/api/intelligence/action-plan", json={
        "crop": "Tomato",
        "disease": "Early Blight",
        "severity": "Moderate",
        "district": "Kolar"
    })
    assert res.status_code == 200
    assert len(res.json()["days"]) == 7


# ==============================================================================
# 7. BEFORE VS AFTER CROP MONITORING ("Crop Recovery Progress")
# ==============================================================================
def test_crop_recovery_comparison():
    res = client.get("/api/intelligence/recovery-comparison?crop=Tomato")
    assert res.status_code == 200
    data = res.json()
    assert "status" in data
    assert "verdict" in data
    assert "score_delta" in data
    assert "baseline_scan" in data
    assert "follow_up_scan" in data


# ==============================================================================
# 8. AGRICULTURAL EXPERT REVIEW (Confirmed / Needs Info / Different Diagnosis / Resolved)
# ==============================================================================
def test_agricultural_expert_review_workflow():
    # 1. Pending reports queue
    res_pending = client.get("/api/expert/pending-reports")
    assert res_pending.status_code == 200
    reports = res_pending.json()
    target_id = reports[0]["id"] if reports else 1

    # 2. Farmer requests review
    res_req = client.post(f"/api/expert/request-review/{target_id}", json={
        "farmer_notes": "Noticed concentric lesions spreading rapidly after rainfall."
    })
    assert res_req.status_code == 200
    assert res_req.json()["review_stage"] == "pending_officer"

    # 3. Officer submits 'confirmed'
    res_conf = client.post("/api/expert/review", json={
        "report_id": target_id,
        "decision": "confirmed",
        "confirmed_diagnosis": "Early Blight (Alternaria solani)",
        "comments": "Confirmed based on concentric target lesions and field benchmark correlation."
    })
    assert res_conf.status_code == 200
    assert res_conf.json()["decision"] == "confirmed"

    # 4. Officer submits 'different_diagnosis' override
    res_override = client.post("/api/expert/review", json={
        "report_id": target_id,
        "decision": "different_diagnosis",
        "confirmed_diagnosis": "Septoria Leaf Spot",
        "comments": "Multiple circular spots with darker borders match Septoria rather than Early Blight."
    })
    assert res_override.status_code == 200
    assert res_override.json()["decision"] == "different_diagnosis"
    assert res_override.json()["officer_diagnosis"] == "Septoria Leaf Spot"


# ==============================================================================
# 9. SMART IMAGE QUALITY ASSISTANT (Framing / Distance / Lighting Guidance)
# ==============================================================================
def test_smart_image_quality_assistant():
    # Test valid image
    good_bytes = create_synthetic_leaf_bytes()
    good_res = check_image_quality(good_bytes)
    assert good_res["passed"] is True
    assert len(good_res["guidance"]) > 0

    # Test blurry / empty image
    bad_bytes = b"tiny"
    bad_res = check_image_quality(bad_bytes)
    assert bad_res["passed"] is False
    assert len(bad_res["issues"]) > 0
    assert len(bad_res["guidance"]) > 0


# ==============================================================================
# 10. SMART ALERT SYSTEM (Explicit "Why Generated" Explanations)
# ==============================================================================
def test_smart_alerts_with_explanations():
    res = client.get("/api/intelligence/smart-alerts?crop=Tomato&district=Kolar")
    assert res.status_code == 200
    data = res.json()
    assert "alerts" in data
    assert len(data["alerts"]) > 0
    for alert in data["alerts"]:
        assert "why_generated" in alert
        assert len(alert["why_generated"]) > 0
        assert "priority" in alert
        assert "action_label" in alert


# ==============================================================================
# 11. AI FARMER ASSISTANT ("Ask AgroShield" in 6 Languages)
# ==============================================================================
def test_ai_farmer_assistant_multilingual():
    languages = ["en", "kn", "hi", "te", "ta", "mr"]
    for lang in languages:
        res = client.post("/api/intelligence/ask-assistant", json={
            "question": "Can I spray bio-fungicide if it rains?",
            "crop": "Tomato",
            "disease": "Early Blight",
            "severity": "Moderate",
            "health_score": 72.0,
            "language": lang
        })
        assert res.status_code == 200
        data = res.json()
        assert data["language"] == lang
        assert len(data["answer"]) > 0
        assert "safety_reminder" in data
