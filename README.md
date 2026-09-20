# 🌿 AGROSHIELD AI

> **“Detect Early. Act Smart. Protect Crops.”**  
> An AI-powered agricultural assistant, crop disease detection system, community disease surveillance & early-warning platform, and agriculture marketplace built for Smart India Hackathon (SIH).

---

## 🌟 The Core Innovation

The main breakthrough of **AGROSHIELD AI** is bridging individual farmer field observations with community-level surveillance:

$$\text{Individual Farmer AI} \longrightarrow \text{Community Surveillance} \longrightarrow \text{Early Warning (DBSCAN)} \longrightarrow \text{Officer Action} \longrightarrow \text{Farmer Protection}$$

1. **AI Disease Detection & Severity**: Upload photo from camera/gallery, automated quality verification, AI diagnosis (Crop, Disease, Calibrated Confidence, e.g. 94.7%), and lesion affected area estimation (0–5% Healthy, 5–20% Mild, 20–50% Moderate, >50% Severe) with visual mask overlays.
2. **Community Disease Surveillance**: GPS-tagged disease reports anonymize farmer identity to map regional spread.
3. **DBSCAN Hotspot & Outbreak Engine**: Detects geographic disease clusters and tracks velocity over time ($\Delta \text{cases} / \Delta t$) to issue **🚨 POTENTIAL OUTBREAK RISK** alerts.
4. **Official Expert Verification**: Designated Agricultural Officers review pending cases, provide verified field diagnoses, and dispatch advisories.
5. **Multilingual (6 Languages)**: Dynamic instant switching for **English**, **Kannada (ಕನ್ನಡ)**, **Hindi (हिन्दी)**, **Marathi (मराठी)**, **Telugu (తెలుగు)**, and **Tamil (தமிழ்)**.
6. **Voice Farming Assistant**: Speech-to-text live listening and AI speech synthesis for illiterate or regional farmers.
7. **Offline-First PWA**: Create reports offline; records are saved in IndexedDB and synchronized automatically when connectivity resumes.
8. **Agriculture Marketplace & Smart Shopping**: Direct linkage between diagnosed disease and certified bio-fungicides/tools with product comparison, cart, demo checkout, and delivery or local pickup.
9. **Weather & Soil Health Assistant**: Computes meteorological disease risk indices, evaluates NPK soil test cards, and recommends suitable crops.
10. **APMC Mandi Intelligence**: Simulated daily market prices with 14-day AI price trend projections.

---

## 🏗️ Architecture & Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, Leaflet & React-Leaflet, IndexedDB PWA Service Worker.
- **Backend**: Python FastAPI, SQLAlchemy, SQLite (default for instant zero-dependency execution, PostgreSQL ready).
- **AI & Computer Vision**: Pillow, NumPy, Scikit-learn (DBSCAN spatial clustering), Laplacian blur variance filter, luminance histogram, color-space lesion segmentation.
- **Security & RBAC**: JWT (HS256), direct bcrypt password hashing, Role-Based Access Control (`farmer`, `officer`, `admin`).

---

## 🚀 Quick Start Instructions

### Prerequisites
- Python 3.10+ (tested on Python 3.14)
- Node.js 18+ and npm

### 1. Start FastAPI Backend

```powershell
cd backend

# Activate virtual environment
.\.venv\Scripts\Activate.ps1   # Windows PowerShell
# source .venv/bin/activate    # Linux / macOS

# (Optional: If initializing on a fresh machine)
# pip install -r requirements.txt
# python -m app.database.seed_data

# Run API server
python -m uvicorn app.main:app --reload --port 8000
```
- API Swagger Documentation: **http://127.0.0.1:8000/docs**
- Health Check: **http://127.0.0.1:8000/api/health**

### 2. Start React Frontend

```powershell
cd frontend

# Install dependencies (if first time)
npm install

# Run dev server
npm run dev
```
- Frontend UI: **http://localhost:5173**

---

## 👥 Demo Accounts & Pre-Seeded Roles

The database is pre-seeded with **1,249 realistic demonstration reports**, active hotspot clusters in Kolar and Mandya, marketplace products, and mandi rates:

| Role | Email | Password | Name / Jurisdiction |
| :--- | :--- | :--- | :--- |
| **Farmer** | `farmer@agroshield.ai` | `farmer123` | Ramesh Gowda (Srinivaspur, Kolar) |
| **Agri Officer** | `officer@agroshield.ai` | `officer123` | Dr. Ananya Sharma (Badge: KA-AGRI-0482) |
| **System Admin** | `admin@agroshield.ai` | `admin123` | Chief Admin AgroShield |

*Note: You can also switch roles instantly using the top-right profile selector in the UI!*

---

## 🏆 Smart India Hackathon (SIH) 37-Step Presentation Guide

Click the **"★ SIH Demo"** button on the top navigation bar to launch the guided walkthrough controller.

1. **Open AgroShield AI** (`/`)
2. **Select Kannada (`ಕನ್ನಡ`)**: Real-time dynamic UI translation without reload.
3. **Open Scan Crop**: Displaying both **📷 Scan / Take Photo** and **🖼️ Upload from Gallery**.
4. **Upload Tomato Leaf Sample**: Click the pre-loaded *Tomato Early Blight* test sample.
5. **Quality Check Verification**: Image quality validation passes (Blur score > 45, balanced exposure, leaf foliage detected).
6. **AI Predicts**: Tomato Early Blight with **94.7% confidence**.
7. **Severity Estimation**: **37% affected area** categorized as **Moderate**.
8. **Lesion Heatmap**: Click *"View Lesion Heatmap"* to see computer-vision segmented necrotic pixels.
9. **Safe Guidance**: Cultural spacing, organic Trichoderma viride, and CIBRC chemical label safety disclaimer.
10. **GPS Tagging**: Tagged to Srinivaspur coordinates (13.3392° N, 78.2139° E).
11. **Submit Disease Report**: Logged to community database.
12. **Simulate Nearby Reports**: Click *"Simulate Nearby Surge (SIH)"* to inject 15 localized reports.
13. **Regional Heatmap**: Leaflet map updates with concentrated orange/red risk markers.
14. **DBSCAN Hotspot Detected**: Spatial cluster #0 highlighted with 25+ cases.
15. **Potential Outbreak Risk Alert**: Case velocity warning banner triggers.
16. **Switch to Agri Officer**: Review incoming cases, verify diagnosis, and dispatch notification.
17. **Farmer Receives Notification**: Verified badge and expert comments displayed on farmer's report.
18. **Marketplace & AI Smart Shopping**: Matching bio-fungicides surfaced directly from diagnosis.
19. **Product Comparison**: Compare products side-by-side.
20. **Checkout**: Choose between 🚚 Farm Direct Delivery or 🏪 Local APMC Krishi Kendra Pickup.
21. **Weather & Soil Health**: Check humidity risk index and enter NPK soil card values for plain-language interpretation.
22. **Crop Diary**: Timeline records for field plots.
23. **Voice Assistant**: Ask questions in Kannada, Telugu, Tamil, Marathi, Hindi, or English.
24. **Multi-Language Switch**: Seamless dynamic switching to Telugu (`తెలుగు`) and Tamil (`தமிழ்`).
25. **Offline PWA Demonstration**: Disconnect network $\to$ create report $\to$ saves to IndexedDB $\to$ reconnect $\to$ synchronizes with server.

---

## ⚖️ AI Transparency & Safety Disclaimers

- **Confidence Transparency**: Always displayed as *"AI Confidence: 94.7%"*. Never claims 100% accuracy.
- **Screening Disclaimer**: Displayed on all diagnostic reports: *"AI-assisted screening indicator. Confirm uncertain cases with an agricultural expert."*
- **Outbreak Alerts**: Always labeled as *"POTENTIAL OUTBREAK RISK"* (never *"Confirmed Outbreak"*).
- **Chemical Guidance**: Never invents chemical dosages. Advises users to follow the legally approved CIBRC product label and local state agricultural university guidance.
- **Market Prices**: Labeled as *"DEMO DATA"* with *"Estimated Trend"*.

---

## 🧪 Automated Test Suite

Run the full automated pytest suite:
```powershell
$env:PYTHONPATH="backend"
.\backend\.venv\Scripts\pytest.exe tests\test_api.py -v
```
All 9 unit and integration tests pass with 100% success rate:
- `test_health`
- `test_quality_check_pass`
- `test_predict_disease`
- `test_severity_estimation`
- `test_statistics`
- `test_outbreak_alerts`
- `test_hotspots`
- `test_marketplace_products`
- `test_voice_assistant_multilingual`
