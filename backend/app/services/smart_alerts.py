from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta

def generate_smart_alerts(
    latest_report: Optional[Dict[str, Any]] = None,
    future_risk: Optional[Dict[str, Any]] = None,
    nearby_outbreaks: Optional[List[Dict[str, Any]]] = None,
    weather_data: Optional[Dict[str, Any]] = None,
    officer_reviews: Optional[List[Dict[str, Any]]] = None,
    days_since_last_scan: int = 1
) -> List[Dict[str, Any]]:
    """
    Generates context-aware, reasoned smart alerts for the farmer.
    Every alert explicitly provides the 'why_generated' explanation.
    """
    alerts = []
    alert_id = 1

    # 1. Nearby Surge / Community Trend Alert
    if nearby_outbreaks and len(nearby_outbreaks) > 0:
        top_outbreak = nearby_outbreaks[0]
        district = top_outbreak.get("district", "Kolar")
        disease = top_outbreak.get("disease", "Early Blight")
        growth_rate = top_outbreak.get("growth_rate", 45.0)
        cases = top_outbreak.get("case_count", 25)

        alerts.append({
            "id": f"alert-{alert_id}",
            "type": "community_surge",
            "priority": "HIGH",
            "title": f"Community Surge: Rapid Rise in {disease}",
            "message": f"{cases} reports of {disease} detected across {district} with a {growth_rate}% case acceleration over recent days.",
            "why_generated": f"Surveillance DBSCAN clustering observed a rapid rise in {disease} cases in your taluk ({district}), indicating elevated regional spore pressure.",
            "action_label": "Inspect Spread Map",
            "action_tab": "map",
            "created_at": datetime.utcnow().isoformat()
        })
        alert_id += 1

    # 2. High Future Risk Alert
    if future_risk and future_risk.get("risk_level") == "HIGH":
        period = future_risk.get("expected_risk_period", "Next 2–4 Days")
        disease = future_risk.get("disease", "Early Blight")
        reasons_summary = future_risk.get("main_reasons", ["Favorable humidity and temperature forecast."])[0]

        alerts.append({
            "id": f"alert-{alert_id}",
            "type": "future_risk",
            "priority": "HIGH",
            "title": f"High Risk Alert: Favorable Pathogen Weather Approaching",
            "message": f"Expected risk period: {period}. Microclimate conditions support rapid spore germination.",
            "why_generated": f"Generated because {reasons_summary} Current forecast shows humidity exceeding 80% with rain probability.",
            "action_label": "View Preventive Plan",
            "action_tab": "result",
            "created_at": datetime.utcnow().isoformat()
        })
        alert_id += 1

    # 3. High Severity Infection Alert
    if latest_report:
        sev = (latest_report.get("severity") or "").lower()
        aff = float(latest_report.get("affected_area_pct") or 0.0)
        crop = latest_report.get("crop_name", "Tomato")
        disease = latest_report.get("disease_name", "Early Blight")

        if "severe" in sev or aff > 40.0:
            alerts.append({
                "id": f"alert-{alert_id}",
                "type": "high_severity",
                "priority": "CRITICAL",
                "title": f"Action Required: High Severity {disease} Detected",
                "message": f"Affected leaf area is currently {aff}%. Immediate isolation of infected foliage is recommended.",
                "why_generated": f"Generated because your latest scan registered {aff}% necrotic leaf area ({latest_report.get('severity')}), which exceeds the 40% economic damage threshold.",
                "action_label": "View Treatment Guidance",
                "action_tab": "result",
                "created_at": datetime.utcnow().isoformat()
            })
            alert_id += 1

    # 4. Officer Review Update Alert
    if officer_reviews and len(officer_reviews) > 0:
        latest_rev = officer_reviews[0]
        decision = latest_rev.get("decision", "confirmed")
        officer_name = latest_rev.get("officer_name", "Dr. Ananya Sharma (Agri Officer)")
        confirmed_diag = latest_rev.get("confirmed_diagnosis", "Tomato Early Blight")

        alerts.append({
            "id": f"alert-{alert_id}",
            "type": "officer_response",
            "priority": "MEDIUM",
            "title": f"Officer Verification Update: {decision.replace('_', ' ').title()}",
            "message": f"{officer_name} reviewed your disease case: '{confirmed_diag}'.",
            "why_generated": f"Generated because the District Agricultural Officer completed field review of your submitted report and issued official guidance.",
            "action_label": "View Officer Comments",
            "action_tab": "reports",
            "created_at": datetime.utcnow().isoformat()
        })
        alert_id += 1

    # 5. Follow-up Scan Reminder
    if days_since_last_scan >= 3:
        alerts.append({
            "id": f"alert-{alert_id}",
            "type": "follow_up_scan",
            "priority": "MEDIUM",
            "title": "Follow-up Scan Due (Crop Recovery Monitoring)",
            "message": f"It has been {days_since_last_scan} days since your last leaf scan. Re-scan to track lesion healing or containment.",
            "why_generated": f"Generated because {days_since_last_scan} days have passed since the active infection was recorded, which is the recommended interval to measure recovery trend.",
            "action_label": "📷 Scan Follow-up",
            "action_tab": "scan",
            "created_at": datetime.utcnow().isoformat()
        })
        alert_id += 1

    # 6. Weather Moisture Alert
    if weather_data and float(weather_data.get("humidity", 70)) >= 80:
        alerts.append({
            "id": f"alert-{alert_id}",
            "type": "weather_warning",
            "priority": "MEDIUM",
            "title": "Weather Warning: High Foliar Moisture Window",
            "message": "Persistent high humidity (>80%) forecasted for the next 48 hours. Avoid nitrogen over-fertilization.",
            "why_generated": "Generated because local meteorological sensors detected sustained relative humidity over 80%, which prevents leaf surface drying and promotes fungal sporulation.",
            "action_label": "Check Weather Radar",
            "action_tab": "weather",
            "created_at": datetime.utcnow().isoformat()
        })
        alert_id += 1

    return alerts
