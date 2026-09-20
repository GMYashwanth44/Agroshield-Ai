from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    role: str
    full_name: str
    preferred_lang: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserRegister(BaseModel):
    email: str
    password: str
    full_name: str
    role: str = "farmer" # farmer, officer
    phone: Optional[str] = None
    preferred_lang: str = "en"
    village: Optional[str] = "Kolar Rural"
    district: Optional[str] = "Kolar"
    state: Optional[str] = "Karnataka"

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    phone: Optional[str]
    preferred_lang: str
    created_at: datetime

    class Config:
        from_attributes = True

# Quality Check
class QualityCheckResponse(BaseModel):
    is_valid: bool
    message: str
    issues: List[str]
    metrics: Dict[str, Any]

# Prediction
class PredictionResponse(BaseModel):
    crop: str
    disease: str
    pathogen: str
    confidence: float
    confidence_pct: float
    status: str
    is_low_confidence: bool
    severity: str
    severity_key: str
    affected_area_pct: float
    color_hex: str
    mask_data_uri: Optional[str]
    symptoms: str
    recommendations: Dict[str, str]
    suggested_product_categories: List[str]
    ai_disclaimer: str
    model_architecture: str

# Disease Report
class DiseaseReportCreate(BaseModel):
    crop_name: str
    disease_name: str
    confidence: float
    severity: str
    affected_area_pct: float
    latitude: float
    longitude: float
    location_accuracy: Optional[float] = 10.0
    district: Optional[str] = "Kolar"
    village: Optional[str] = "Srinivaspur"
    image_url: Optional[str] = None
    mask_url: Optional[str] = None
    farmer_notes: Optional[str] = None
    is_offline: Optional[bool] = False

class DiseaseReportResponse(BaseModel):
    id: int
    crop_name: str
    disease_name: str
    confidence: float
    severity: str
    affected_area_pct: float
    status: str
    latitude: float
    longitude: float
    district: Optional[str]
    village: Optional[str]
    image_url: Optional[str]
    mask_url: Optional[str]
    farmer_notes: Optional[str]
    officer_diagnosis: Optional[str]
    officer_comments: Optional[str]
    is_offline: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Expert Review
class ExpertReviewCreate(BaseModel):
    report_id: int
    decision: str # verified, rejected, more_info_requested
    confirmed_diagnosis: str
    comments: str
    recommended_action: Optional[str] = None

# Hotspots & Outbreaks
class HotspotResponse(BaseModel):
    cluster_id: int
    center_lat: float
    center_lng: float
    radius_km: float
    case_count: int
    dominant_disease: str
    crop: str
    district: str
    risk_level: str
    explanation: str

class OutbreakAlertResponse(BaseModel):
    district: str
    disease: str
    crop: str
    case_count: int
    recent_cases_3d: int
    growth_rate: float
    risk_level: str
    confidence: float
    alert_message: str
    status_label: str
    disclaimer: str

# Soil & Advisory
class SoilAnalysisRequest(BaseModel):
    ph: float
    nitrogen: float
    phosphorus: float
    potassium: float
    organic_carbon: float
    electrical_conductivity: Optional[float] = 0.5
    field_name: Optional[str] = "Plot 1"

class CropRecommendationRequest(BaseModel):
    soil_type: str
    water_availability: str # low, moderate, high
    season: str # kharif, rabi, summer
    previous_crop: Optional[str] = None
    district: Optional[str] = "Kolar"

# Marketplace
class CartItemAdd(BaseModel):
    product_id: int
    quantity: int = 1

class OrderCreate(BaseModel):
    delivery_type: str = "delivery" # delivery, pickup
    shipping_address: Optional[str] = None
    pickup_location: Optional[str] = None

# Voice
class VoiceQueryRequest(BaseModel):
    query: str
    language: str = "en"


