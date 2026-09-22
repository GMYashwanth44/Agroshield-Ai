# AgroShield AI Model Directory

This directory is the designated location for trained deep-learning models (e.g., MobileNetV2, EfficientNet, ResNet50) for agricultural crop disease classification and segmentation.

## Supported Formats:
- **ONNX Models**: `model.onnx` or `plant_disease_model.onnx`
- **TensorFlow Lite Models**: `model.tflite`
- **PyTorch Weights**: `model.pt`

## Loading Behavior:
1. When a trained model file (such as `model.onnx`) is placed in this directory, `DiseaseModelAdapter` will automatically load and run hardware-accelerated neural inference.
2. If no trained weights file is present, `DiseaseModelAdapter` runs the feature-based computer-vision botanical analysis engine (extracting foliar chlorophyll ratios, necrotic lesion distribution, chlorotic halos, and textural entropy).
3. If confidence is below the configured threshold (default 70%), the system automatically outputs:
   - Crop: `"Unknown / Unclear Crop"`
   - Disease: `"Unknown / Low Confidence"`
   - Status: `"low_confidence"`
   - Recommendation: `"Please upload a clearer image or consult an agricultural expert."`
4. The system never claims 100% accuracy and always presents the statutory advisory notice:
   *"AI-assisted screening. Confirm uncertain cases with an agricultural expert."*
