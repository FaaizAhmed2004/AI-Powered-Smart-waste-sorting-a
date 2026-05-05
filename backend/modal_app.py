"""
Modal deployment for Waste Classification API
Deploy with: modal deploy modal_app.py
"""
import modal
import os
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import cv2
from PIL import Image
import io
import logging
import random

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Define Modal app
app = modal.App(name="waste-classification-api")

# Define image with dependencies (simplified)
image = (
    modal.Image.debian_slim()
    .apt_install("build-essential")  # Add build tools
    .pip_install(
        "fastapi",
        "uvicorn[standard]",
        "python-multipart",
        "Pillow",
        "numpy",
        "opencv-python-headless",  # Use headless version
        "torch",
        "torchvision",
        "ultralytics",
    )
)

# Class names
class_names = ['cardboard', 'glass', 'metal', 'paper', 'plastic', 'trash']

# Initialize FastAPI app
@app.function(
    image=image,
    timeout=60,
    memory=1024,  # 1GB RAM (reduced)
    # gpu="T4",  # Commented out - enable if needed
)
@modal.asgi_app()
def fastapi_app():
    web_app = FastAPI(title="Waste Detection API", version="1.0.0")
    
    # CORS middleware
    web_app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Modal provides CORS by default
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Load model on startup (simplified)
    try:
        from ultralytics import YOLO
        
        # Check for custom model first
        if os.path.exists("waste_detector.pt"):
            model = YOLO("waste_detector.pt")
            USE_WASTE_MODEL = True
            logger.info("✅ Custom waste detection model loaded")
        else:
            # Use mock detection for now
            logger.info("ℹ️ Using mock detection (no custom model found)")
            model = None
            USE_WASTE_MODEL = False
        
        USE_MOCK = not USE_WASTE_MODEL
    except Exception as e:
        logger.warning(f"⚠️ Model loading failed: {e}, using mock detection")
        model = None
        USE_WASTE_MODEL = False
        USE_MOCK = True
    
    @web_app.get("/")
    async def root():
        return {
            "message": "Waste Classification API",
            "version": "1.0.0",
            "status": "running on Modal",
            "model_status": "loaded" if USE_WASTE_MODEL else "mock (model not found)",
            "endpoints": {
                "scan": "/scan - POST - Upload image for classification",
                "health": "/health - GET - Health check"
            }
        }
    
    @web_app.get("/health")
    async def health():
        return {
            "status": "healthy",
            "model_loaded": USE_WASTE_MODEL,
            "using_mock": USE_MOCK,
            "model_type": "custom" if USE_WASTE_MODEL else ("yolov8n" if not USE_MOCK else "mock")
        }
    
    @web_app.post("/scan")
    async def scan(file: UploadFile = File(...)):
        try:
            # Validate file type
            if not file.content_type or not file.content_type.startswith('image/'):
                raise HTTPException(status_code=400, detail="File must be an image")
            
            # Read image bytes
            img_bytes = await file.read()
            logger.info(f"Processing image: {file.filename}, size: {len(img_bytes)} bytes")
            
            if USE_MOCK:
                # Mock detection for testing when model is not available
                logger.info("Using mock detection")
                detections = []
                
                # Generate 1-3 random detections with HIGH confidence
                num_detections = random.randint(1, 3)
                for _ in range(num_detections):
                    label = random.choice(class_names)
                    confidence = random.uniform(0.95, 0.99)
                    x1 = random.randint(50, 300)
                    y1 = random.randint(50, 200)
                    x2 = x1 + random.randint(100, 200)
                    y2 = y1 + random.randint(100, 200)
                    img_area = 640 * 480
                    area = float((x2 - x1) * (y2 - y1))
                    area_ratio = float(area / img_area)
                    
                    detections.append({
                        "label": label,
                        "confidence": float(confidence),
                        "bbox": [float(x1), float(y1), float(x2), float(y2)],
                        "areaRatio": area_ratio,
                    })
                
                logger.info(f"Mock detected {len(detections)} objects")
            else:
                # Real model inference
                image = Image.open(io.BytesIO(img_bytes))
                results = model(image)
                detections = []
                
                for result in results:
                    for box in result.boxes:
                        # Use model class names if available, otherwise use our waste classes
                        if hasattr(model, 'names') and model.names:
                            class_name = model.names[int(box.cls)]
                        else:
                            class_name = class_names[int(box.cls)] if int(box.cls) < len(class_names) else "unknown"
                        
                        detection = {
                            "label": class_name,
                            "confidence": float(box.conf),
                            "bbox": [float(x) for x in box.xyxy[0].tolist()],
                        }
                        detections.append(detection)
                
                logger.info(f"Detected {len(detections)} objects with real model")
            
            return {
                "filename": file.filename,
                "detections": detections,
                "detection_count": len(detections),
                "status": "success"
            }
        
        except Exception as e:
            logger.error(f"Error processing image: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")
    
    return web_app
