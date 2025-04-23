import os
import time
import json
import asyncio
import logging
from typing import Dict, Optional, List
from datetime import datetime
import traceback

import cv2
import numpy as np
from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, Query, BackgroundTasks
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.openapi.utils import get_openapi
from pydantic import BaseModel

from detection import sample_cycle, detector
from optimizer import optimizer

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("main")

# Create directory for app data if needed
os.makedirs("app_data", exist_ok=True)

# Initialize FastAPI app with metadata
app = FastAPI(
    title="Traffic Management System API",
    description="Backend API for monitoring and optimizing traffic flow",
    version="1.0.0"
)

# Define data models for API
class TrafficData(BaseModel):
    count: int
    emergency: bool
    image: str

class TrafficResponse(BaseModel):
    lanes: Dict[str, TrafficData]
    signal_times: Dict[str, int]
    timestamp: str

# 🛡️ CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dynamic camera sources - can be modified at runtime
camera_sources = {
    "North": "videos/north.mp4",
    "South": "videos/south.mp4",
    "East":  "videos/east.mp4",
    "West":  "videos/west.mp4",
}

# Track active clients for cleanup
active_clients = set()
stop_event = asyncio.Event()

# Background polling task to prevent heavy CPU usage
async def traffic_poll_task():
    """Background task that polls traffic data periodically."""
    try:
        while not stop_event.is_set():
            # Get current data - this is CPU intensive
            try:
                data = sample_cycle(camera_sources)
                timings = optimizer.compute_green_time(data)
                
                # Cache the results
                cache = {
                    "lanes": data,
                    "signal_times": timings,
                    "timestamp": datetime.now().strftime("%H:%M:%S"),
                    "cached_at": time.time()
                }
                # Store in global variable for access by endpoints
                app.state.traffic_cache = cache
                
            except Exception as e:
                logger.error(f"Error in traffic polling: {e}")
                traceback.print_exc()
                
            # Wait before next poll - adjust timing as needed
            await asyncio.sleep(1.5)
    except Exception as e:
        logger.error(f"Traffic polling task error: {e}")
        traceback.print_exc()



@app.on_event("startup")
async def startup_event():
    """Initialize app state and start background tasks."""
    # Initialize cache
    app.state.traffic_cache = {
        "lanes": {},
        "signal_times": {},
        "timestamp": datetime.now().strftime("%H:%M:%S"),
        "cached_at": time.time(),
        "startup_time": time.time()
    }
    
    # Start background polling task
    app.state.background_task = asyncio.create_task(traffic_poll_task())
    logger.info("Traffic Management System API started")



@app.on_event("shutdown")
async def shutdown_event():
    """Clean up resources on shutdown."""
    logger.info("Shutting down Traffic Management System API")
    stop_event.set()
    if hasattr(app.state, 'background_task'):
        app.state.background_task.cancel()
        try:
            await app.state.background_task
        except asyncio.CancelledError:
            pass
    logger.info("Resources cleaned up")



@app.get("/traffic_feed")
async def traffic_feed():
    """
    Server-sent events endpoint for real-time traffic data.
    Returns traffic counts, emergency vehicle presence, and optimized signal timings.
    """
    client_id = id(time.time())
    active_clients.add(client_id)
    
    async def stream():
        try:
            while True:
                # Get data from cache instead of direct polling
                cache = app.state.traffic_cache
                
                payload = {
                    "lanes": cache["lanes"],
                    "signal_times": cache["signal_times"],
                    "timestamp": cache["timestamp"]
                }
                yield f"data: {json.dumps(payload)}\n\n"
                
                # Delay between updates
                await asyncio.sleep(1.0)
        except Exception as e:
            logger.error(f"Stream error for client {client_id}: {e}")
        finally:
            # Clean up client
            if client_id in active_clients:
                active_clients.remove(client_id)
                
    return StreamingResponse(
        stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )



@app.post("/upload_image")
async def upload_image(file: UploadFile = File(...)):
    """
    Analyze a traffic image uploaded by the user.
    Returns vehicle count, emergency vehicle presence, and annotated image.
    """
    try:
        # Read image file
        contents = await file.read()
        if not contents:
            raise HTTPException(status_code=400, detail="Empty file")
            
        # Convert to OpenCV format
        npimg = np.frombuffer(contents, np.uint8)
        frame = cv2.imdecode(npimg, cv2.IMREAD_COLOR)
        
        if frame is None:
            raise HTTPException(status_code=400, detail="Invalid image format")
            
        # Process the image
        count, emergency, image = detector.detect_objects(frame)
        
        return JSONResponse({
            "count": count,
            "emergency": emergency,
            "image": image
        })
    except Exception as e:
        logger.error(f"Error processing uploaded image: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Image processing error: {str(e)}")

@app.get("/camera_sources")
async def get_camera_sources():
    """
    Get the current camera sources configuration.
    """
    return JSONResponse(camera_sources)

@app.post("/camera_sources")
async def update_camera_sources(sources: Dict[str, str]):
    """
    Update the camera sources configuration.
    Requires a dictionary mapping lane names to video file paths.
    """
    global camera_sources
    try:
        # Validate sources
        for lane, path in sources.items():
            if not os.path.exists(path):
                return JSONResponse({
                    "status": "warning",
                    "message": f"Source file for {lane} not found: {path}",
                    "updated": False
                }, status_code=400)
                
        # Update sources
        camera_sources = sources
        return JSONResponse({
            "status": "success",
            "message": "Camera sources updated",
            "sources": camera_sources
        })
    except Exception as e:
        logger.error(f"Error updating camera sources: {e}")
        return JSONResponse({
            "status": "error",
            "message": f"Failed to update camera sources: {str(e)}",
            "updated": False
        }, status_code=500)



@app.get("/health")
async def health_check():
    """
    Health check endpoint for monitoring system status.
    """
    # Check detector
    detector_status = "ok"
    try:
        # Simple detection on a dummy image
        dummy = np.zeros((100, 100, 3), dtype=np.uint8)
        detector.detect_objects(dummy)
    except Exception as e:
        detector_status = f"error: {str(e)}"
    
    # Check video sources
    sources_status = {}
    for lane, src in camera_sources.items():
        if not os.path.exists(src):
            sources_status[lane] = "file not found"
            continue
            
        try:
            cap = cv2.VideoCapture(src)
            if cap.isOpened():
                sources_status[lane] = "ok"
                cap.release()
            else:
                sources_status[lane] = "cannot open"
        except Exception as e:
            sources_status[lane] = f"error: {str(e)}"
    
    return {
        "status": "running",
        "uptime": time.time() - app.state.traffic_cache.get("startup_time", time.time()),
        "detector": detector_status,
        "sources": sources_status,
        "active_clients": len(active_clients),
        "timestamp": datetime.now().isoformat()
    }

@app.get("/metrics")
async def get_metrics():
    """
    Get system performance metrics.
    """
    # Get frame processing times from detector if available
    return {
        "active_connections": len(active_clients),
        "cache_age_seconds": time.time() - app.state.traffic_cache.get("cached_at", time.time()),
        "timestamp": datetime.now().isoformat()
    }

# ────────────────────────────────────────────────────────────
# Serve your new frontend as static *after* all API routes

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
NEW_FRONTEND_DIR = os.path.join(BASE_DIR, "new_frontend")
FRONTEND_BUILD_DIR = os.path.join(NEW_FRONTEND_DIR, "out")  # Next.js static export directory

# Check if frontend build directory exists
if os.path.isdir(FRONTEND_BUILD_DIR):
    app.mount(
        "/", 
        StaticFiles(directory=FRONTEND_BUILD_DIR, html=True), 
        name="frontend"
    )
    logger.info(f"Serving frontend from: {FRONTEND_BUILD_DIR}")
else:
    logger.warning(f"Frontend build directory not found: {FRONTEND_BUILD_DIR}")
    logger.info("Checking for development frontend directory...")
    
    # Check if we can serve the development frontend directory
    if os.path.isdir(NEW_FRONTEND_DIR):
        logger.info(f"Found development frontend directory: {NEW_FRONTEND_DIR}")
        logger.info("To serve the frontend, build it with 'npm run build && npm run export'")
        
    # Create a simple default page
    @app.get("/")
    async def default_page():
        return {
            "message": "Traffic Management System API",
            "docs_url": "/docs",
            "status": "Frontend build not found, API only mode",
            "setup_instructions": "Run 'cd new_frontend && npm run build && npm run export' to build the frontend"
        }

# Customize OpenAPI docs
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
        
    openapi_schema = get_openapi(
        title="Traffic Management System API",
        version="1.0.0",
        description="API for traffic monitoring and signal optimization",
        routes=app.routes,
    )
    
    # Add custom documentation
    openapi_schema["info"]["x-logo"] = {
        "url": "https://example.com/logo.png"
    }
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema
    
app.openapi = custom_openapi

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
