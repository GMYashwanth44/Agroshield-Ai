import random
from datetime import datetime, timedelta
from app.database.session import SessionLocal, engine, Base
from app.models.models import (
    User, FarmerProfile, OfficerProfile, Crop, Disease, Recommendation,
    DiseaseReport, Hotspot, OutbreakAlert, Field, CropDiary, SoilRecord,
    Seller, ProductCategory, Product, MarketPrice, Notification
)
from app.auth.security import get_password_hash

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if already seeded
    if db.query(User).count() > 0:
        print("Database already contains records. Skipping seed.")
        db.close()
        return

    print("Seeding AgroShield AI realistic DEMO DATA (1,248+ reports, marketplace, mandi prices)...")

    # 1. Create Core Users
    farmer_user = User(
        email="farmer@agroshield.ai",
        password_hash=get_password_hash("farmer123"),
        full_name="Ramesh Gowda",
        role="farmer",
        phone="+91 98451 23456",
        preferred_lang="kn"
    )
    db.add(farmer_user)
    db.flush()

    farmer_prof = FarmerProfile(
        user_id=farmer_user.id,
        village="Srinivaspur",
        district="Kolar",
        state="Karnataka",
        land_size_acres=5.2
    )
    db.add(farmer_prof)

    officer_user = User(
        email="officer@agroshield.ai",
        password_hash=get_password_hash("officer123"),
        full_name="Dr. Ananya Sharma",
        role="officer",
        phone="+91 94480 87654",
        preferred_lang="en"
    )
    db.add(officer_user)
    db.flush()

    officer_prof = OfficerProfile(
        user_id=officer_user.id,
        badge_number="KA-AGRI-0482",
        jurisdiction_district="Kolar",
        department="District Directorate of Agriculture, Kolar"
    )
    db.add(officer_prof)

    admin_user = User(
        email="admin@agroshield.ai",
        password_hash=get_password_hash("admin123"),
        full_name="National Agro-Surveillance Admin",
        role="admin",
        phone="+91 80222 55555",
        preferred_lang="en"
    )
    db.add(admin_user)
    db.flush()

    # 2. Crops & Diseases
    crop_data = [
        {"name": "Tomato", "scientific": "Solanum lycopersicum", "cat": "Vegetable", "season": "Kharif & Rabi", "icon": "🍅"},
        {"name": "Potato", "scientific": "Solanum tuberosum", "cat": "Tuber", "season": "Rabi", "icon": "🥔"},
        {"name": "Rice", "scientific": "Oryza sativa", "cat": "Cereal", "season": "Kharif", "icon": "🌾"},
        {"name": "Corn / Maize", "scientific": "Zea mays", "cat": "Cereal", "season": "Kharif & Summer", "icon": "🌽"},
        {"name": "Cotton", "scientific": "Gossypium hirsutum", "cat": "Cash Crop", "season": "Kharif", "icon": "☁️"},
        {"name": "Wheat", "scientific": "Triticum aestivum", "cat": "Cereal", "season": "Rabi", "icon": "🌱"}
    ]

    crops_map = {}
    for cd in crop_data:
        c = Crop(
            name=cd["name"],
            scientific_name=cd["scientific"],
            category=cd["cat"],
            optimal_season=cd["season"],
            description=f"Standard high-yield {cd['name']} cultivations in South & Central Indian agricultural zones.",
            icon=cd["icon"]
        )
        db.add(c)
        db.flush()
        crops_map[cd["name"]] = c

    # Diseases & Recommendations
    diseases_spec = [
        {
            "crop": "Tomato",
            "name": "Early Blight",
            "scientific": "Alternaria solani",
            "pathogen": "Fungal",
            "symptoms": "Concentric rings ('target board' spots) on lower leaves, surrounded by yellow chlorotic halo. Premature defoliation.",
            "risk": "Moderate to High",
            "cultural": "Provide 60x45cm spacing, stake vines to keep leaves off damp soil, remove infected lower foliage.",
            "organic": "Foliar spray with Bacillus subtilis or Trichoderma viride @ 5g/L. Apply neem seed oil (3%).",
            "chemical": "Chlorothalonil 75% WP or Mancozeb 75% WP @ 2g/L water per statutory CIBRC recommendations.",
            "safety": "Follow approved CIBRC product labels. Wear gloves and mask. Observe 7-day pre-harvest interval.",
            "cats": "crop_protection,fertilizer"
        },
        {
            "crop": "Tomato",
            "name": "Late Blight",
            "scientific": "Phytophthora infestans",
            "pathogen": "Oomycete",
            "symptoms": "Water-soaked irregular dark lesions with white fungal downy mildew on leaf undersides in cold moist mornings.",
            "risk": "Very High",
            "cultural": "Avoid sprinkler irrigation. Provide good row drainage. Discard infected plant residue.",
            "organic": "Copper Oxychloride 50% WP or Bordeaux mixture (1%) preventive drench.",
            "chemical": "Metalaxyl 8% + Mancozeb 64% WP @ 2.5g/L water during high disease pressure.",
            "safety": "Observe personal safety protocols and approved harvest waiting periods.",
            "cats": "crop_protection,equipment"
        },
        {
            "crop": "Rice",
            "name": "Leaf Blast",
            "scientific": "Magnaporthe oryzae",
            "pathogen": "Fungal",
            "symptoms": "Diamond or spindle shaped lesions with greyish centers and reddish-brown borders.",
            "risk": "High",
            "cultural": "Balance nitrogen fertilizer (do not over-apply urea). Use split fertilizer applications.",
            "organic": "Seed treatment with Pseudomonas fluorescens @ 10g/kg seed.",
            "chemical": "Tricyclazole 75% WP @ 0.6g/L or Isoprothiolane 40% EC per ICAR guide.",
            "safety": "Apply early morning before wind pick-up. Follow CIBRC guidelines.",
            "cats": "crop_protection,seeds"
        },
        {
            "crop": "Potato",
            "name": "Early Blight",
            "scientific": "Alternaria solani",
            "pathogen": "Fungal",
            "symptoms": "Brown angular necrotic lesions on older leaves exhibiting concentric dark rings.",
            "risk": "Moderate",
            "cultural": "Use certified seed tubers. Practice crop rotation with cereals or pulses.",
            "organic": "Neem seed kernel extract (NSKE 5%) spray at first sign of spots.",
            "chemical": "Propineb 70% WP @ 2.5g/L or Mancozeb 75% WP.",
            "safety": "Keep domestic animals away from treated field for 48 hours.",
            "cats": "crop_protection"
        }
    ]

    for ds in diseases_spec:
        crop_obj = crops_map.get(ds["crop"])
        dis = Disease(
            crop_id=crop_obj.id,
            name=ds["name"],
            scientific_name=ds["scientific"],
            pathogen_type=ds["pathogen"],
            symptoms=ds["symptoms"],
            severity_risk=ds["risk"]
        )
        db.add(dis)
        db.flush()

        rec = Recommendation(
            disease_id=dis.id,
            cultural_practices=ds["cultural"],
            organic_control=ds["organic"],
            chemical_guidance=ds["chemical"],
            safety_disclaimer=ds["safety"],
            product_category_links=ds["cats"]
        )
        db.add(rec)

    # 3. Sellers & Marketplace Products
    seller1 = Seller(
        name="Kisan Seva Kendra",
        shop_name="Kisan Seva Krishi Hub",
        district="Kolar",
        state="Karnataka",
        phone="+91 98450 77112",
        is_verified=True,
        rating=4.9,
        pickup_address="APMC Yard, Near Gate No. 2, Kolar Main Road"
    )
    seller2 = Seller(
        name="Sahyadri Organic Inputs",
        shop_name="Sahyadri Bio-Agri Store",
        district="Mandya",
        state="Karnataka",
        phone="+91 94481 99223",
        is_verified=True,
        rating=4.8,
        pickup_address="Sugar Town Circle, Mandya"
    )
    seller3 = Seller(
        name="AgroTech India Tools",
        shop_name="AgroTech Farm Equipment Depot",
        district="Bengaluru Rural",
        state="Karnataka",
        phone="+91 80283 44556",
        is_verified=True,
        rating=4.7,
        pickup_address="Doddaballapur Industrial Area, Bengaluru Rural"
    )
    db.add_all([seller1, seller2, seller3])
    db.flush()

    products_data = [
        # Crop Protection
        {
            "seller_id": seller1.id, "cat": "crop_protection",
            "title": "Bio-Shield Trichoderma Viride (Bio-Fungicide)",
            "brand": "Krishi Vikas", "price": 280.0, "unit": "1 kg pack", "stock": 85, "rating": 4.8,
            "desc": "Effective biological control agent against early blight, damping off, and soil-borne fungal pathogens.",
            "safety": "Eco-friendly bio-agent. Safe for pollinators. Store in cool, dry place.",
            "target": "Early Blight, Late Blight, Root Rot",
            "img": "https://images.unsplash.com/photo-1592417817098-8f3d6eb22510?w=600&auto=format&fit=crop&q=80"
        },
        {
            "seller_id": seller1.id, "cat": "crop_protection",
            "title": "Mancozeb 75% WP Broad Spectrum Fungicide",
            "brand": "Kisan Rakshak", "price": 420.0, "unit": "500 g pack", "stock": 60, "rating": 4.7,
            "desc": "Protective contact fungicide providing multisite action against Alternaria early blight and leaf spots.",
            "safety": "Follow statutory CIBRC directions. Use protective gear. Do not spray within 7 days of harvest.",
            "target": "Early Blight, Late Blight, Blast",
            "img": "https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=600&auto=format&fit=crop&q=80"
        },
        {
            "seller_id": seller2.id, "cat": "crop_protection",
            "title": "Neem Seed Kernel Extract 10,000 PPM (Cold Pressed)",
            "brand": "Prakruti Bio", "price": 350.0, "unit": "1 Liter bottle", "stock": 90, "rating": 4.9,
            "desc": "Natural botanical pest repellent and antifeedant. Certified organic by NPOP.",
            "safety": "Zero toxic residue. Non-hazardous to beneficial predators.",
            "target": "Early Blight, Leaf Curl, Aphids",
            "img": "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop&q=80"
        },
        # Seeds
        {
            "seller_id": seller1.id, "cat": "seeds",
            "title": "Abhinav F1 Hybrid Tomato Seeds (High Disease Tolerance)",
            "brand": "Syngenta", "price": 680.0, "unit": "10 g pack (approx 3500 seeds)", "stock": 120, "rating": 4.9,
            "desc": "Leading commercial hybrid tomato. High tolerance against Early Blight and Tomato Leaf Curl Virus. Excellent firmness.",
            "safety": "Treated with thiram. Not for food, oil or feed purposes.",
            "target": "High Yield, Disease Tolerance",
            "img": "https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=600&auto=format&fit=crop&q=80"
        },
        {
            "seller_id": seller2.id, "cat": "seeds",
            "title": "BPT-5204 (Samba Mahsuri) Certified Paddy Seeds",
            "brand": "National Seeds Corp", "price": 1450.0, "unit": "25 kg bag", "stock": 45, "rating": 4.8,
            "desc": "High grain quality and medium slender rice variety, resistant to bacterial leaf blight.",
            "safety": "Certified seed bag with government purity seal.",
            "target": "Bacterial Blight Tolerance",
            "img": "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80"
        },
        # Fertilizer
        {
            "seller_id": seller1.id, "cat": "fertilizer",
            "title": "NPK 19:19:19 100% Water Soluble Fertilizer",
            "brand": "IFFCO", "price": 185.0, "unit": "1 kg pack", "stock": 150, "rating": 4.8,
            "desc": "Balanced starter and foliar nutrition formula for flowering and vegetative growth.",
            "safety": "Apply through drip or foliar spray early in morning or evening.",
            "target": "Vegetative & Flowering Vigor",
            "img": "https://images.unsplash.com/photo-1628352081506-83c43123ed6d?w=600&auto=format&fit=crop&q=80"
        },
        {
            "seller_id": seller2.id, "cat": "fertilizer",
            "title": "Enriched Vermicompost (Soil Conditioner)",
            "brand": "Sahyadri Organics", "price": 480.0, "unit": "50 kg bag", "stock": 200, "rating": 4.9,
            "desc": "Rich in beneficial mycorrhizae, humic acid, and micro-nutrients. Improves water retention.",
            "safety": "100% natural organic manure.",
            "target": "Soil Health & Root Microbes",
            "img": "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&auto=format&fit=crop&q=80"
        },
        # Equipment & Tools
        {
            "seller_id": seller3.id, "cat": "equipment",
            "title": "16-Liter Dual Battery Operated Knapsack Sprayer",
            "brand": "AgroMaster Pro", "price": 2499.0, "unit": "1 complete unit", "stock": 35, "rating": 4.7,
            "desc": "Heavy-duty 12V 12Ah rechargeable sprayer with telescopic brass lance and pressure regulator.",
            "safety": "Charge battery fully before first use. Rinse tank with clean water after spraying.",
            "target": "Foliar Spraying & Disinfection",
            "img": "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=600&auto=format&fit=crop&q=80"
        },
        {
            "seller_id": seller3.id, "cat": "irrigation",
            "title": "Inline Drip Lateral Irrigation Kit (1 Acre Complete)",
            "brand": "Jain Drip", "price": 7800.0, "unit": "Complete 1-Acre Kit", "stock": 20, "rating": 4.9,
            "desc": "16mm Class-2 UV stabilized dripline with 40cm spacing and 2 LPH emitters.",
            "safety": "Install disc filter at inlet to prevent emitter clogging.",
            "target": "Water Conservation & Fertigation",
            "img": "https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?w=600&auto=format&fit=crop&q=80"
        },
        {
            "seller_id": seller3.id, "cat": "tools",
            "title": "Ergonomic Bypass Pruning Shears (Japanese Carbon Steel)",
            "brand": "Falcon Agro", "price": 540.0, "unit": "1 tool", "stock": 70, "rating": 4.8,
            "desc": "Precision cutting shears for diseased branch removal and tomato vine pruning.",
            "safety": "Keep blades clean and wipe with alcohol between cuts to prevent pathogen transfer.",
            "target": "Sanitary Pruning",
            "img": "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&auto=format&fit=crop&q=80"
        }
    ]

    for p in products_data:
        prod = Product(
            seller_id=p["seller_id"],
            category=p["cat"],
            title=p["title"],
            brand=p["brand"],
            price=p["price"],
            unit=p["unit"],
            stock=p["stock"],
            rating=p["rating"],
            description=p["desc"],
            safety_label=p["safety"],
            target_diseases=p["target"],
            image_url=p["img"],
            allow_pickup=True,
            allow_delivery=True
        )
        db.add(prod)

    # 4. APMC Mandi Market Prices
    mandi_data = [
        {"crop": "Tomato", "mandi": "Kolar APMC", "district": "Kolar", "state": "Karnataka", "modal": 2150.0, "min": 1800.0, "max": 2500.0, "chg": 8.5, "trend": "Increasing"},
        {"crop": "Tomato", "mandi": "Mandya APMC", "district": "Mandya", "state": "Karnataka", "modal": 1950.0, "min": 1700.0, "max": 2300.0, "chg": -3.2, "trend": "Decreasing"},
        {"crop": "Tomato", "mandi": "Nashik APMC", "district": "Nashik", "state": "Maharashtra", "modal": 2200.0, "min": 1900.0, "max": 2600.0, "chg": 5.4, "trend": "Increasing"},
        {"crop": "Potato", "mandi": "Hassan APMC", "district": "Hassan", "state": "Karnataka", "modal": 1650.0, "min": 1400.0, "max": 1850.0, "chg": 1.2, "trend": "Stable"},
        {"crop": "Potato", "mandi": "Pune Market Yard", "district": "Pune", "state": "Maharashtra", "modal": 1780.0, "min": 1550.0, "max": 2000.0, "chg": -1.5, "trend": "Stable"},
        {"crop": "Rice (Paddy)", "mandi": "Mandya APMC", "district": "Mandya", "state": "Karnataka", "modal": 2850.0, "min": 2600.0, "max": 3100.0, "chg": 2.8, "trend": "Increasing"},
        {"crop": "Corn / Maize", "mandi": "Chikkaballapur APMC", "district": "Chikkaballapur", "state": "Karnataka", "modal": 2100.0, "min": 1950.0, "max": 2250.0, "chg": 0.5, "trend": "Stable"},
        {"crop": "Cotton", "mandi": "Raichur APMC", "district": "Raichur", "state": "Karnataka", "modal": 7450.0, "min": 7100.0, "max": 7800.0, "chg": 4.1, "trend": "Increasing"}
    ]
    for m in mandi_data:
        mp = MarketPrice(
            crop_name=m["crop"],
            market_name=m["mandi"],
            district=m["district"],
            state=m["state"],
            modal_price=m["modal"],
            min_price=m["min"],
            max_price=m["max"],
            price_change_pct=m["chg"],
            trend=m["trend"]
        )
        db.add(mp)

    # 5. Crop Diary & Field for Farmer Ramesh Gowda
    field1 = Field(
        farmer_id=farmer_user.id,
        name="North Field - Plot A",
        crop_name="Tomato",
        area_acres=2.5,
        planting_date=datetime.utcnow() - timedelta(days=42),
        growth_stage="Flowering & Early Fruiting",
        soil_type="Red Sandy Loam"
    )
    field2 = Field(
        farmer_id=farmer_user.id,
        name="South Field - Plot B",
        crop_name="Potato",
        area_acres=2.0,
        planting_date=datetime.utcnow() - timedelta(days=25),
        growth_stage="Vegetative",
        soil_type="Red Loam"
    )
    db.add_all([field1, field2])
    db.flush()

    diary_entries = [
        CropDiary(
            field_id=field1.id,
            entry_type="planting",
            title="Transplanted Abhinav F1 Tomato Seedlings",
            notes="Transplanted 3,200 nursery seedlings. Treated with Trichoderma viride slurry before planting.",
            date=datetime.utcnow() - timedelta(days=42)
        ),
        CropDiary(
            field_id=field1.id,
            entry_type="fertilizer",
            title="First Basal Fertigation",
            notes="Applied 19:19:19 @ 5kg/acre through inline drip system.",
            date=datetime.utcnow() - timedelta(days=28)
        ),
        CropDiary(
            field_id=field1.id,
            entry_type="observation",
            title="Flowering stage initiated",
            notes="Profuse yellow flowers observed. Honeybee activity healthy in the morning.",
            date=datetime.utcnow() - timedelta(days=14)
        ),
        CropDiary(
            field_id=field1.id,
            entry_type="disease",
            title="Observed brown spots on lower leaves",
            notes="Concentric dark target marks detected on older leaves after rainy spell. Scanned with AgroShield AI.",
            date=datetime.utcnow() - timedelta(days=2)
        )
    ]
    db.add_all(diary_entries)

    # 6. Soil Health Record for Farmer
    soil_rec = SoilRecord(
        farmer_id=farmer_user.id,
        field_name="North Field - Plot A",
        ph=6.4,
        nitrogen=210.0,
        phosphorus=28.5,
        potassium=195.0,
        organic_carbon=0.55,
        electrical_conductivity=0.45,
        interpretation="Slightly acidic soil with moderate Nitrogen deficiency and medium Potassium levels. Healthy organic carbon baseline.",
        fertilizer_suggestion="Apply 2 tons well-decomposed vermicompost per acre. Split nitrogen application into 3 stages. Supplement foliar potassium sulphate during fruit bulking."
    )
    db.add(soil_rec)

    # 7. Realistic 1,248 Fictional Disease Reports (Clearly DEMO DATA)
    print("Generating 1,248 regional demo disease reports across agricultural clusters...")
    clusters = [
        # Outbreak & Hotspot Cluster: Srinivaspur & Malur in Kolar (Karnataka)
        {"district": "Kolar", "village": "Srinivaspur", "lat": 13.3392, "lng": 78.2139, "crop": "Tomato", "disease": "Early Blight", "weight": 220, "surge": True},
        {"district": "Kolar", "village": "Malur", "lat": 13.0039, "lng": 77.9406, "crop": "Tomato", "disease": "Early Blight", "weight": 140, "surge": True},
        {"district": "Kolar", "village": "Bangarapet", "lat": 12.9774, "lng": 78.1969, "crop": "Tomato", "disease": "Late Blight", "weight": 95, "surge": False},
        # Mandya Paddy & Tomato Cluster
        {"district": "Mandya", "village": "Maddur", "lat": 12.5844, "lng": 77.0450, "crop": "Rice", "disease": "Leaf Blast", "weight": 180, "surge": False},
        {"district": "Mandya", "village": "Pandavapura", "lat": 12.4975, "lng": 76.6698, "crop": "Rice", "disease": "Bacterial Leaf Blight", "weight": 130, "surge": False},
        # Belagavi Vegetable & Cotton Cluster
        {"district": "Belagavi", "village": "Gokak", "lat": 16.1687, "lng": 74.8239, "crop": "Cotton", "disease": "Bacterial Blight", "weight": 150, "surge": False},
        {"district": "Belagavi", "village": "Chikkodi", "lat": 16.4297, "lng": 74.5987, "crop": "Corn / Maize", "disease": "Northern Leaf Blight", "weight": 110, "surge": False},
        # Nashik & Pune (Maharashtra)
        {"district": "Nashik", "village": "Niphad", "lat": 20.0768, "lng": 74.1084, "crop": "Tomato", "disease": "Early Blight", "weight": 120, "surge": False},
        {"district": "Pune", "village": "Narayangaon", "lat": 19.1235, "lng": 73.9780, "crop": "Tomato", "disease": "Late Blight", "weight": 103, "surge": False}
    ]

    total_generated = 0
    now = datetime.utcnow()
    reports_to_add = []

    # Verified sample reports for Ramesh Gowda
    my_report1 = DiseaseReport(
        farmer_id=farmer_user.id,
        crop_name="Tomato",
        disease_name="Early Blight",
        confidence=0.947,
        severity="Moderate",
        affected_area_pct=37.0,
        status="verified",
        latitude=13.3392,
        longitude=78.2139,
        location_accuracy=4.5,
        district="Kolar",
        village="Srinivaspur",
        image_url="https://images.unsplash.com/photo-1592417817098-8f3d6eb22510?w=600&auto=format&fit=crop&q=80",
        farmer_notes="Noticeable concentric dark marks on bottom foliage of North Plot A.",
        officer_diagnosis="Confirmed Alternaria solani (Early Blight) in moderate stage.",
        officer_comments="Good early detection. Foliage spacing should be opened up. Spray Trichoderma viride or Mancozeb as indicated.",
        officer_id=officer_user.id,
        is_offline=False,
        created_at=now - timedelta(hours=14)
    )
    reports_to_add.append(my_report1)
    total_generated += 1

    for c in clusters:
        count = c["weight"]
        is_surge = c["surge"]
        for i in range(count):
            # Coordinates with slight random jitter (~1 to 5 km)
            jitter_lat = c["lat"] + random.uniform(-0.045, 0.045)
            jitter_lng = c["lng"] + random.uniform(-0.045, 0.045)

            # Temporal distribution: if surge cluster, skew heavily to past 4 days
            if is_surge:
                # 4-day exponential velocity distribution: Day 1=2, Day 2=5, Day 3=12, Day 4=26+
                r_val = random.random()
                if r_val < 0.45:
                    delta_hours = random.uniform(1, 24) # Today (Day 4)
                elif r_val < 0.75:
                    delta_hours = random.uniform(24, 48) # Yesterday (Day 3)
                elif r_val < 0.90:
                    delta_hours = random.uniform(48, 72) # Day 2
                else:
                    delta_hours = random.uniform(72, 168) # Earlier in week
            else:
                delta_hours = random.uniform(1, 24 * 30) # Past 30 days

            created_time = now - timedelta(hours=delta_hours)

            # Randomize confidence and severity realistically
            conf = round(random.uniform(0.78, 0.96), 3)
            aff_pct = round(random.uniform(8.0, 52.0), 1)
            if aff_pct <= 5:
                sev = "Healthy / Very Low"
            elif aff_pct <= 20:
                sev = "Mild"
            elif aff_pct <= 50:
                sev = "Moderate"
            else:
                sev = "Severe"

            status = "pending"
            officer_diag = None
            if random.random() < 0.35:
                status = "verified"
                officer_diag = f"Verified {c['disease']} by District Agri Officer"

            rep = DiseaseReport(
                farmer_id=farmer_user.id if random.random() < 0.05 else None,
                crop_name=c["crop"],
                disease_name=c["disease"],
                confidence=conf,
                severity=sev,
                affected_area_pct=aff_pct,
                status=status,
                latitude=round(jitter_lat, 5),
                longitude=round(jitter_lng, 5),
                location_accuracy=random.uniform(3.0, 15.0),
                district=c["district"],
                village=c["village"],
                image_url="https://images.unsplash.com/photo-1592417817098-8f3d6eb22510?w=600&auto=format&fit=crop&q=80",
                farmer_notes=f"Reported symptoms on {c['crop']} leaf.",
                officer_diagnosis=officer_diag,
                is_offline=False,
                created_at=created_time
            )
            reports_to_add.append(rep)
            total_generated += 1

    # Bulk insert reports
    db.bulk_save_objects(reports_to_add)
    db.commit()

    # 8. Notifications
    notif1 = Notification(
        user_id=farmer_user.id,
        title="Disease Report Verified",
        message="Your Tomato Early Blight report has been reviewed and verified by Dr. Ananya Sharma (Agri Officer, Kolar).",
        alert_type="verification",
        link="/farmer/report/1"
    )
    notif2 = Notification(
        user_id=farmer_user.id,
        title="POTENTIAL OUTBREAK RISK ALERT",
        message="Early Blight cases are rising rapidly in Srinivaspur & Malur blocks. Consult regional advisory for protective spray.",
        alert_type="outbreak",
        link="/farmer/alerts"
    )
    db.add_all([notif1, notif2])
    db.commit()

    print(f"Successfully seeded database with {total_generated} demo disease reports and complete agricultural dataset.")
    db.close()

if __name__ == "__main__":
    seed_database()
