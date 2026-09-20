from app.ai.preprocessing import check_image_quality
from app.ai.disease_model import disease_model_adapter
from app.ai.severity import estimate_disease_severity
from app.services.risk_prediction import estimate_future_disease_risk
from app.services.health_score import calculate_crop_health_score
from app.services.action_plan import generate_7day_action_plan

def predict_disease(image_bytes: bytes, filename: str = "leaf.jpg", district: str = "Kolar") -> dict:
    """
    Main prediction pipeline:
    1. Pre-prediction image quality verification.
    2. Model inference (Crop, Disease, Confidence, Status, Explainability).
    3. Severity and affected leaf area estimation.
    4. Future Disease Risk Prediction.
    5. Crop Health Score Calculation (0-100).
    6. Safe treatment and certified recommendations compilation.
    """
    # 1. Quality Check
    qc_result = check_image_quality(image_bytes, filename)
    if not qc_result["is_valid"]:
        return {
            "success": False,
            "quality_passed": False,
            "message": qc_result["message"],
            "issues": qc_result["issues"],
            "metrics": qc_result["metrics"],
            "data": None
        }

    # 2. Disease Prediction with Explainable AI
    pred = disease_model_adapter.predict(image_bytes, qc_result["metrics"])

    # 3. Severity Assessment
    severity_info = estimate_disease_severity(image_bytes)

    # 4. Future Risk Prediction (Phase 1 Differentiating Feature)
    future_risk = estimate_future_disease_risk(
        crop=pred["crop"],
        disease=pred["disease"],
        severity=severity_info["severity_level"],
        affected_area_pct=severity_info["affected_area_pct"],
        district=district,
        nearby_reports_count=18
    )

    # 5. Crop Health Score (Phase 1 Differentiating Feature)
    crop_health = calculate_crop_health_score(
        disease_name=pred["disease"],
        severity_level=severity_info["severity_level"],
        affected_area_pct=severity_info["affected_area_pct"],
        weather_risk="Moderate",
        pest_risk=future_risk["risk_level"]
    )

    # 6. 7-Day Personalized Action Plan (Phase 3 Differentiating Feature)
    action_plan = generate_7day_action_plan(
        crop=pred["crop"],
        disease=pred["disease"],
        severity=severity_info["severity_level"],
        future_risk=future_risk["risk_level"],
        district=district
    )

    # 7. Synthesize Comprehensive Disease Report
    report = {
        "crop": pred["crop"],
        "disease": pred["disease"],
        "pathogen": pred["pathogen"],
        "confidence": pred["confidence"],
        "confidence_pct": pred["confidence_pct"],
        "status": pred["status"],
        "is_low_confidence": pred["is_low_confidence"],
        "severity": severity_info["severity_level"],
        "severity_key": severity_info["severity_key"],
        "affected_area_pct": severity_info["affected_area_pct"],
        "color_hex": severity_info["color_hex"],
        "mask_data_uri": severity_info["mask_data_uri"],
        "symptoms": pred["symptoms"],
        "explainability": pred.get("explainability"),
        "future_risk": future_risk,
        "crop_health": crop_health,
        "action_plan": action_plan,
        "recommendations": {
            "cultural_practices": "Ensure optimal plant spacing (60x45 cm) for ventilation. Stake plants to prevent foliage contacting wet soil. Avoid overhead sprinkler irrigation.",
            "organic_control": pred["organic_remedy"],
            "chemical_guidance": pred["chemical_guidance"],
            "safety_disclaimer": "For crop-protection products, strictly follow the legally approved product label and locally applicable agricultural university guidance. Never exceed recommended dosages."
        },
        "suggested_product_categories": pred["product_categories"],
        "ai_disclaimer": pred["ai_disclaimer"],
        "model_architecture": pred["model_backbone"]
    }

    return {
        "success": True,
        "quality_passed": True,
        "message": "AI analysis completed successfully.",
        "data": report
    }
