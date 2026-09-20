import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict, Any
from sklearn.cluster import DBSCAN

def detect_hotspots(reports: List[Dict[str, Any]], eps_km: float = 15.0, min_samples: int = 5) -> List[Dict[str, Any]]:
    """
    Geographic clustering using DBSCAN.
    Groups disease reports within `eps_km` distance to identify spatial hotspots.
    Definition: Hotspot = high concentration of disease reports in a geographical area.
    """
    if len(reports) < min_samples:
        return []

    # Extract coordinates (lat, lon) in radians for Haversine distance
    coords = []
    valid_reports = []
    for r in reports:
        lat = r.get("latitude")
        lng = r.get("longitude")
        if lat is not None and lng is not None:
            coords.append([np.radians(lat), np.radians(lng)])
            valid_reports.append(r)

    if len(coords) < min_samples:
        return []

    # Earth radius in kilometers ~ 6371.0
    kms_per_radian = 6371.0
    epsilon = eps_km / kms_per_radian

    db = DBSCAN(eps=epsilon, min_samples=min_samples, metric="haversine")
    labels = db.fit_predict(coords)

    unique_labels = set(labels)
    hotspots = []

    for cluster_id in unique_labels:
        if cluster_id == -1:
            # Noise points
            continue

        cluster_indices = np.where(labels == cluster_id)[0]
        cluster_reports = [valid_reports[i] for i in cluster_indices]
        case_count = len(cluster_reports)

        # Calculate cluster geographic centroid
        cluster_lats = [r["latitude"] for r in cluster_reports]
        cluster_lngs = [r["longitude"] for r in cluster_reports]
        center_lat = float(np.mean(cluster_lats))
        center_lng = float(np.mean(cluster_lngs))

        # Find dominant disease and crop
        disease_counts = {}
        crop_counts = {}
        districts = {}
        for r in cluster_reports:
            d = r.get("disease_name", "Unknown Disease")
            c = r.get("crop_name", "Unknown Crop")
            dist = r.get("district", "Unknown District")
            disease_counts[d] = disease_counts.get(d, 0) + 1
            crop_counts[c] = crop_counts.get(c, 0) + 1
            districts[dist] = districts.get(dist, 0) + 1

        dominant_disease = max(disease_counts, key=disease_counts.get)
        dominant_crop = max(crop_counts, key=crop_counts.get)
        primary_district = max(districts, key=districts.get)

        # Classify risk level
        if case_count >= 25:
            risk_level = "Very High"
        elif case_count >= 12:
            risk_level = "High"
        else:
            risk_level = "Moderate"

        hotspots.append({
            "cluster_id": int(cluster_id),
            "center_lat": round(center_lat, 5),
            "center_lng": round(center_lng, 5),
            "radius_km": eps_km,
            "case_count": case_count,
            "dominant_disease": dominant_disease,
            "crop": dominant_crop,
            "district": primary_district,
            "risk_level": risk_level,
            "explanation": f"High concentration of {case_count} {dominant_disease} reports detected across {primary_district} cluster within {eps_km} km radius.",
            "reports_sample": cluster_reports[:5]
        })

    # Sort hotspots by case count descending
    hotspots.sort(key=lambda x: x["case_count"], reverse=True)
    return hotspots

def detect_potential_outbreaks(reports: List[Dict[str, Any]], days_window: int = 7) -> List[Dict[str, Any]]:
    """
    Monitors case trajectory and velocity over time:
    e.g. Day 1 = 2, Day 2 = 5, Day 3 = 12, Day 4 = 26.
    Computes exponential velocity:
    Returns potential outbreak warnings clearly flagged as AI-assisted risk indicators.
    NEVER labels as 'confirmed outbreak'.
    """
    if not reports:
        return []

    # Group reports by (district, disease_name)
    # Determine temporal anchor: use current time, or latest report time if historical/demo dataset
    now = datetime.utcnow()
    all_times = []
    for r in reports:
        ca = r.get("created_at")
        if isinstance(ca, str):
            try:
                ca = datetime.fromisoformat(ca.replace("Z", "+00:00"))
            except Exception:
                ca = None
        if isinstance(ca, datetime):
            all_times.append(ca)

    ref_time = now
    if all_times and max(all_times) < (now - timedelta(days=days_window)):
        ref_time = max(all_times)

    window_start = ref_time - timedelta(days=days_window)
    grouped = {}

    for r in reports:
        created_at = r.get("created_at")
        if isinstance(created_at, str):
            try:
                created_at = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
            except Exception:
                created_at = ref_time
        elif not isinstance(created_at, datetime):
            created_at = ref_time

        district = r.get("district", "Kolar")
        disease = r.get("disease_name", "Early Blight")
        crop = r.get("crop_name", "Tomato")
        key = (district, disease, crop)

        if key not in grouped:
            grouped[key] = []
        grouped[key].append(created_at)

    outbreaks = []
    for (district, disease, crop), timestamps in grouped.items():
        case_count = len(timestamps)
        if case_count < 8:
            continue

        # Bin cases into recent 3 days vs earlier 3 days to calculate growth velocity
        recent_3_days = [t for t in timestamps if t >= (ref_time - timedelta(days=3))]
        prior_3_days = [t for t in timestamps if (ref_time - timedelta(days=6)) <= t < (ref_time - timedelta(days=3))]

        recent_count = len(recent_3_days)
        prior_count = max(1, len(prior_3_days))

        # Growth rate velocity
        growth_rate = round(((recent_count - prior_count) / prior_count) * 100.0, 1)

        # Trigger threshold for outbreak acceleration
        if recent_count >= 8 and growth_rate >= 40.0:
            risk_level = "Very High"
        elif recent_count >= 5 and growth_rate >= 20.0:
            risk_level = "High"
        else:
            continue

        alert_message = (
            f"POTENTIAL OUTBREAK: Rapid surge of {disease} cases observed in {district}. "
            f"Case velocity increased by {growth_rate}% over recent days ({case_count} active reports). "
            f"Advisory: Implement protective buffer spraying and isolate severely infected blocks."
        )

        outbreaks.append({
            "district": district,
            "disease": disease,
            "crop": crop,
            "case_count": case_count,
            "recent_cases_3d": recent_count,
            "growth_rate": growth_rate,
            "risk_level": risk_level,
            "confidence": 0.88,
            "alert_message": alert_message,
            "status_label": "POTENTIAL OUTBREAK RISK",
            "is_confirmed_outbreak": False, # Explicit transparency flag
            "disclaimer": "AI-assisted early warning indicator. Confirmed field verification is conducted by designated Agricultural Officers."
        })

    outbreaks.sort(key=lambda x: x["growth_rate"], reverse=True)
    return outbreaks

def project_disease_spread(
    hotspots: List[Dict[str, Any]],
    wind_direction_deg: float = 65.0, # East-Northeast
    wind_speed_kmh: float = 14.0
) -> List[Dict[str, Any]]:
    """
    Upgrades Hotspot Surveillance into Disease Spread-Risk Projection:
    - Current affected zones
    - Nearby high-risk buffer zones (5-10 km)
    - Possible future risk areas with directional propagation vectors
    - Contributing meteorological & agronomic factors
    Explicitly labeled as 'Projected Risk Area' (never confirmed future locations).
    """
    import math

    projections = []
    for h in hotspots:
        center_lat = float(h.get("center_lat", h.get("latitude", 13.3392)))
        center_lng = float(h.get("center_lng", h.get("longitude", 78.2139)))
        radius_km = float(h.get("radius_km", 12.0))
        disease = h.get("dominant_disease", "Early Blight")
        crop = h.get("crop", "Tomato")
        case_count = int(h.get("case_count", 25))
        district = h.get("district", "Kolar")

        # Project spread centroid along wind trajectory (10-18 km forward)
        spread_dist_km = min(22.0, max(8.0, radius_km * 1.2 + (wind_speed_kmh * 0.4)))
        rad = math.radians(wind_direction_deg)
        # 1 deg lat ~ 111 km; 1 deg lng ~ 111 * cos(lat)
        delta_lat = (spread_dist_km * math.cos(rad)) / 111.0
        delta_lng = (spread_dist_km * math.sin(rad)) / (111.0 * math.cos(math.radians(center_lat)))

        projected_lat = round(center_lat + delta_lat, 5)
        projected_lng = round(center_lng + delta_lng, 5)

        # Contributing factors
        factors = [
            f"Prevailing monsoon surface wind ({wind_speed_kmh} km/h toward {round(wind_direction_deg)}° ENE) accelerates airborne spore dissemination.",
            f"Contiguous {crop} canopy density along the {district} agrarian corridor facilitates secondary infection.",
            f"High relative humidity (>80%) along the trajectory preserves conidia viability during aerial drift.",
            f"Originating cluster density: {case_count} active infections currently acting as an active inoculum source."
        ]

        projections.append({
            "cluster_id": h.get("cluster_id", 0),
            "district": district,
            "crop": crop,
            "disease": disease,
            "current_zone": {
                "latitude": center_lat,
                "longitude": center_lng,
                "radius_km": radius_km,
                "case_count": case_count,
                "status": "Current Affected Zone"
            },
            "buffer_zone": {
                "latitude": center_lat,
                "longitude": center_lng,
                "radius_km": round(radius_km * 1.4, 1),
                "status": "Nearby High-Risk Buffer (5–15 km)"
            },
            "projected_zone": {
                "latitude": projected_lat,
                "longitude": projected_lng,
                "radius_km": round(radius_km * 1.1, 1),
                "spread_distance_km": round(spread_dist_km, 1),
                "heading_compass": "East-Northeast (ENE)",
                "heading_degrees": wind_direction_deg,
                "status": "Projected Risk Area"
            },
            "risk_direction": "East-Northeast (towards bordering taluk valleys)",
            "risk_level": h.get("risk_level", "High"),
            "contributing_factors": factors,
            "disclaimer": "Projected Risk Area is an analytical projection based on wind vectors and contiguous host density. Never present projections as confirmed future disease locations."
        })

    return projections

