from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta

def estimate_future_disease_risk(
    crop: str,
    disease: str,
    severity: str = "Moderate",
    affected_area_pct: float = 30.0,
    district: str = "Kolar",
    weather_data: Optional[Dict[str, Any]] = None,
    nearby_reports_count: int = 0
) -> Dict[str, Any]:
    crop_clean = (crop or "Tomato").strip()
    disease_clean = (disease or "Early Blight").strip()
    sev_clean = (severity or "Moderate").strip().lower()

    temp = 24.5
    humidity = 82.0
    rain_chance = 65.0
    if weather_data:
        temp = float(weather_data.get("temp", weather_data.get("temperature", 24.5)))
        humidity = float(weather_data.get("humidity", 82.0))
        rain_chance = float(weather_data.get("rain_chance", weather_data.get("rain_probability", 60.0)))

    reasons = []
    risk_score_points = 0

    is_fungal = any(k in disease_clean.lower() for k in ["blight", "rust", "blast", "spot", "mildew"])
    is_bacterial = "bacterial" in disease_clean.lower()

    if is_fungal:
        if humidity >= 80.0:
            risk_score_points += 30
            reasons.append(f"Elevated relative humidity ({humidity}%) strongly accelerates fungal spore germination and lesion expansion.")
        elif humidity >= 65.0:
            risk_score_points += 15
            reasons.append(f"Moderate humidity ({humidity}%) sustains active fungal spore viability.")

        if 18.0 <= temp <= 29.0:
            risk_score_points += 25
            reasons.append(f"Ambient temperature ({temp}C) falls right within the optimal thermal band (20-28C) for {disease_clean} development.")
        
        if rain_chance >= 50.0:
            risk_score_points += 20
            reasons.append(f"High precipitation probability ({rain_chance}%) causes prolonged leaf wetness and rainwater splash dispersal.")

    elif is_bacterial:
        if humidity >= 75.0 and temp >= 25.0:
            risk_score_points += 35
            reasons.append(f"Warm ({temp}C) and humid ({humidity}%) conditions promote bacterial ooze and stomatal penetration.")
        else:
            risk_score_points += 20
            reasons.append("Environmental moisture maintains bacterial presence along leaf margins.")

    else:
        if "healthy" in disease_clean.lower():
            risk_score_points += 5
            reasons.append(f"Crop foliage currently appears healthy. Baseline environmental pathogen spore pressure exists in {district}.")
        else:
            risk_score_points += 20
            reasons.append(f"Environmental conditions in {district} support general foliar pathogen activity.")

    if "severe" in sev_clean:
        risk_score_points += 25
        reasons.append(f"High current disease severity ({affected_area_pct}% affected foliage) provides heavy active inoculum load.")
    elif "moderate" in sev_clean:
        risk_score_points += 15
        reasons.append(f"Moderate disease presence ({affected_area_pct}% affected foliage) can escalate without early barrier intervention.")
    elif "mild" in sev_clean:
        risk_score_points += 5
        reasons.append(f"Mild focal lesions detected ({affected_area_pct}%). Timely action can prevent systemic secondary spread.")

    if nearby_reports_count >= 15:
        risk_score_points += 20
        reasons.append(f"High localized surveillance activity: {nearby_reports_count} similar disease detections reported within your taluk/district.")
    elif nearby_reports_count >= 5:
        risk_score_points += 10
        reasons.append(f"Emerging community detections: {nearby_reports_count} nearby field reports logged in {district}.")

    total_risk_score = min(100, max(10, risk_score_points))

    if "healthy" in disease_clean.lower() and total_risk_score < 45:
        risk_level = "LOW"
        risk_color = "#10B981"
        expected_risk_period = "Next 7-14 Days (Low Inoculum Pressure)"
    elif total_risk_score >= 65:
        risk_level = "HIGH"
        risk_color = "#EF4444"
        expected_risk_period = "Next 2-4 Days (Immediate High Risk Window)"
    elif total_risk_score >= 40:
        risk_level = "MEDIUM"
        risk_color = "#F59E0B"
        expected_risk_period = "Next 4-7 Days (Elevated Microclimate Risk)"
    else:
        risk_level = "LOW"
        risk_color = "#10B981"
        expected_risk_period = "Next 7-10 Days (Manageable Risk)"

    preventive_actions = []
    if risk_level == "HIGH":
        preventive_actions.append("Apply a prophylactic foliar protective spray (e.g. bio-fungicide Trichoderma viride or approved contact fungicide) before rain onset.")
        preventive_actions.append("Ensure 60x45 cm row spacing and remove severely infected lower leaves immediately to interrupt spore splash.")
        preventive_actions.append("Discontinue overhead irrigation immediately; switch to root-zone drip to eliminate leaf moisture.")
        preventive_actions.append("Schedule a follow-up scan with AgroShield in 3-4 days to verify containment.")
    elif risk_level == "MEDIUM":
        preventive_actions.append("Apply organic neem oil solution (10,000 PPM @ 3ml/L) as a protective fungal barrier.")
        preventive_actions.append("Prune bottom leaves touching wet soil and sanitize pruning shears with alcohol.")
        preventive_actions.append("Monitor adjoining crop beds and take a follow-up photo in 5 days.")
    else:
        preventive_actions.append("Maintain standard field sanitation and balanced NPK nutrition.")
        preventive_actions.append("Perform routine weekly scanning to catch any early signs of foliar stress.")

    return {
        "crop": crop_clean,
        "disease": disease_clean,
        "district": district,
        "risk_level": risk_level,
        "risk_score": total_risk_score,
        "risk_color": risk_color,
        "expected_risk_period": expected_risk_period,
        "main_reasons": reasons,
        "preventive_actions": preventive_actions,
        "input_factors": {
            "temperature_c": temp,
            "relative_humidity_pct": humidity,
            "rain_probability_pct": rain_chance,
            "severity_level": severity,
            "affected_area_pct": affected_area_pct,
            "nearby_community_cases": nearby_reports_count
        },
        "is_estimate": True,
        "disclaimer": "Future Disease Risk Estimate is a predictive heuristic based on weather, pathogen biology, and local case density. Clearly labeled as an advisory estimate; never claim laboratory-validated certainty."
    }
