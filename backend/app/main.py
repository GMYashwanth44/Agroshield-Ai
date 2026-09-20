import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database.session import engine, Base, run_migrations
from app.database.seed_data import seed_database
from app.api import auth, predict, reports, surveillance, expert, marketplace, advisory, diary, voice, intelligence

# Initialize DB Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="SIH-Level AI-Powered Agricultural Assistant, Crop Disease Surveillance, Early-Warning Platform & Agriculture Marketplace",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware for modern frontend integration
raw_origins = settings.CORS_ORIGINS.split(",")
origins = [origin.strip() for origin in raw_origins if origin.strip()]
if "*" in origins:
    allow_origins = ["*"]
else:
    allow_origins = origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include All Routers under settings.API_PREFIX ("/api")
app.include_router(auth.router, prefix=settings.API_PREFIX)
app.include_router(predict.router, prefix=settings.API_PREFIX)
app.include_router(reports.router, prefix=settings.API_PREFIX)
app.include_router(surveillance.router, prefix=settings.API_PREFIX)
app.include_router(expert.router, prefix=settings.API_PREFIX)
app.include_router(marketplace.router, prefix=settings.API_PREFIX)
app.include_router(advisory.router, prefix=settings.API_PREFIX)
app.include_router(diary.router, prefix=settings.API_PREFIX)
app.include_router(voice.router, prefix=settings.API_PREFIX)
app.include_router(intelligence.router, prefix=settings.API_PREFIX)

# Also mount predict routes at root level for defensive routing
app.include_router(predict.router)

@app.on_event("startup")
def startup_event():
    run_migrations()
    seed_database()

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "demo_mode": settings.DEMO_MODE,
        "ai_status": "Ready (MobileNetV2 Transfer Model Adapter & Lesion Segmenter active)"
    }

@app.get("/")
def root():
    return {
        "message": "Welcome to AgroShield AI API. Access Swagger documentation at /docs",
        "tagline": "Detect Early. Act Smart. Protect Crops."
    }
