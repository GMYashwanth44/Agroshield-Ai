from fastapi import APIRouter, UploadFile, File, HTTPException
from app.ai.preprocessing import check_image_quality
from app.ai.severity import estimate_disease_severity
from app.ai.prediction import predict_disease

router = APIRouter(tags=["AI Prediction & Computer Vision"])

VALID_EXTENSIONS = {"jpg", "jpeg", "png", "webp", "bmp", "tiff"}

def validate_image_upload(image: UploadFile):
    content_type = image.content_type or ""
    filename = image.filename or "upload.jpg"
    ext = filename.lower().split(".")[-1] if "." in filename else ""
    if not content_type.startswith("image/") and ext not in VALID_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Uploaded file is not a supported image. Format must be JPEG, PNG, or WebP."
        )

@router.post("/check-quality")
async def api_check_quality(image: UploadFile = File(...)):
    """
    Validates file type, size, blur, lighting, resolution, and leaf presence.
    Accepts multipart/form-data upload.
    """
    validate_image_upload(image)

    try:
        content = await image.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read image stream: {str(e)}")

    if not content or len(content) == 0:
        raise HTTPException(status_code=400, detail="Empty file uploaded. Please select a valid photo.")

    result = check_image_quality(content, filename=image.filename or "upload.jpg")
    return result

@router.post("/predict")
async def api_predict(image: UploadFile = File(...)):
    """
    Full AI diagnosis: Quality pre-check + Disease Classification + Severity Assessment + Recommendations.
    """
    validate_image_upload(image)

    try:
        content = await image.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read image stream: {str(e)}")

    if not content or len(content) == 0:
        raise HTTPException(status_code=400, detail="Empty file uploaded. Please select a valid photo.")

    result = predict_disease(content, filename=image.filename or "upload.jpg")
    if not result.get("success"):
        return {
            "success": False,
            "quality_passed": False,
            "message": result.get("message", "Disease prediction failed."),
            "issues": result.get("issues", []),
            "metrics": result.get("metrics", {}),
            "data": None
        }

    return result

@router.post("/severity")
async def api_severity(image: UploadFile = File(...)):
    """
    Calculates affected leaf area percentage and visual segmentation overlay.
    """
    validate_image_upload(image)

    try:
        content = await image.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read image stream: {str(e)}")

    if not content or len(content) == 0:
        raise HTTPException(status_code=400, detail="Empty file uploaded. Please select a valid photo.")

    severity_data = estimate_disease_severity(content)
    return severity_data
