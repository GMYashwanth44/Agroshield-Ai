from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import User, FarmerProfile, OfficerProfile
from app.schemas.schemas import UserRegister, UserLogin, Token, UserResponse
from app.auth.security import verify_password, get_password_hash, create_access_token, decode_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user_id = int(payload["sub"])
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

def get_optional_current_user(token: str = Depends(oauth2_scheme_optional), db: Session = Depends(get_db)):
    if not token:
        return None
    try:
        payload = decode_access_token(token)
        if not payload or "sub" not in payload:
            return None
        user_id = int(payload["sub"])
        return db.query(User).filter(User.id == user_id).first()
    except Exception:
        return None

@router.post("/register", response_model=Token)
def register(data: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email.lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email is already registered.")

    user = User(
        email=data.email.lower(),
        password_hash=get_password_hash(data.password),
        full_name=data.full_name,
        role=data.role,
        phone=data.phone,
        preferred_lang=data.preferred_lang
    )
    db.add(user)
    db.flush()

    if data.role == "farmer":
        prof = FarmerProfile(
            user_id=user.id,
            village=data.village or "Kolar Rural",
            district=data.district or "Kolar",
            state=data.state or "Karnataka"
        )
        db.add(prof)
    elif data.role == "officer":
        prof = OfficerProfile(
            user_id=user.id,
            badge_number=f"AGRI-{user.id:04d}",
            jurisdiction_district=data.district or "Kolar"
        )
        db.add(prof)

    db.commit()

    token = create_access_token({"sub": str(user.id), "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user.id,
        "role": user.role,
        "full_name": user.full_name,
        "preferred_lang": user.preferred_lang
    }

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username.lower()).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token({"sub": str(user.id), "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user.id,
        "role": user.role,
        "full_name": user.full_name,
        "preferred_lang": user.preferred_lang
    }

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/update-lang")
def update_language(lang: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if lang in ["en", "kn", "hi", "mr", "te", "ta"]:
        current_user.preferred_lang = lang
        db.commit()
    return {"status": "success", "language": current_user.preferred_lang}
