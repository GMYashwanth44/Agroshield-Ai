from typing import Optional, List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import Field, CropDiary, User
from app.api.auth import get_current_user

router = APIRouter(prefix="/diary", tags=["Digital Crop Diary & Farm Fields"])

class FieldCreate(BaseModel):
    name: str
    crop_name: str
    area_acres: float
    growth_stage: str
    soil_type: Optional[str] = "Red Loam"

class DiaryEntryCreate(BaseModel):
    field_id: int
    entry_type: str # planting, fertilizer, observation, disease, harvest
    title: str
    notes: str
    photo_url: Optional[str] = None

@router.get("/fields")
def get_fields(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    fields = db.query(Field).filter(Field.farmer_id == current_user.id).all()
    return [
        {
            "id": f.id,
            "name": f.name,
            "crop_name": f.crop_name,
            "area_acres": f.area_acres,
            "planting_date": f.planting_date.strftime("%Y-%m-%d") if f.planting_date else None,
            "growth_stage": f.growth_stage,
            "soil_type": f.soil_type,
            "entries_count": len(f.diaries)
        }
        for f in fields
    ]

@router.post("/fields")
def create_field(data: FieldCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    f = Field(
        farmer_id=current_user.id,
        name=data.name,
        crop_name=data.crop_name,
        area_acres=data.area_acres,
        planting_date=datetime.utcnow(),
        growth_stage=data.growth_stage,
        soil_type=data.soil_type
    )
    db.add(f)
    db.commit()
    db.refresh(f)
    return {"status": "success", "field_id": f.id, "message": "Field created"}

@router.get("/entries/{field_id}")
def get_entries(field_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    entries = db.query(CropDiary).filter(CropDiary.field_id == field_id).order_by(CropDiary.date.desc()).all()
    return [
        {
            "id": e.id,
            "field_id": e.field_id,
            "entry_type": e.entry_type,
            "title": e.title,
            "notes": e.notes,
            "photo_url": e.photo_url,
            "date": e.date.strftime("%b %d, %Y")
        }
        for e in entries
    ]

@router.post("/entries")
def create_entry(data: DiaryEntryCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    entry = CropDiary(
        field_id=data.field_id,
        entry_type=data.entry_type,
        title=data.title,
        notes=data.notes,
        photo_url=data.photo_url,
        date=datetime.utcnow()
    )
    db.add(entry)
    db.commit()
    return {"status": "success", "entry_id": entry.id, "message": "Diary note logged"}
