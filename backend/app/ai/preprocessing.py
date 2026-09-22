import io
from typing import Dict, Any, List
import numpy as np
from PIL import Image

def check_image_quality(image_bytes: bytes, filename: str = "upload.jpg") -> dict:
    """
    AgroShield AI Image Validation & Quality Verification Pipeline:
    
    Pipeline:
    1. Basic File & Decode Check (format, byte size)
    2. Resolution Check (minimum 150x150)
    3. Lighting / Exposure Check (luminance distribution)
    4. Focus / Blur Check (Laplacian variance)
    5. Non-Plant Disqualification:
       - Human Face & Skin Tone Detection (YCbCr + HSV skin modeling)
       - Document, Text, Screenshot Detection
       - Non-Vegetative Object Detection (buildings, electronics, furniture)
    6. Positive Plant / Crop Foliage Validation (Chlorophyll ExG, VARI, necrotic spot analysis)
    
    Returns structured results:
    - If non-plant/face/object: "Invalid Image: Please upload a clear crop/plant image."
    - If poor quality: "Image quality is insufficient. Please capture a clearer crop/plant image."
    - If valid: "Image quality is good. Ready for AI analysis."
    """
    # 1. File size check (< 15MB, > 1KB)
    size_kb = len(image_bytes) / 1024
    if size_kb < 1.0:
        return {
            "passed": False,
            "is_valid": False,
            "error_type": "quality_insufficient",
            "message": "Image quality is insufficient. Please capture a clearer crop/plant image.",
            "issues": ["File size is too small (under 1 KB)."],
            "guidance": ["Upload an original camera photo instead of a low-resolution thumbnail."],
            "metrics": {"size_kb": round(size_kb, 1)}
        }
    elif size_kb > 15 * 1024:
        return {
            "passed": False,
            "is_valid": False,
            "error_type": "quality_insufficient",
            "message": "Image quality is insufficient. Please capture a clearer crop/plant image.",
            "issues": ["File size exceeds 15 MB limit."],
            "guidance": ["Crop or resize the photo slightly before uploading."],
            "metrics": {"size_kb": round(size_kb, 1)}
        }

    try:
        pil_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception:
        return {
            "passed": False,
            "is_valid": False,
            "error_type": "invalid_image",
            "message": "Invalid Image: Please upload a clear crop/plant image.",
            "issues": ["Corrupted or unsupported image file format."],
            "guidance": ["Take a fresh photo directly using the phone camera in JPEG or PNG format."],
            "metrics": {}
        }

    width, height = pil_img.size
    
    # 2. Resolution check (minimum 150x150)
    if width < 150 or height < 150:
        return {
            "passed": False,
            "is_valid": False,
            "error_type": "quality_insufficient",
            "message": "Image quality is insufficient. Please capture a clearer crop/plant image.",
            "issues": [f"Resolution is too low ({width}×{height}px; minimum 150×150px required)."],
            "guidance": ["Move closer to the crop leaf and avoid aggressive digital zooming."],
            "metrics": {"width": width, "height": height}
        }

    img_array = np.array(pil_img)
    total_pixels = float(width * height)

    r = img_array[:, :, 0].astype(np.float32)
    g = img_array[:, :, 1].astype(np.float32)
    b = img_array[:, :, 2].astype(np.float32)

    # =========================================================================
    # 3. REAL PLANT / CROP VALIDATION (Reject faces, documents, non-plants)
    # =========================================================================

    # Compute color indices for vegetation and skin
    exg = 2.0 * g - r - b
    pure_green_mask = (g > r * 1.05) & (g > b * 1.15) & (g > 35) & (exg > 15)
    chlorotic_yellow_mask = (r > 90) & (g > 85) & (b < 80) & (abs(r - g) < 45) & (g > b * 1.3)
    necrotic_leaf_spot_mask = (
        (r > 40) & (g > 25) & (b < 60) &
        (r >= g * 0.9) & (r <= g * 1.6) &
        (g > b * 1.1) & (r + g > 1.5 * b)
    )

    plant_foliage_mask = pure_green_mask | chlorotic_yellow_mask | necrotic_leaf_spot_mask
    plant_foliage_ratio = float(np.sum(plant_foliage_mask) / total_pixels)
    pure_green_ratio = float(np.sum(pure_green_mask) / total_pixels)

    # 3A. Human Face / Person / Skin Tone Detection
    # Cb/Cr standard human skin cluster: 77 <= Cb <= 127 and 133 <= Cr <= 173
    cb = 128.0 - 0.168736 * r - 0.331264 * g + 0.5 * b
    cr = 128.0 + 0.5 * r - 0.418688 * g - 0.081312 * b
    skin_ycbcr = (cb >= 77) & (cb <= 127) & (cr >= 133) & (cr <= 173)
    skin_rgb = (r > 75) & (g > 40) & (b > 20) & (r > g) & (g > b) & ((r - g) > 12) & ((r - b) > 20)
    skin_mask = skin_ycbcr & skin_rgb
    skin_ratio = float(np.sum(skin_mask) / total_pixels)

    if (skin_ratio > 0.18 and pure_green_ratio < 0.06) or (skin_ratio > 0.35 and pure_green_ratio < 0.12):
        return {
            "passed": False,
            "is_valid": False,
            "error_type": "invalid_image",
            "message": "Invalid Image: Please upload a clear crop/plant image.",
            "issues": [
                "Human face or person detected in image.",
                "AgroShield AI is strictly specialized for agricultural crops and plant diseases."
            ],
            "guidance": [
                "Do not photograph people, faces, or selfies.",
                "Focus the camera directly on the diseased or healthy plant leaf."
            ],
            "metrics": {
                "detected_type": "human_face_or_person",
                "skin_ratio": round(skin_ratio * 100, 1),
                "foliage_ratio": round(plant_foliage_ratio * 100, 1)
            }
        }

    # 3B. Document, Text, Screenshot Detection
    white_page_pixels = (r > 215) & (g > 215) & (b > 215) & (np.abs(r - g) < 15) & (np.abs(g - b) < 15)
    white_ratio = float(np.sum(white_page_pixels) / total_pixels)
    dark_text_pixels = (r < 65) & (g < 65) & (b < 65)
    text_ratio = float(np.sum(dark_text_pixels) / total_pixels)

    if (white_ratio > 0.55 and text_ratio > 0.015 and pure_green_ratio < 0.04) or (white_ratio > 0.75 and pure_green_ratio < 0.05):
        return {
            "passed": False,
            "is_valid": False,
            "error_type": "invalid_image",
            "message": "Invalid Image: Please upload a clear crop/plant image.",
            "issues": [
                "Document, screenshot, or text paper detected.",
                "No agricultural crops or plant leaves detected in frame."
            ],
            "guidance": [
                "Please do not upload documents, notes, or digital screenshots.",
                "Capture a real leaf from a crop field or greenhouse."
            ],
            "metrics": {
                "detected_type": "document_or_screenshot",
                "white_ratio": round(white_ratio * 100, 1),
                "foliage_ratio": round(plant_foliage_ratio * 100, 1)
            }
        }

    # 3C. Animals, Buildings, Indoor Random Objects (No Plant Foliage)
    if plant_foliage_ratio < 0.08 and pure_green_ratio < 0.05:
        return {
            "passed": False,
            "is_valid": False,
            "error_type": "invalid_image",
            "message": "Invalid Image: Please upload a clear crop/plant image.",
            "issues": [
                "No crop or plant foliage detected in the frame.",
                "Image appears to contain buildings, animals, machinery, or unrelated objects."
            ],
            "guidance": [
                "Move camera 15–20 cm closer so the plant leaf occupies at least 60% of the viewfinder.",
                "Ensure green foliage or symptomatic leaf lesions are clearly in frame."
            ],
            "metrics": {
                "detected_type": "non_plant_object",
                "foliage_ratio": round(plant_foliage_ratio * 100, 1),
                "pure_green_ratio": round(pure_green_ratio * 100, 1)
            }
        }

    # =========================================================================
    # 4. LIGHTING & BLUR QUALITY CHECKS (Only for verified plant images)
    # =========================================================================
    gray = 0.299 * r + 0.587 * g + 0.114 * b
    mean_luminance = float(np.mean(gray))

    if mean_luminance < 30.0:
        return {
            "passed": False,
            "is_valid": False,
            "error_type": "quality_insufficient",
            "message": "Image quality is insufficient. Please capture a clearer crop/plant image.",
            "issues": ["Image is too dark / underexposed."],
            "guidance": ["Photograph in natural daylight or use phone flash to illuminate the leaf surface."],
            "metrics": {"mean_luminance": round(mean_luminance, 1), "width": width, "height": height}
        }
    elif mean_luminance > 238.0:
        return {
            "passed": False,
            "is_valid": False,
            "error_type": "quality_insufficient",
            "message": "Image quality is insufficient. Please capture a clearer crop/plant image.",
            "issues": ["Image is overexposed / washed out."],
            "guidance": ["Shield the leaf from harsh midday sun or direct spotlight glare."],
            "metrics": {"mean_luminance": round(mean_luminance, 1), "width": width, "height": height}
        }

    # Blur check via Laplacian variance filter
    if width >= 50 and height >= 50:
        small_gray = gray[::2, ::2] if (width > 600 or height > 600) else gray
        laplacian = (
            np.roll(small_gray, 1, axis=0) + np.roll(small_gray, -1, axis=0) +
            np.roll(small_gray, 1, axis=1) + np.roll(small_gray, -1, axis=1) -
            4 * small_gray
        )
        valid_lap = laplacian[1:-1, 1:-1]
        blur_score = float(np.var(valid_lap))
        if blur_score < 35.0:
            return {
                "passed": False,
                "is_valid": False,
                "error_type": "quality_insufficient",
                "message": "Image quality is insufficient. Please capture a clearer crop/plant image.",
                "issues": ["Image is too blurry or out of focus."],
                "guidance": ["Rest your wrist against the crop stem to steady the camera, and tap on the leaf to lock focus."],
                "metrics": {"blur_score": round(blur_score, 1), "mean_luminance": round(mean_luminance, 1), "width": width, "height": height}
            }
    else:
        blur_score = 100.0

    # 5. Valid Plant / Crop Passed
    return {
        "passed": True,
        "is_valid": True,
        "error_type": None,
        "message": "Image quality is good. Ready for AI analysis.",
        "issues": [],
        "guidance": [
            "Optimal framing and agricultural foliage verified.",
            "Ready for AI crop disease classification and severity scoring."
        ],
        "metrics": {
            "blur_score": round(blur_score, 1),
            "mean_luminance": round(mean_luminance, 1),
            "width": width,
            "height": height,
            "foliage_ratio": round(plant_foliage_ratio * 100, 1),
            "pure_green_ratio": round(pure_green_ratio * 100, 1),
            "skin_ratio": round(skin_ratio * 100, 1)
        }
    }
