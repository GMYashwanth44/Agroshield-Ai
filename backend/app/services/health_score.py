from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta

def calculate_crop_health_score(
    disease_name: str = "Early Blight",
    severity_level: str = "Moderate",
    affected_area_pct: float = 37.0,
    recent_reports: Optional[List[Dict[str, Any]]] = None,
    weather_risk: str = "Moderate",
    pest_risk: str = "MEDIUM"
) -> Dict[str, Any]:
    """
    Computes a holistic Crop Health Score from 0 to 100 based on:
    - Active lesion/disease severity & tissue damage
    - Historical scan frequency and pathogen recurrence
    - Microclimate/weather stress penalty
    - Pest & community vector risk
    """
    base_score = 100
    deductions = []
    
    # 1. Disease Severity Deduction
    sev_lower = (severity_level or "moderate").lower()
    aff_pct = float(affected_area_pct or 0.0)

    if "healthy" in (disease_name or "").lower() or "healthy" in sev_lower:
        # Healthy baseline
        pass
    elif "severe" in sev_lower or aff_pct > 50.0:
        pts = min(45, int(25 + (aff_pct * 0.4)))
        base_score -= pts
        deductions.append({
            "factor": f"High Lesion Severity ({aff_pct}% leaf damage)",
            "points_lost": pts,
            "explanation": f"Necrotic spots cover {aff_pct}% of foliage, compromising photosynthetic capacity."
        })
    elif "moderate" in sev_lower or aff_pct > 20.0:
        pts = min(28, int(15 + (aff_pct * 0.3)))
        base_score -= pts
        deductions.append({
            "factor": f"Moderate Disease Presence ({aff_pct}% leaf damage)",
            "points_lost": pts,
            "explanation": f"Foliar lesions on lower and middle leaves reduced leaf health index."
        })
    elif "mild" in sev_lower or aff_pct > 5.0:
        pts = min(15, int(8 + (aff_pct * 0.3)))
        base_score -= pts
        deductions.append({
            "factor": f"Mild Early Symptoms ({aff_pct}% leaf damage)",
            "points_lost": pts,
            "explanation": "Initial lesion spots spotted on foliage."
        })

    # 2. Weather & Humidity Stress Deduction
    w_lower = (weather_risk or "moderate").lower()
    if "high" in w_lower or "very high" in w_lower:
        base_score -= 10
        deductions.append({
            "factor": "Unfavorable Weather Microclimate",
            "points_lost": 10,
            "explanation": "High humidity (>80%) and persistent overcast sky induce transpiration stress."
        })
    elif "moderate" in w_lower:
        base_score -= 5
        deductions.append({
            "factor": "Moderate Weather Risk",
            "points_lost": 5,
            "explanation": "Elevated moisture indices favor secondary pathogen reproduction."
        })

    # 3. Pest & Community Risk Deduction
    p_lower = (pest_risk or "medium").lower()
    if "high" in p_lower:
        base_score -= 8
        deductions.append({
            "factor": "Elevated Regional Pathogen Inoculum",
            "points_lost": 8,
            "explanation": "Multiple active clusters detected in surrounding community fields."
        })
    elif "medium" in p_lower:
        base_score -= 4
        deductions.append({
            "factor": "Surrounding Area Disease Presence",
            "points_lost": 4,
            "explanation": "Sporadic cases detected within 15 km radius."
        })

    # 4. Historical Trend / Recovery Evaluation
    recovery_trend = "Stable"
    score_history = []
    
    if recent_reports and len(recent_reports) > 0:
        # Sort chronologically
        sorted_reps = sorted(recent_reports, key=lambda x: x.get("created_at") or datetime.min)
        for idx, r in enumerate(sorted_reps[-4:]):
            prev_aff = float(r.get("affected_area_pct", 35.0))
            prev_sev = r.get("severity", "Moderate")
            # Approximate past score
            hist_score = max(35, min(95, int(95 - (prev_aff * 1.1))))
            dt_str = r.get("created_at")
            if isinstance(dt_str, datetime):
                dt_label = dt_str.strftime("%b %d")
            else:
                dt_label = f"Scan {idx+1}"
            score_history.append({
                "date": dt_label,
                "score": hist_score,
                "disease": r.get("disease_name", disease_name),
                "severity": prev_sev
            })
        
        # Check recovery trend against latest previous scan
        if len(sorted_reps) >= 1:
            last_rep = sorted_reps[-1]
            last_aff = float(last_rep.get("affected_area_pct", aff_pct))
            if aff_pct < last_aff - 3.0:
                recovery_trend = "Improving"
                base_score += 5 # Reward recovery progress
            elif aff_pct > last_aff + 4.0:
                recovery_trend = "Deteriorating"
                base_score -= 5

    # Final bounded score
    final_score = int(max(15, min(98, base_score)))

    # Status classification
    if final_score >= 85:
        status = "Optimal Health"
        status_key = "optimal"
        status_color = "#10B981" # Emerald
        badge = "Optimal"
    elif final_score >= 65:
        status = "Moderate Health"
        status_key = "moderate"
        status_color = "#F59E0B" # Amber
        badge = "Moderate"
    elif final_score >= 45:
        status = "At Risk"
        status_key = "at_risk"
        status_color = "#F97316" # Orange
        badge = "At Risk"
    else:
        status = "Critical Health"
        status_key = "critical"
        status_color = "#EF4444" # Red
        badge = "Critical"

    # Actionable improvement recommendations
    improvement_actions = [
        {"action": "Prune and dispose of lowest diseased foliage", "potential_points": "+8 to +12 pts"},
        {"action": "Apply bio-fungicide or label-approved foliar treatment", "potential_points": "+10 to +15 pts"},
        {"action": "Switch to root-zone drip irrigation to eliminate canopy wetness", "potential_points": "+5 to +8 pts"},
        {"action": "Perform follow-up scan in 4 days to confirm recovery progress", "potential_points": "+5 pts"}
    ]

    return {
        "crop_health_score": final_score,
        "status": status,
        "status_key": status_key,
        "status_color": status_color,
        "badge": badge,
        "recovery_trend": recovery_trend,
        "deductions": deductions,
        "improvement_actions": improvement_actions,
        "score_history": score_history,
        "evaluated_at": datetime.utcnow().isoformat(),
        "disclaimer": "Crop Health Score is an algorithmic index calculated from visual lesion severity, weather stress, and scan history. Used as an advisory screening indicator."
    }
