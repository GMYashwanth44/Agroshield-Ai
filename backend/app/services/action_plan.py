"""
Personalized 7-Day Crop Action Plan Engine.
Generates tailored, agronomically sound daily recovery and eradication
milestones customized to crop type, identified disease, severity stage,
and regional microclimate risk.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta

CROP_ACTION_TEMPLATES: Dict[str, Dict[str, Any]] = {
    "Early Blight": {
        "chemical_bio": "Trichoderma viride @ 5g/L or Copper Oxychloride 50 WP @ 2.5g/L",
        "secondary_bio": "Neem oil 10,000 ppm @ 2-3 ml/L with mild surfactant",
        "pruning_target": "lower 3–4 sets of infected foliage showing concentric target spots",
        "irrigation_rule": "Cease overhead sprinklers; switch strictly to morning drip irrigation",
        "nutrient_tip": "Potassium sulfate (0-0-50) @ 4g/L foliar spray to reinforce epidermal cell walls"
    },
    "Late Blight": {
        "chemical_bio": "Metalaxyl 8% + Mancozeb 64% WP @ 2.5g/L or Dimethomorph 50% WP @ 1g/L",
        "secondary_bio": "Bacillus subtilis strain QST 713 bio-protectant",
        "pruning_target": "entire necrotic stems and water-soaked leaflets immediately into sealed bags",
        "irrigation_rule": "Zero canopy wetness; ensure maximum inter-row airflow",
        "nutrient_tip": "Foliar phosphonate or potassium silicate to stimulate plant systemic acquired resistance (SAR)"
    },
    "Leaf Blast": {
        "chemical_bio": "Tricyclazole 75% WP @ 0.6g/L or Kasugamycin 3% SL @ 2ml/L",
        "secondary_bio": "Pseudomonas fluorescens @ 5g/kg or 10g/L spray",
        "pruning_target": "diseased spindle lesions and heavily dried leaf tips",
        "irrigation_rule": "Drain excess standing field water for 48h to oxygenate root zone",
        "nutrient_tip": "Avoid nitrogen top-dressing; apply silicon fertilizer @ 100 kg/ha equivalent"
    },
    "Bacterial Blight": {
        "chemical_bio": "Streptocycline @ 0.1g/L + Copper Oxychloride @ 2g/L",
        "secondary_bio": "Pseudomonas fluorescens 1% WP @ 5g/L",
        "pruning_target": "oozing water-soaked bacterial lesions during dry morning hours",
        "irrigation_rule": "Avoid walking through wet foliage to prevent mechanical bacterial transmission",
        "nutrient_tip": "Balanced zinc and potash spray; zero fresh nitrogen application"
    },
    "Healthy": {
        "chemical_bio": "Prophylactic botanical neem extract (1500 ppm @ 3ml/L)",
        "secondary_bio": "Liquid bio-fertilizer foliar spray (Azospirillum / PSB)",
        "pruning_target": "senescent yellow bottom leaves to improve canopy aeration",
        "irrigation_rule": "Maintain regular scheduled irrigation without waterlogging",
        "nutrient_tip": "Regular balanced NPK 19-19-19 water soluble fertilizer @ 3g/L"
    }
}

DEFAULT_TEMPLATE = {
    "chemical_bio": "Bio-fungicide (Trichoderma viride / Bacillus subtilis) @ 5g/L",
    "secondary_bio": "Cold-pressed neem oil formulation @ 3ml/L",
    "pruning_target": "all diseased leaves with visible necrotic tissue",
    "irrigation_rule": "Transition to ground-level drip; avoid wetting foliage",
    "nutrient_tip": "Potassium-rich foliar feed to strengthen leaf tissues"
}


def generate_7day_action_plan(
    crop: str,
    disease: str,
    severity: str,
    future_risk: str = "MEDIUM",
    district: str = "Kolar"
) -> Dict[str, Any]:
    """
    Generate a personalized 7-day action protocol.
    """
    is_healthy = "healthy" in disease.lower() or "healthy" in severity.lower()
    tpl = CROP_ACTION_TEMPLATES.get(disease, DEFAULT_TEMPLATE)
    if is_healthy:
        tpl = CROP_ACTION_TEMPLATES["Healthy"]

    urgency_tag = "URGENT" if severity == "Severe" or future_risk == "HIGH" else "STANDARD"

    days = [
        {
            "day_number": 1,
            "phase": "Immediate Triage & Sanitation" if not is_healthy else "Canopy Inspection",
            "title": f"Mechanical Pruning & Spore Quarantine ({crop})" if not is_healthy else "Field Inspection & Baseline Sanitation",
            "action": (
                f"Carefully remove {tpl['pruning_target']} using disinfected shears. "
                f"Immediately bag and dispose away from plots to halt local spore dispersal."
                if not is_healthy else
                f"Inspect canopy of {crop} for any hidden pests or early discoloration. Remove older yellowing leaves at base."
            ),
            "critical_instruction": "Sterilize shears with 70% alcohol or 1% sodium hypochlorite solution between each crop row.",
            "estimated_points_gain": 8 if not is_healthy else 3,
            "equipment_needed": ["Sterilized shears/secateurs", "Disposal trash bag", "Protective gloves"],
            "completed": False
        },
        {
            "day_number": 2,
            "phase": "Targeted Treatment" if not is_healthy else "Prophylactic Barrier",
            "title": f"Primary Protective Spray Application",
            "action": (
                f"Spray {tpl['chemical_bio']} during early morning (6:30 AM – 9:00 AM) or overcast hours. "
                f"Ensure complete coverage of both upper leaf surfaces and undersides."
                if not is_healthy else
                f"Apply prophylactic {tpl['chemical_bio']} to establish a bio-protective shield against ambient pathogens."
            ),
            "critical_instruction": "Wear face mask and safety goggles. Never spray directly against prevailing wind direction.",
            "estimated_points_gain": 12 if not is_healthy else 4,
            "equipment_needed": ["Knapsack / battery sprayer", "N95 safety mask", "Measuring cylinder"],
            "completed": False
        },
        {
            "day_number": 3,
            "phase": "Microclimate & Irrigation Adjustment",
            "title": "Leaf Wetness Reduction Protocol",
            "action": (
                f"{tpl['irrigation_rule']}. Weed canopy perimeters to improve cross-ventilation and drop micro-humidity."
            ),
            "critical_instruction": "Avoid any evening overhead irrigation. Leaves must go into the night dry to prevent fungal germination.",
            "estimated_points_gain": 5 if not is_healthy else 3,
            "equipment_needed": ["Drip lateral inspection tool", "Hand weeder"],
            "completed": False
        },
        {
            "day_number": 4,
            "phase": "Nutritional Resilience",
            "title": "Foliar Tissue Hardening & Micronutrients",
            "action": (
                f"Apply {tpl['nutrient_tip']}. Strengthens cell walls and stimulates systemic resistance against necrotic expansion."
            ),
            "critical_instruction": "Do not apply excess synthetic nitrogen (Urea) at this stage as succulent soft tissue invites re-infection.",
            "estimated_points_gain": 6 if not is_healthy else 4,
            "equipment_needed": ["Clean sprayer tank", "Foliar nutrient solution"],
            "completed": False
        },
        {
            "day_number": 5,
            "phase": "Mid-Cycle AgroShield Diagnostic",
            "title": "Interim Camera Rescan & Lesion Audit",
            "action": (
                f"Use AgroShield camera to capture a new photo of previously tagged infected leaves. "
                f"Inspect whether lesion edges have dried into inactive dark borders or continue expanding."
            ),
            "critical_instruction": (
                "If disease coverage has grown despite Days 1-3 sprays, request immediate Agricultural Officer field consultation."
                if not is_healthy else
                "Verify healthy green vigor rating. Take a digital diary snapshot for seasonal crop health tracking."
            ),
            "estimated_points_gain": 4 if not is_healthy else 3,
            "equipment_needed": ["AgroShield Smartphone App", "Reference plant tag"],
            "completed": False
        },
        {
            "day_number": 6,
            "phase": "Secondary Biological Shield",
            "title": "Organic Spore Suppressant Spray",
            "action": (
                f"Apply {tpl['secondary_bio']} in late afternoon (after 4:30 PM) to eliminate remaining secondary spores."
            ),
            "critical_instruction": "Do not spray during peak midday sunshine (12:00-3:00 PM) to avoid leaf scorching.",
            "estimated_points_gain": 5 if not is_healthy else 3,
            "equipment_needed": ["Sprayer with fine atomizing nozzle"],
            "completed": False
        },
        {
            "day_number": 7,
            "phase": "Final Recovery Evaluation",
            "title": "Full Field Rescan & Recovery Audit",
            "action": (
                f"Perform comprehensive follow-up AgroShield scan. "
                f"The system will compute your Before vs After Crop Recovery Progress and update your permanent Crop Diary."
            ),
            "critical_instruction": (
                "If Health Score gained >12 points and lesions are dry, mark protocol as RESOLVED. If symptoms persist, escalate to District Krishi Vigyan Kendra (KVK)."
                if not is_healthy else
                "Congratulations! Full 7-day protective regime complete. Maintain routine weekly scans."
            ),
            "estimated_points_gain": 10 if not is_healthy else 5,
            "equipment_needed": ["AgroShield App", "Field diary log"],
            "completed": False
        }
    ]

    total_potential_gain = sum(d["estimated_points_gain"] for d in days)

    return {
        "crop": crop,
        "disease": disease,
        "severity": severity,
        "district": district,
        "urgency": urgency_tag,
        "summary": f"7-Day Scientific Protocol for {disease} in {crop}",
        "expected_duration_days": 7,
        "potential_health_gain": total_potential_gain,
        "days": days,
        "disclaimer": "AI-guided agronomic advisory based on Indian Council of Agricultural Research (ICAR) field guidelines."
    }
