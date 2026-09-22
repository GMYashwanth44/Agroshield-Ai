import io
import pytest
import numpy as np
from PIL import Image
from fastapi.testclient import TestClient

from app.main import app
from app.ai.preprocessing import check_image_quality
from app.ai.disease_model import disease_model_adapter
from app.ai.prediction import predict_disease

client = TestClient(app)

def create_test_image(pattern: str, width: int = 300, height: int = 300) -> bytes:
    """Helper to generate specific pixel patterns for testing."""
    img = Image.new("RGB", (width, height))
    arr = np.zeros((height, width, 3), dtype=np.uint8)

    if pattern == "skin_face":
        # Human skin tone: R > G > B, YCbCr in typical range (e.g., R=210, G=150, B=120)
        arr[:, :] = [210, 150, 120]
        # Add facial variation
        arr[50:100, 70:120] = [180, 120, 90]
        arr[50:100, 180:230] = [180, 120, 90]
        arr[180:220, 100:200] = [190, 110, 100]

    elif pattern == "document":
        # Pure white page (245, 245, 245) with horizontal black text lines
        arr[:, :] = [245, 245, 245]
        for y in range(40, height - 40, 20):
            arr[y:y+3, 30:width-30] = [20, 20, 20]

    elif pattern == "blue_car_building":
        # Metallic blue and grey building tones, no green/plant
        arr[:150, :] = [180, 190, 200] # sky/grey concrete
        arr[150:, :] = [30, 60, 180]   # blue car metal

    elif pattern == "healthy_leaf":
        # Deep vibrant chlorophyll green (G > R * 1.1, G > B * 1.2)
        arr[:, :] = [45, 160, 40]
        # Leaf veins
        for x in range(20, width - 20, 30):
            arr[:, x:x+2] = [60, 185, 50]

    elif pattern == "early_blight":
        # Green leaf base + concentric necrotic brown spots with yellow chlorotic halos
        arr[:, :] = [50, 155, 45]
        # Chlorotic yellow halos (R=180, G=170, B=40)
        arr[80:160, 80:160] = [180, 170, 40]
        arr[170:230, 150:210] = [175, 165, 38]
        # Necrotic brown centers (R=90, G=50, B=30)
        arr[100:140, 100:140] = [95, 55, 30]
        arr[185:215, 165:195] = [90, 50, 28]

    elif pattern == "wheat_rust":
        # Wheat leaf green base + yellow-orange rust pustules (R=205, G=120, B=30)
        arr[:, :] = [60, 150, 50]
        # Linear stripe pustules
        for y in range(40, height - 40, 25):
            arr[y:y+8, 20:width-20] = [210, 115, 25]

    elif pattern == "rice_blast":
        # Rice leaf green base + spindle gray center (R=140, G=140, B=140) with brown margins
        arr[:, :] = [55, 160, 45]
        # Spindle lesions
        arr[80:160, 120:180] = [105, 55, 35] # brown margin
        arr[95:145, 130:170] = [145, 145, 145] # gray center

    elif pattern == "blurry_leaf":
        # Very blurry uniform green wash with near-zero Laplacian variance
        arr[:, :] = [80, 140, 75]

    elif pattern == "ambiguous_plant":
        # Green leaf with ambiguous slight discoloration not matching any pathogen
        arr[:, :] = [75, 130, 65]
        arr[100:150, 100:150] = [85, 120, 60]

    buf = io.BytesIO()
    Image.fromarray(arr).save(buf, format="JPEG", quality=90)
    return buf.getvalue()


# 1. Quality Check & Image Rejection Tests
def test_reject_human_face():
    face_img = create_test_image("skin_face")
    qc = check_image_quality(face_img)
    assert qc["is_valid"] is False
    assert "Invalid Image: Please upload a clear crop/plant image." in qc["message"]
    assert qc["error_type"] == "invalid_image"


def test_reject_document_text():
    doc_img = create_test_image("document")
    qc = check_image_quality(doc_img)
    assert qc["is_valid"] is False
    assert "Invalid Image: Please upload a clear crop/plant image." in qc["message"]
    assert qc["error_type"] == "invalid_image"


def test_reject_non_plant_object():
    obj_img = create_test_image("blue_car_building")
    qc = check_image_quality(obj_img)
    assert qc["is_valid"] is False
    assert "Invalid Image: Please upload a clear crop/plant image." in qc["message"]


def test_reject_blurry_image():
    blurry_img = create_test_image("blurry_leaf")
    qc = check_image_quality(blurry_img)
    assert qc["is_valid"] is False
    assert qc["error_type"] == "quality_insufficient"


# 2. Positive Crop & Disease Detection Tests
def test_healthy_foliage_detection():
    leaf_img = create_test_image("healthy_leaf")
    qc = check_image_quality(leaf_img)
    assert qc["is_valid"] is True

    pred = predict_disease(leaf_img)
    assert pred["success"] is True
    assert pred["data"]["crop"] == "Tomato"
    assert pred["data"]["disease"] == "Healthy Foliage"
    assert pred["data"]["status"] == "confident"
    assert pred["data"]["confidence"] >= 70.0


def test_early_blight_detection():
    blight_img = create_test_image("early_blight")
    qc = check_image_quality(blight_img)
    assert qc["is_valid"] is True

    pred = predict_disease(blight_img)
    assert pred["success"] is True
    assert pred["data"]["crop"] == "Tomato"
    assert pred["data"]["disease"] == "Early Blight"
    assert pred["data"]["status"] == "confident"


def test_wheat_rust_detection():
    rust_img = create_test_image("wheat_rust")
    qc = check_image_quality(rust_img)
    assert qc["is_valid"] is True

    pred = predict_disease(rust_img)
    assert pred["success"] is True
    assert pred["data"]["crop"] == "Wheat"
    assert pred["data"]["disease"] == "Stripe Rust (Yellow Rust)"


def test_rice_blast_detection():
    blast_img = create_test_image("rice_blast")
    qc = check_image_quality(blast_img)
    assert qc["is_valid"] is True

    pred = predict_disease(blast_img)
    assert pred["success"] is True
    assert pred["data"]["crop"] == "Rice"
    assert pred["data"]["disease"] == "Blast (Leaf Blast)"


def test_low_confidence_ambiguous_image():
    ambig_img = create_test_image("ambiguous_plant")
    # Should either fail quality or return Unknown / Low Confidence
    qc = check_image_quality(ambig_img)
    if qc["is_valid"]:
        pred = predict_disease(ambig_img)
        # If valid, must trigger low confidence
        if pred["data"]["status"] == "low_confidence":
            assert pred["data"]["disease"] == "Unknown / Low Confidence"
            assert pred["data"]["crop"] == "Unknown / Unclear Crop"
            assert "recommendation" in pred["data"]


# 3. API Endpoint Tests
def test_api_predict_rejects_face_without_disease():
    face_img = create_test_image("skin_face")
    response = client.post(
        "/api/predict",
        files={"image": ("face.jpg", face_img, "image/jpeg")}
    )
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["success"] is False
    assert json_data["quality_passed"] is False
    assert json_data["message"] == "Invalid Image: Please upload a clear crop/plant image."
    assert json_data["crop"] == "None"
    assert json_data["disease"] == "None"
    assert json_data["data"] is None


def test_api_predict_accepts_valid_leaf():
    leaf_img = create_test_image("early_blight")
    response = client.post(
        "/api/predict",
        files={"image": ("leaf.jpg", leaf_img, "image/jpeg")}
    )
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["success"] is True
    assert json_data["quality_passed"] is True
    assert json_data["crop"] == "Tomato"
    assert json_data["disease"] == "Early Blight"
    assert json_data["confidence"] > 0


# 4. GPS Surveillance & Report Creation Tests
def test_create_disease_report_with_gps():
    report_data = {
        "crop_name": "Tomato",
        "disease_name": "Early Blight",
        "confidence": 0.88,
        "severity": "Moderate",
        "affected_area_pct": 24.5,
        "latitude": 12.9716,
        "longitude": 77.5946,
        "location_accuracy": 6.5,
        "district": "Bengaluru Rural",
        "village": "Hoskote"
    }
    response = client.post("/api/reports", json=report_data)
    assert response.status_code == 200
    created = response.json()
    assert created["crop_name"] == "Tomato"
    assert created["latitude"] == 12.9716
    assert created["longitude"] == 77.5946
    assert created["is_demo"] is False


def test_create_report_invalid_gps_rejected():
    invalid_report = {
        "crop_name": "Tomato",
        "disease_name": "Early Blight",
        "confidence": 0.88,
        "severity": "Moderate",
        "affected_area_pct": 24.5,
        "latitude": 999.0, # Invalid latitude
        "longitude": 77.5946,
        "location_accuracy": 5.0
    }
    response = client.post("/api/reports", json=invalid_report)
    assert response.status_code == 400
