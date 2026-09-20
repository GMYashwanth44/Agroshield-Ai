from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

# Normalize postgres:// to postgresql:// for cloud providers (Render, Heroku, Supabase, Neon)
db_url = settings.DATABASE_URL
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

# For SQLite, ensure check_same_thread=False
connect_args = {"check_same_thread": False} if db_url.startswith("sqlite") else {}

engine = create_engine(
    db_url,
    connect_args=connect_args,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def run_migrations():
    """Adds non-breaking V2 columns to existing database tables if missing."""
    from sqlalchemy import inspect, text
    try:
        with engine.connect() as conn:
            inspector = inspect(engine)
            if "disease_reports" in inspector.get_table_names():
                existing = [col["name"] for col in inspector.get_columns("disease_reports")]
                if "crop_health_score" not in existing:
                    conn.execute(text("ALTER TABLE disease_reports ADD COLUMN crop_health_score FLOAT"))
                if "future_risk_level" not in existing:
                    conn.execute(text("ALTER TABLE disease_reports ADD COLUMN future_risk_level VARCHAR(50)"))
                if "parent_report_id" not in existing:
                    conn.execute(text("ALTER TABLE disease_reports ADD COLUMN parent_report_id INTEGER"))
                if "review_stage" not in existing:
                    conn.execute(text("ALTER TABLE disease_reports ADD COLUMN review_stage VARCHAR(50) DEFAULT 'pending'"))
                if "officer_override_disease" not in existing:
                    conn.execute(text("ALTER TABLE disease_reports ADD COLUMN officer_override_disease VARCHAR(150)"))
                conn.commit()
    except Exception as e:
        print(f"Migration note: {e}")

# Run non-destructive schema migrations on initialization
run_migrations()

