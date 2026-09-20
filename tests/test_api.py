import io
import pytest
import numpy as np
from PIL import Image
from fastapi.testclient import TestClient
from app.main import app
from app.database.seed_data import seed_database

# Ensure database is seeded
seed_database()

client = TestClient(app)

def create_dummy_leaf_image(size=(250, 250)):
    """Creates a textured RGB leaf image with brown spots to pass quality checks."""
    arr = np.zeros((size[0], size[1], 3), dtype=np.uint8)
    arr[:, :, 1] = 135 # Green foliage
    arr[:, :, 0] = 50  # Red
    arr[:, :, 2] = 30  # Blue
    
    # Add realistic texture noise so blur variance passes
    np.random.seed(42)
    noise = np.random.randint(-25, 25, (size[0], size[1], 3))
    arr = np.clip(arr.astype(np.int16) + noise, 0, 255).astype(np.uint8)
    
    # Add necrotic brown spot in center
    arr[70:170, 70:170, 0] = 110
    arr[70:170, 70:170, 1] = 65
    arr[70:170, 70:170, 2] = 20

    img = Image.fromarray(arr)
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=90)
    buf.seek(0)
    return buf

def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "AgroShield" in data["app"]

def test_quality_check_pass():
    img_buf = create_dummy_leaf_image()
    response = client.post(
        "/api/check-quality",
        files={"image": ("test_leaf.jpg", img_buf, "image/jpeg")}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["is_valid"] is True
    assert "metrics" in data

def test_predict_disease():
    img_buf = create_dummy_leaf_image()
    response = client.post(
        "/api/predict",
        files={"image": ("tomato_leaf.jpg", img_buf, "image/jpeg")}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "crop" in data["data"]
    assert "disease" in data["data"]
    assert "confidence" in data["data"]
    assert "severity" in data["data"]
    assert "recommendations" in data["data"]

def test_severity_estimation():
    img_buf = create_dummy_leaf_image()
    response = client.post(
        "/api/severity",
        files={"image": ("leaf.jpg", img_buf, "image/jpeg")}
    )
    assert response.status_code == 200
    data = response.json()
    assert "affected_area_pct" in data
    assert "severity_level" in data

def test_statistics():
    response = client.get("/api/statistics")
    assert response.status_code == 200
    data = response.json()
    assert data["total_reports"] >= 1000
    assert "disease_breakdown" in data
    assert "crop_breakdown" in data

def test_outbreak_alerts():
    response = client.get("/api/outbreaks")
    assert response.status_code == 200
    data = response.json()
    assert "alerts" in data
    assert len(data["alerts"]) > 0
    assert data["alerts"][0]["status_label"] == "POTENTIAL OUTBREAK RISK"

def test_hotspots():
    response = client.get("/api/hotspots")
    assert response.status_code == 200
    data = response.json()
    assert "hotspots" in data
    assert data["total_hotspots"] > 0

def test_marketplace_products():
    response = client.get("/api/marketplace/products")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert "title" in data[0]
    assert "price" in data[0]

def test_voice_assistant_multilingual():
    # Test Kannada voice query
    kn_resp = client.post(
        "/api/voice-query",
        json={"query": "ಟೊಮೇಟೊ ಎಲೆ ಕಂದು ಬಣ್ಣಕ್ಕೆ ತಿರುಗುತ್ತಿದೆ", "language": "kn"}
    )
    assert kn_resp.status_code == 200
    assert "ಅರ್ಲಿ ಬ್ಲೈಟ್" in kn_resp.json()["answer"]

    # Test English voice query
    en_resp = client.post(
        "/api/voice-query",
        json={"query": "My tomato leaves have brown spots", "language": "en"}
    )
    assert en_resp.status_code == 200
    assert "Early Blight" in en_resp.json()["answer"]
