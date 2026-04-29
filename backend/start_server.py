#!/usr/bin/env python3
"""
Simple script to start the FastAPI server for waste classification
"""
import uvicorn
import os

if __name__ == "__main__":
    # Change to backend directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    print("Starting Waste Classification API Server...")
    print("Server will be available at: http://localhost:8000")
    print("API endpoint: http://localhost:8000/scan")
    print("Press Ctrl+C to stop the server")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )