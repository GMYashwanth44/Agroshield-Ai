import io
from typing import Dict, Any, List
import numpy as np
from PIL import Image

def check_image_quality(image_bytes: bytes, filename: str = "upload.jpg") -> dict:
    """
    Validates:
    - File size
    - Resolution
    - Blur (Laplacian variance approximation)
    - Lighting (mean luminance & over/underexposure)
    - Leaf visibility (green/yellow/brown vegetation pixel ratio)
    Provides actionable framing, distance, and lighting guidance for farmers.
    """
    issues = []
    guidance = []
    
    # 1. Size check (< 10MB, > 5KB)
    size_kb = len(image_bytes) / 1024
    if size_kb < 5:
        issues.append("File size is too small. Please upload an original camera photo.")
        guidance.append("Use standard camera mode instead of low-resolution messenger thumbnails.")
    elif size_kb > 10 * 1024:
        issues.append("File size exceeds 10MB limit.")
        guidance.append("Crop the surrounding background to reduce file weight.")

    try:
        pil_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception:
        return {
            "passed": False,
            "is_valid": False,
            "message": "Invalid or corrupted image format. Please upload JPEG, PNG, or WebP.",
            "issues": ["Corrupted image file"],
            "guidance": ["Take a fresh photo directly using the phone camera."],
            "metrics": {}
        }

    width, height = pil_img.size
    
    # 2. Resolution check
    if width < 150 or height < 150:
        issues.append("Resolution is too low (minimum 150x150 pixels required).")
        guidance.append("Ensure camera zoom is set to 1x and take photo closer to leaf.")
    
    img_array = np.array(pil_img)
    
    # 3. Lighting check via Luminance (Y = 0.299R + 0.587G + 0.114B)
    gray = (0.299 * img_array[:, :, 0] + 0.587 * img_array[:, :, 1] + 0.114 * img_array[:, :, 2]).astype(np.float32)
    mean_luminance = float(np.mean(gray))
    
    if mean_luminance < 35.0:
        issues.append("Image is too dark / underexposed.")
        guidance.append("Move to diffused natural daylight or hold a white paper beneath the leaf as a bounce reflector.")
    elif mean_luminance > 225.0:
        issues.append("Image is overexposed / washed out.")
        guidance.append("Shield the leaf from harsh direct midday sun using your hand or hat to eliminate glare.")

    # 4. Blur check via Laplacian variance filter
    if width >= 50 and height >= 50:
        small_gray = gray[::2, ::2] if (width > 600 or height > 600) else gray
        laplacian = (
            np.roll(small_gray, 1, axis=0) + np.roll(small_gray, -1, axis=0) +
            np.roll(small_gray, 1, axis=1) + np.roll(small_gray, -1, axis=1) -
            4 * small_gray
        )
        valid_lap = laplacian[1:-1, 1:-1]
        blur_score = float(np.var(valid_lap))
        if blur_score < 45.0:
            issues.append("Image is too blurry or out of focus.")
            guidance.append("Rest your wrist against the crop stem to steady the camera, and tap on the leaf lesion to lock focus.")
    else:
        blur_score = 100.0

    # 5. Leaf visibility / vegetation check
    r = img_array[:, :, 0].astype(np.float32)
    g = img_array[:, :, 1].astype(np.float32)
    b = img_array[:, :, 2].astype(np.float32)
    
    green_mask = (g > r * 0.9) & (g > b * 1.1) & (g > 30)
    brown_spot_mask = (r > 60) & (g > 35) & (b < 80) & (r >= g) & (g > b)
    foliage_ratio = float(np.sum(green_mask | brown_spot_mask) / (width * height))

    if foliage_ratio < 0.12:
        issues.append("Plant leaf is not centered or too far away in the frame.")
        guidance.append("Move camera 15–20 cm closer so the symptomatic leaf occupies at least 60% of the viewfinder.")

    is_valid = len(issues) == 0
    if is_valid:
        guidance.append("Optimal framing and lighting detected for high-accuracy feature segmentation.")

    message = (
        "Image quality is good. Ready for AI analysis."
        if is_valid
        else "Quality check: " + "; ".join(issues)
    )

    return {
        "passed": is_valid,
        "is_valid": is_valid,
        "message": message,
        "issues": issues,
        "guidance": guidance,
        "metrics": {
            "width": width,
            "height": height,
            "mean_luminance": round(mean_luminance, 1),
            "blur_score": round(blur_score, 1),
            "foliage_ratio": round(foliage_ratio * 100, 1)
        }
    }
