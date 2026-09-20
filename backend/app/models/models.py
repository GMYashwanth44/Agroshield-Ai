from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
)
from sqlalchemy.orm import relationship
from app.database.session import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="farmer", nullable=False) # farmer, officer, admin
    phone = Column(String(20), nullable=True)
    preferred_lang = Column(String(10), default="en") # en, kn, hi, mr, te, ta
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    farmer_profile = relationship("FarmerProfile", back_populates="user", uselist=False)
    officer_profile = relationship("OfficerProfile", back_populates="user", uselist=False)
    reports = relationship("DiseaseReport", foreign_keys="[DiseaseReport.farmer_id]", back_populates="farmer")
    orders = relationship("Order", back_populates="user")
    cart_items = relationship("CartItem", back_populates="user")
    notifications = relationship("Notification", back_populates="user")

class FarmerProfile(Base):
    __tablename__ = "farmer_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    village = Column(String(100), default="Kolar Rural")
    district = Column(String(100), default="Kolar")
    state = Column(String(100), default="Karnataka")
    land_size_acres = Column(Float, default=4.5)

    user = relationship("User", back_populates="farmer_profile")

class OfficerProfile(Base):
    __tablename__ = "officer_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    badge_number = Column(String(50), default="KA-AGRI-0482")
    jurisdiction_district = Column(String(100), default="Kolar")
    department = Column(String(150), default="Department of Agriculture & Farmers Welfare")

    user = relationship("User", back_populates="officer_profile")

class Crop(Base):
    __tablename__ = "crops"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True)
    scientific_name = Column(String(150))
    category = Column(String(50)) # Vegetable, Cereal, Cash Crop, Fruit
    optimal_season = Column(String(100))
    description = Column(Text)
    icon = Column(String(100))

    diseases = relationship("Disease", back_populates="crop")

class Disease(Base):
    __tablename__ = "diseases"

    id = Column(Integer, primary_key=True, index=True)
    crop_id = Column(Integer, ForeignKey("crops.id"))
    name = Column(String(150), index=True)
    scientific_name = Column(String(150))
    pathogen_type = Column(String(50)) # Fungal, Bacterial, Viral, Nutrient
    symptoms = Column(Text)
    severity_risk = Column(String(50)) # Low, Moderate, High

    crop = relationship("Crop", back_populates="diseases")
    recommendations = relationship("Recommendation", back_populates="disease")

class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    disease_id = Column(Integer, ForeignKey("diseases.id"))
    cultural_practices = Column(Text) # Pruning, spacing, water management
    organic_control = Column(Text)    # Neem oil, Trichoderma, bio-fungicides
    chemical_guidance = Column(Text)  # Approved CIBRC guidelines & label safety
    safety_disclaimer = Column(Text)  # Statutory disclaimer
    product_category_links = Column(String(255)) # Associated marketplace category IDs

    disease = relationship("Disease", back_populates="recommendations")

class DiseaseReport(Base):
    __tablename__ = "disease_reports"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("users.id"))
    crop_name = Column(String(100), index=True)
    disease_name = Column(String(150), index=True)
    confidence = Column(Float)          # 0.0 to 1.0 (e.g. 0.947 = 94.7%)
    severity = Column(String(50))        # Healthy, Mild, Moderate, Severe
    affected_area_pct = Column(Float)   # e.g. 37.0%
    status = Column(String(50), default="pending") # pending, verified, rejected, more_info
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    location_accuracy = Column(Float, default=10.0) # In meters
    district = Column(String(100), index=True)
    village = Column(String(100))
    image_url = Column(String(500))
    mask_url = Column(String(500), nullable=True)
    farmer_notes = Column(Text, nullable=True)
    officer_diagnosis = Column(String(150), nullable=True)
    officer_comments = Column(Text, nullable=True)
    officer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    is_offline = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Differentiating Features V2 Extensions
    crop_health_score = Column(Float, nullable=True) # 0 to 100
    future_risk_level = Column(String(50), nullable=True) # LOW, MEDIUM, HIGH
    parent_report_id = Column(Integer, ForeignKey("disease_reports.id"), nullable=True) # For Before vs After recovery monitoring
    review_stage = Column(String(50), default="pending") # pending, confirmed, needs_info, different_diagnosis, resolved
    officer_override_disease = Column(String(150), nullable=True)

    farmer = relationship("User", foreign_keys=[farmer_id], back_populates="reports")
    officer = relationship("User", foreign_keys=[officer_id])
    reviews = relationship("ExpertReview", back_populates="report")
    follow_up_reports = relationship("DiseaseReport", foreign_keys=[parent_report_id], remote_side=[id])

class ExpertReview(Base):
    __tablename__ = "expert_reviews"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("disease_reports.id"))
    officer_id = Column(Integer, ForeignKey("users.id"))
    decision = Column(String(50)) # confirmed, needs_info, different_diagnosis, resolved (or verified/rejected)
    confirmed_diagnosis = Column(String(150))
    comments = Column(Text)
    recommended_action = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    report = relationship("DiseaseReport", back_populates="reviews")

class ActionPlanProgress(Base):
    __tablename__ = "action_plan_progress"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("disease_reports.id"), index=True)
    day_number = Column(Integer) # 1 to 7
    title = Column(String(200))
    description = Column(Text)
    completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)

class Hotspot(Base):
    __tablename__ = "hotspots"

    id = Column(Integer, primary_key=True, index=True)
    cluster_id = Column(Integer)
    center_lat = Column(Float)
    center_lng = Column(Float)
    radius_km = Column(Float, default=12.0)
    case_count = Column(Integer)
    dominant_disease = Column(String(150))
    crop = Column(String(100))
    risk_level = Column(String(50)) # Moderate, High, Very High
    district = Column(String(100), index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class OutbreakAlert(Base):
    __tablename__ = "outbreak_alerts"

    id = Column(Integer, primary_key=True, index=True)
    disease = Column(String(150), index=True)
    crop = Column(String(100))
    district = Column(String(100))
    case_count = Column(Integer)
    growth_rate = Column(Float) # Velocity percentage
    risk_level = Column(String(50)) # High, Very High (POTENTIAL OUTBREAK)
    confidence = Column(Float, default=0.88)
    alert_message = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

class Field(Base):
    __tablename__ = "fields"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String(100))
    crop_name = Column(String(100))
    area_acres = Column(Float)
    planting_date = Column(DateTime)
    growth_stage = Column(String(100)) # Sowing, Vegetative, Flowering, Fruiting, Harvesting
    soil_type = Column(String(100), default="Red Loam")

    diaries = relationship("CropDiary", back_populates="field")

class CropDiary(Base):
    __tablename__ = "crop_diaries"

    id = Column(Integer, primary_key=True, index=True)
    field_id = Column(Integer, ForeignKey("fields.id"))
    entry_type = Column(String(50)) # observation, disease, treatment, irrigation, fertilizer
    title = Column(String(150))
    notes = Column(Text)
    photo_url = Column(String(500), nullable=True)
    date = Column(DateTime, default=datetime.utcnow)

    field = relationship("Field", back_populates="diaries")

class SoilRecord(Base):
    __tablename__ = "soil_records"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("users.id"))
    field_name = Column(String(100), default="Field 1")
    ph = Column(Float)
    nitrogen = Column(Float)    # kg/ha
    phosphorus = Column(Float)  # kg/ha
    potassium = Column(Float)   # kg/ha
    organic_carbon = Column(Float) # %
    electrical_conductivity = Column(Float, default=0.65) # dS/m
    interpretation = Column(Text)
    fertilizer_suggestion = Column(Text)
    test_date = Column(DateTime, default=datetime.utcnow)

class Seller(Base):
    __tablename__ = "sellers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150))
    shop_name = Column(String(200))
    district = Column(String(100))
    state = Column(String(100))
    phone = Column(String(20))
    is_verified = Column(Boolean, default=True)
    rating = Column(Float, default=4.8)
    pickup_address = Column(String(255))

    products = relationship("Product", back_populates="seller")

class ProductCategory(Base):
    __tablename__ = "product_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True)
    slug = Column(String(100), unique=True)
    description = Column(String(255))
    icon = Column(String(50))

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    seller_id = Column(Integer, ForeignKey("sellers.id"))
    category = Column(String(100), index=True) # seeds, fertilizer, crop_protection, organic, equipment, irrigation, tools
    title = Column(String(255), index=True)
    brand = Column(String(150))
    description = Column(Text)
    price = Column(Float)
    unit = Column(String(50)) # 1 kg, 500 ml, 1 unit, 50 kg bag
    stock = Column(Integer, default=50)
    rating = Column(Float, default=4.7)
    review_count = Column(Integer, default=24)
    image_url = Column(String(500))
    safety_label = Column(Text) # Official CIBRC statutory safety guidance
    active_ingredient = Column(String(200), nullable=True)
    target_diseases = Column(String(255), nullable=True) # comma-separated
    allow_pickup = Column(Boolean, default=True)
    allow_delivery = Column(Boolean, default=True)

    seller = relationship("Seller", back_populates="products")

class CartItem(Base):
    __tablename__ = "cart_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer, default=1)

    user = relationship("User", back_populates="cart_items")
    product = relationship("Product")

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    order_number = Column(String(50), unique=True)
    total_amount = Column(Float)
    delivery_type = Column(String(50)) # delivery, pickup
    status = Column(String(50), default="confirmed") # confirmed, dispatched, ready_for_pickup, delivered
    shipping_address = Column(String(255), nullable=True)
    pickup_location = Column(String(255), nullable=True)
    payment_status = Column(String(50), default="DEMO_PAID")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order")

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer)
    unit_price = Column(Float)

    order = relationship("Order", back_populates="items")
    product = relationship("Product")

class MarketPrice(Base):
    __tablename__ = "market_prices"

    id = Column(Integer, primary_key=True, index=True)
    crop_name = Column(String(100), index=True)
    market_name = Column(String(150), index=True)
    district = Column(String(100))
    state = Column(String(100))
    modal_price = Column(Float) # Rs / Quintal
    min_price = Column(Float)
    max_price = Column(Float)
    price_change_pct = Column(Float)
    trend = Column(String(50)) # Increasing, Stable, Decreasing
    date = Column(DateTime, default=datetime.utcnow)

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String(255))
    message = Column(Text)
    alert_type = Column(String(50)) # outbreak, verification, order, general
    is_read = Column(Boolean, default=False)
    link = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")

