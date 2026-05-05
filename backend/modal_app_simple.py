"""
Simplified Modal deployment - Lighter version
Deploy with: modal deploy modal_app_simple.py
"""
import modal
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import random
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create Modal app
app = modal.App(name="waste-api-simple")

# Lightweight image
image = modal.Image.debian_slim().pip_install(
    "fastapi==0.104.1",
    "uvicorn[standard]==0.24.0",
    "python-multipart==0.0.6",
    "Pillow==10.1.0",
)

class_names = ['cardboard', 'glass', 'metal', 'paper', 'plastic', 'trash']

@app.function(image=image, timeout=30)
@modal.asgi_app()
def api():
    web_app = FastAPI(title="Waste Classification API", version="1.0.0")
    
    web_app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    @web_app.get("/")
    async def root():
        return {
            "message": "Waste Classification API",
            "version": "1.0.0",
            "endpoints": {
                "scan": "/scan (POST)",
                "health": "/health (GET)"
            }
        }
    
    @web_app.get("/health")
    async def health():
        return {"status": "ok"}
    
    @web_app.post("/scan")
    async def scan(file: UploadFile = File(...)):
        try:
            if not file.content_type or not file.content_type.startswith('image/'):
                raise HTTPException(status_code=400, detail="Must be an image")
            
            await file.read()
            
            # Mock detection
            detections = []
            for _ in range(random.randint(1, 3)):
                detections.append({
                    "label": random.choice(class_names),
                    "confidence": round(random.uniform(0.85, 0.99), 3),
                    "bbox": [
                        random.randint(50, 300),
                        random.randint(50, 300),
                        random.randint(300, 500),
                        random.randint(300, 500)
                    ]
                })
            
            return {
                "filename": file.filename,
                "detections": detections,
                "detection_count": len(detections)
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    return web_app
